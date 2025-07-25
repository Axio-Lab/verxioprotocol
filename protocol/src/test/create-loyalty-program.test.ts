import { generateSigner, keypairIdentity } from '@metaplex-foundation/umi'
import { beforeAll, describe, expect, it } from 'vitest'
import {
  createTestLoyaltyProgramConfig,
  createTestLoyaltyProgramConfigEmpty,
} from './helpers/create-test-loyalty-program'
import { getTestContext } from './helpers/get-test-context'
import { ensureFeePayerBalance } from './helpers/ensure-fee-payer-balance'
import { createLoyaltyProgram, CreateLoyaltyProgramConfig } from '../lib/create-loyalty-program'
import { FEES } from '../utils/fee-structure'

const { feePayer, context } = getTestContext()

describe('create-loyalty-program', { sequential: true, timeout: 30000 }, () => {
  beforeAll(async () => {
    // Ensure we have enough sol for both the collection creation and the fee
    await ensureFeePayerBalance(context.umi, {
      account: feePayer.publicKey,
      amount: 1 + FEES.CREATE_LOYALTY_PROGRAM,
    })
    context.umi.use(keypairIdentity(feePayer))
  })

  describe('expected usage', () => {
    it('should create a new loyalty program with a generated collection signer and pay the fee', async () => {
      expect.assertions(4)
      // ARRANGE
      const config = createTestLoyaltyProgramConfig(
        {
          programAuthority: context.programAuthority,
          metadata: {
            organizationName: 'Test Host',
          },
        },
        context.umi,
      )

      // ACT
      const result = await createLoyaltyProgram(context, config)

      // ASSERT
      expect(result).toBeTruthy()
      expect(result.collection).toBeTruthy()
      expect(result.signature).toBeTruthy()
      // Verify the transaction signature format (base58 string between 86-88 characters)
      expect(result.signature).toMatch(/^[1-9A-HJ-NP-Za-km-z]{86,88}$/)
    })

    it('should create a new loyalty program with a provided collection signer', async () => {
      expect.assertions(4)
      // ARRANGE
      const collectionSigner = generateSigner(context.umi)
      const config: CreateLoyaltyProgramConfig = createTestLoyaltyProgramConfig(
        {
          collectionSigner,
          programAuthority: context.programAuthority,
          metadata: {
            organizationName: 'Test Host',
          },
        },
        context.umi,
      )
      // ACT
      const result = await createLoyaltyProgram(context, config)

      // ASSERT
      expect(result).toBeTruthy()
      expect(result.collection).toBeTruthy()
      expect(result.signature).toBeTruthy()
      expect(result.collection.publicKey).toEqual(collectionSigner.publicKey)
    })

    it('should create a new loyalty program with a provided update authority', async () => {
      expect.assertions(5)
      // ARRANGE
      const updateAuthority = generateSigner(context.umi)
      const config: CreateLoyaltyProgramConfig = createTestLoyaltyProgramConfig(
        {
          programAuthority: context.programAuthority,
          updateAuthority,
          metadata: {
            organizationName: 'Test Host',
          },
        },
        context.umi,
      )
      // ACT
      const result = await createLoyaltyProgram(context, config)

      // ASSERT
      expect(result).toBeTruthy()
      expect(result.collection).toBeTruthy()
      expect(result.signature).toBeTruthy()
      expect(result.updateAuthority).toBeTruthy()
      expect(result.updateAuthority?.publicKey).toEqual(updateAuthority.publicKey)
    })
  })

  describe('unexpected usage', () => {
    describe('config validation', () => {
      it('should throw an error if the name is not set', async () => {
        expect.assertions(2)
        // ARRANGE
        const brokenConfig: CreateLoyaltyProgramConfig = createTestLoyaltyProgramConfigEmpty(
          {
            loyaltyProgramName: '',
          },
          context.umi,
        )

        // ACT
        try {
          await createLoyaltyProgram(context, brokenConfig)
        } catch (error) {
          // ASSERT
          expect(error).toBeDefined()
          expect(error.message).toEqual('assertValidCreateLoyaltyProgramConfig: Loyalty program name is undefined')
        }
      })

      it('should throw an error if the metadata URI is not set', async () => {
        expect.assertions(2)
        // ARRANGE
        const brokenConfig: CreateLoyaltyProgramConfig = createTestLoyaltyProgramConfigEmpty(
          {
            loyaltyProgramName: 'Test Loyalty Program',
          },
          context.umi,
        )

        // ACT
        try {
          await createLoyaltyProgram(context, brokenConfig)
        } catch (error) {
          // ASSERT
          expect(error).toBeDefined()
          expect(error.message).toEqual(
            'assertValidCreateLoyaltyProgramConfig: Image buffer is required when metadataUri is not provided',
          )
        }
      })

      it('should throw an error if the metadata URI is not a valid URL', async () => {
        expect.assertions(2)
        // ARRANGE
        const brokenConfig: CreateLoyaltyProgramConfig = createTestLoyaltyProgramConfigEmpty(
          {
            loyaltyProgramName: 'Test Loyalty Program',
            metadataUri: 'foobar',
          },
          context.umi,
        )

        // ACT
        try {
          await createLoyaltyProgram(context, brokenConfig)
        } catch (error) {
          // ASSERT
          expect(error).toBeDefined()
          expect(error.message).toEqual('assertValidCreateLoyaltyProgramConfig: Metadata URI is not a valid URL')
        }
      })

      it('should throw an error if the program authority is not set', async () => {
        expect.assertions(2)
        // ARRANGE
        const brokenConfig: CreateLoyaltyProgramConfig = createTestLoyaltyProgramConfigEmpty(
          {
            loyaltyProgramName: 'Test Loyalty Program',
            metadataUri: 'https://arweave.net/123abc',
            programAuthority: undefined,
          },
          context.umi,
        )

        // ACT
        try {
          await createLoyaltyProgram(context, brokenConfig)
        } catch (error) {
          // ASSERT
          expect(error).toBeDefined()
          expect(error.message).toEqual('assertValidCreateLoyaltyProgramConfig: Program authority is undefined')
        }
      })

      it('should throw an error if the tiers are not set', async () => {
        expect.assertions(2)
        // ARRANGE
        const brokenConfig: CreateLoyaltyProgramConfig = createTestLoyaltyProgramConfigEmpty(
          {
            loyaltyProgramName: 'Test Loyalty Program',
            metadataUri: 'https://arweave.net/123abc',
            programAuthority: context.programAuthority,
          },
          context.umi,
        )

        // ACT
        try {
          await createLoyaltyProgram(context, {
            ...brokenConfig,
            tiers: undefined,
          } as unknown as CreateLoyaltyProgramConfig)
        } catch (error) {
          // ASSERT
          expect(error).toBeDefined()
          expect(error.message).toEqual('assertValidCreateLoyaltyProgramConfig: Tiers configuration is missing')
        }
      })

      it('should throw an error if the tiers are empty', async () => {
        expect.assertions(2)
        // ARRANGE
        const brokenConfig: CreateLoyaltyProgramConfig = createTestLoyaltyProgramConfigEmpty(
          {
            loyaltyProgramName: 'Test Loyalty Program',
            metadataUri: 'https://arweave.net/123abc',
            programAuthority: context.programAuthority,
            tiers: [],
          },
          context.umi,
        )

        // ACT
        try {
          await createLoyaltyProgram(context, brokenConfig)
        } catch (error) {
          // ASSERT
          expect(error).toBeDefined()
          expect(error.message).toEqual('assertValidCreateLoyaltyProgramConfig: Tiers configuration is missing')
        }
      })

      it('should throw an error if the points per action are not set', async () => {
        expect.assertions(2)
        // ARRANGE
        const brokenConfig: CreateLoyaltyProgramConfig = createTestLoyaltyProgramConfigEmpty(
          {
            loyaltyProgramName: 'Test Loyalty Program',
            metadataUri: 'https://arweave.net/123abc',
            programAuthority: context.programAuthority,
            tiers: [{ name: 'Grind', xpRequired: 0, rewards: ['nothing for you!'] }],
          },
          context.umi,
        )

        // ACT
        try {
          await createLoyaltyProgram(context, {
            ...brokenConfig,
            pointsPerAction: undefined,
          } as unknown as CreateLoyaltyProgramConfig)
        } catch (error) {
          // ASSERT
          expect(error).toBeDefined()
          expect(error.message).toEqual(
            'assertValidCreateLoyaltyProgramConfig: Points per action configuration is missing',
          )
        }
      })

      it('should throw an error if the points per action must not be empty', async () => {
        expect.assertions(2)
        // ARRANGE
        const brokenConfig: CreateLoyaltyProgramConfig = createTestLoyaltyProgramConfigEmpty(
          {
            loyaltyProgramName: 'Test Loyalty Program',
            metadataUri: 'https://arweave.net/123abc',
            programAuthority: context.programAuthority,
            tiers: [{ name: 'Grind', xpRequired: 0, rewards: ['nothing for you!'] }],
            pointsPerAction: {},
          },
          context.umi,
        )

        // ACT
        try {
          await createLoyaltyProgram(context, brokenConfig)
        } catch (error) {
          // ASSERT
          expect(error).toBeDefined()
          expect(error.message).toEqual(
            'assertValidCreateLoyaltyProgramConfig: Points per action configuration is missing',
          )
        }
      })

      it('should throw an error if metadata is not set', async () => {
        expect.assertions(2)
        // ARRANGE
        const brokenConfig = createTestLoyaltyProgramConfigEmpty(
          {
            loyaltyProgramName: 'Test Loyalty Program',
            metadataUri: 'https://arweave.net/123abc',
            programAuthority: context.programAuthority,
            tiers: [{ name: 'Grind', xpRequired: 0, rewards: ['nothing for you!'] }],
            pointsPerAction: { swap: 600 },
          },
          context.umi,
        )

        // ACT
        try {
          await createLoyaltyProgram(context, {
            ...brokenConfig,
            metadata: undefined,
          } as unknown as CreateLoyaltyProgramConfig)
        } catch (error) {
          // ASSERT
          expect(error).toBeDefined()
          expect(error.message).toEqual('assertValidCreateLoyaltyProgramConfig: Metadata is undefined')
        }
      })

      it('should throw an error if organizationName is not set in metadata', async () => {
        expect.assertions(2)
        // ARRANGE
        const brokenConfig = createTestLoyaltyProgramConfigEmpty(
          {
            loyaltyProgramName: 'Test Loyalty Program',
            metadataUri: 'https://arweave.net/123abc',
            programAuthority: context.programAuthority,
            tiers: [{ name: 'Grind', xpRequired: 0, rewards: ['nothing for you!'] }],
            pointsPerAction: { swap: 600 },
            metadata: {
              organizationName: '',
            },
          },
          context.umi,
        )

        // ACT
        try {
          await createLoyaltyProgram(context, brokenConfig)
        } catch (error) {
          // ASSERT
          expect(error).toBeDefined()
          expect(error.message).toEqual('assertValidCreateLoyaltyProgramConfig: Organization name is undefined')
        }
      })
    })
  })
})
