import { generateSigner, keypairIdentity, KeypairSigner } from '@metaplex-foundation/umi'
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { createTestLoyaltyProgram } from './helpers/create-test-loyalty-program'
import { getTestContext, createContextWithFeePayer } from './helpers/get-test-context'
import { ensureFeePayerBalance } from './helpers/ensure-fee-payer-balance'
import { issueLoyaltyPass, IssueLoyaltyPassConfig } from '../lib/issue-loyalty-pass'

const { feePayer, context } = getTestContext()

describe('issue-loyalty-pass', () => {
  beforeAll(async () => {
    // Ensure we have enough sol
    await ensureFeePayerBalance(context.umi, { account: feePayer.publicKey, amount: 1 })
    context.umi.use(keypairIdentity(feePayer))
  })

  let collection: KeypairSigner | undefined
  let authority: KeypairSigner | undefined

  beforeEach(async () => {
    // Each of the tests below will have access to a new collection
    const created = await createTestLoyaltyProgram(context)
    collection = created.collection
    authority = created.updateAuthority
  })

  describe('expected usage', () => {
    it('should create a new loyalty pass with a generated asset signer', async () => {
      expect.assertions(3)

      // ARRANGE
      const config: IssueLoyaltyPassConfig = {
        collectionAddress: collection!.publicKey,
        passName: 'Test Pass',
        passMetadataUri: 'https://arweave.net/123abc',
        recipient: feePayer.publicKey,
        updateAuthority: authority!,
        organizationName: 'Test Organization',
      }

      // ACT
      const result = await issueLoyaltyPass(context, config)

      // ASSERT
      expect(result).toBeTruthy()
      expect(result.asset).toBeTruthy()
      expect(result.signature).toBeTruthy()
    })

    it('should create a new loyalty pass with a provided asset signer', async () => {
      expect.assertions(4)

      // ARRANGE
      const assetSigner = generateSigner(context.umi)
      const config: IssueLoyaltyPassConfig = {
        collectionAddress: collection!.publicKey,
        passName: 'Test Pass',
        passMetadataUri: 'https://arweave.net/123abc',
        recipient: feePayer.publicKey,
        assetSigner,
        updateAuthority: authority!,
        organizationName: 'Test Organization',
      }

      // ACT
      const result = await issueLoyaltyPass(context, config)

      // ASSERT
      expect(result).toBeTruthy()
      expect(result.asset).toBeTruthy()
      expect(result.signature).toBeTruthy()
      expect(result.asset.publicKey).toEqual(assetSigner.publicKey)
    })

    it('should create a new loyalty pass using a separate fee account', async () => {
      expect.assertions(3)

      // ARRANGE
      // Create a new fee account
      const feeAccount = generateSigner(context.umi)

      // Fund the fee account with 1 SOL
      await ensureFeePayerBalance(context.umi, {
        account: feeAccount.publicKey,
        amount: 1,
      })

      // Create a new context with the fee account
      const feeContext = createContextWithFeePayer(context, feeAccount)

      const config: IssueLoyaltyPassConfig = {
        collectionAddress: collection!.publicKey,
        passName: 'Test Pass',
        passMetadataUri: 'https://arweave.net/123abc',
        recipient: feePayer.publicKey,
        updateAuthority: authority!,
        organizationName: 'Test Organization',
      }

      // ACT
      const result = await issueLoyaltyPass(feeContext, config)

      // ASSERT
      expect(result).toBeTruthy()
      expect(result.asset).toBeTruthy()
      expect(result.signature).toBeTruthy()
    })

    it('should create a new loyalty pass with a separate update authority', async () => {
      expect.assertions(4)

      // ARRANGE
      const config: IssueLoyaltyPassConfig = {
        collectionAddress: collection!.publicKey,
        passName: 'Test Pass',
        passMetadataUri: 'https://arweave.net/123abc',
        recipient: feePayer.publicKey,
        updateAuthority: authority!,
        organizationName: 'Test Organization',
      }

      // ACT
      const result = await issueLoyaltyPass(context, config)

      // ASSERT
      expect(result).toBeTruthy()
      expect(result.asset).toBeTruthy()
      expect(result.signature).toBeTruthy()
      expect(result.asset.publicKey).not.toEqual(authority!.publicKey)
    })
  })

  describe('unexpected usage: config validation', () => {
    it('should throw an error if the name is not set', async () => {
      expect.assertions(2)
      if (!collection || !authority) throw new Error('Test setup failed')

      // ARRANGE
      const invalidConfig = {
        collectionAddress: collection.publicKey,
        passName: '',
        passMetadataUri: 'https://arweave.net/123abc',
        recipient: authority.publicKey,
        updateAuthority: generateSigner(context.umi),
        organizationName: 'Test Organization',
      }

      // ACT & ASSERT
      try {
        await issueLoyaltyPass(context, invalidConfig)
        expect(true).toBe(false) // Should not reach here
      } catch (error) {
        // ASSERT
        expect(error).toBeDefined()
        expect(error.message).toEqual(
          'Failed to issue loyalty pass: Error: assertValidIssueLoyaltyPassConfig: Pass name is undefined',
        )
      }
    })
  })
})
