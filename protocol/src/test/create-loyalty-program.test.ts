import { generateSigner, keypairIdentity } from '@metaplex-foundation/umi'
import { beforeAll, describe, expect, it } from 'vitest'
import {
  createTestLoyaltyProgramConfig,
  createTestLoyaltyProgramConfigEmpty,
} from './helpers/create-test-loyalty-program'
import { getTestContext } from './helpers/get-test-context'
import { ensureFeePayerBalance } from './helpers/ensure-fee-payer-balance'
import { createLoyaltyProgram, CreateLoyaltyProgramConfig } from '../lib/create-loyalty-program'

const { feePayer, context } = getTestContext()

describe('create-loyalty-program', { sequential: true }, () => {
  beforeAll(async () => {
    // Ensure we have enough sol
    await ensureFeePayerBalance(context.umi, { account: feePayer.publicKey, amount: 1 })
    context.umi.use(keypairIdentity(feePayer))
  })

  describe('expected usage', () => {
    it('should create a new loyalty program with a generated collection signer', async () => {
      expect.assertions(3)
      // ARRANGE
      const config = createTestLoyaltyProgramConfig({
        programAuthority: context.programAuthority,
      })

      // ACT
      const result = await createLoyaltyProgram(context, config)

      // ASSERT
      expect(result).toBeTruthy()
      expect(result.collection).toBeTruthy()
      expect(result.signature).toBeTruthy()
    })

    it('should create a new loyalty program with a provided collection signer', async () => {
      expect.assertions(4)
      // ARRANGE
      const collectionSigner = generateSigner(context.umi)
      const config: CreateLoyaltyProgramConfig = createTestLoyaltyProgramConfig({
        collectionSigner,
        programAuthority: context.programAuthority,
      })
      // ACT
      const result = await createLoyaltyProgram(context, config)

      // ASSERT
      expect(result).toBeTruthy()
      expect(result.collection).toBeTruthy()
      expect(result.signature).toBeTruthy()
      expect(result.collection.publicKey).toEqual(collectionSigner.publicKey)
    })
  })

  describe('unexpected usage', () => {
    describe('config validation', () => {
      it('should throw an error if the name is not set', async () => {
        expect.assertions(2)
        // ARRANGE
        const brokenConfig: CreateLoyaltyProgramConfig = createTestLoyaltyProgramConfigEmpty({
          organizationName: '',
        })

        // ACT
        try {
          await createLoyaltyProgram(context, brokenConfig)
        } catch (error) {
          // ASSERT
          expect(error).toBeDefined()
          expect(error.message).toEqual('assertValidCreateLoyaltyProgramConfig: Organization name is undefined')
        }
      })

      it('should throw an error if the metadata URI is not an undefined URL', async () => {
        expect.assertions(2)
        // ARRANGE
        const brokenConfig: CreateLoyaltyProgramConfig = createTestLoyaltyProgramConfigEmpty({
          organizationName: 'Test Loyalty Program',
        })

        // ACT
        try {
          await createLoyaltyProgram(context, brokenConfig)
        } catch (error) {
          // ASSERT
          expect(error).toBeDefined()
          expect(error.message).toEqual('assertValidCreateLoyaltyProgramConfig: Metadata URI is undefined')
        }
      })

      it('should throw an error if the metadata URI is not a valid URL', async () => {
        expect.assertions(2)
        // ARRANGE
        const brokenConfig: CreateLoyaltyProgramConfig = createTestLoyaltyProgramConfigEmpty({
          organizationName: 'Test Loyalty Program',
          metadataUri: 'foobar',
        })

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
        const brokenConfig: CreateLoyaltyProgramConfig = createTestLoyaltyProgramConfigEmpty({
          organizationName: 'Test Loyalty Program',
          metadataUri: 'https://arweave.net/123abc',
          programAuthority: undefined,
        })

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
        const brokenConfig: CreateLoyaltyProgramConfig = createTestLoyaltyProgramConfigEmpty({
          organizationName: 'Test Loyalty Program',
          metadataUri: 'https://arweave.net/123abc',
          programAuthority: context.programAuthority,
        })

        // ACT
        try {
          await createLoyaltyProgram(context, { ...brokenConfig, tiers: undefined } as CreateLoyaltyProgramConfig)
        } catch (error) {
          // ASSERT
          expect(error).toBeDefined()
          expect(error.message).toEqual('assertValidCreateLoyaltyProgramConfig: Tiers are undefined')
        }
      })

      it('should throw an error if the tiers are empty', async () => {
        expect.assertions(2)
        // ARRANGE
        const brokenConfig: CreateLoyaltyProgramConfig = createTestLoyaltyProgramConfigEmpty({
          organizationName: 'Test Loyalty Program',
          metadataUri: 'https://arweave.net/123abc',
          programAuthority: context.programAuthority,
          tiers: [],
        })

        // ACT
        try {
          await createLoyaltyProgram(context, brokenConfig)
        } catch (error) {
          // ASSERT
          expect(error).toBeDefined()
          expect(error.message).toEqual('assertValidCreateLoyaltyProgramConfig: Tiers are empty')
        }
      })

      it('should throw an error if the points per action are not set', async () => {
        expect.assertions(2)
        // ARRANGE
        const brokenConfig: CreateLoyaltyProgramConfig = createTestLoyaltyProgramConfigEmpty({
          organizationName: 'Test Loyalty Program',
          metadataUri: 'https://arweave.net/123abc',
          programAuthority: context.programAuthority,
          tiers: [{ name: 'Grind', xpRequired: 0, rewards: ['nothing for you!'] }],
        })

        // ACT
        try {
          await createLoyaltyProgram(context, {
            ...brokenConfig,
            pointsPerAction: undefined,
          } as CreateLoyaltyProgramConfig)
        } catch (error) {
          // ASSERT
          expect(error).toBeDefined()
          expect(error.message).toEqual('assertValidCreateLoyaltyProgramConfig: Points per action are undefined')
        }
      })

      it('should throw an error if the points per action must not be empty', async () => {
        expect.assertions(2)
        // ARRANGE
        const brokenConfig: CreateLoyaltyProgramConfig = createTestLoyaltyProgramConfigEmpty({
          organizationName: 'Test Loyalty Program',
          metadataUri: 'https://arweave.net/123abc',
          programAuthority: context.programAuthority,
          tiers: [{ name: 'Grind', xpRequired: 0, rewards: ['nothing for you!'] }],
          pointsPerAction: {},
        })

        // ACT
        try {
          await createLoyaltyProgram(context, brokenConfig)
        } catch (error) {
          // ASSERT
          expect(error).toBeDefined()
          expect(error.message).toEqual('assertValidCreateLoyaltyProgramConfig: Points per action must not be empty')
        }
      })
    })
  })
})
