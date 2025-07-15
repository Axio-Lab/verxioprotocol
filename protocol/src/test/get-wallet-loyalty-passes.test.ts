import { generateSigner, keypairIdentity, KeypairSigner } from '@metaplex-foundation/umi'
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { createTestLoyaltyProgram } from './helpers/create-test-loyalty-program'
import { getTestContext } from './helpers/get-test-context'
import { ensureFeePayerBalance } from './helpers/ensure-fee-payer-balance'
import { issueLoyaltyPass } from '../lib/issue-loyalty-pass'
import { getWalletLoyaltyPasses } from '../lib/get-wallet-loyalty-passes'

const { feePayer, context } = getTestContext()

describe('get-wallet-loyalty-passes', () => {
  beforeAll(async () => {
    await ensureFeePayerBalance(context.umi, { account: feePayer.publicKey, amount: 1 })
    context.umi.use(keypairIdentity(feePayer))
  })

  let collection: KeypairSigner | undefined
  let loyaltyPass: KeypairSigner | undefined
  let passSigner: KeypairSigner | undefined
  let authority: KeypairSigner | undefined

  beforeEach(async () => {
    // Create a new collection and loyalty pass for each test
    const created = await createTestLoyaltyProgram(context)
    collection = created.collection
    context.collectionAddress = collection.publicKey
    passSigner = generateSigner(context.umi)
    authority = created.updateAuthority
    const passResult = await issueLoyaltyPass(context, {
      collectionAddress: collection.publicKey,
      passName: 'Test Pass',
      passMetadataUri: 'https://arweave.net/123abc',
      recipient: feePayer.publicKey,
      assetSigner: passSigner,
      updateAuthority: authority!,
      organizationName: 'Test Organization',
    })
    loyaltyPass = passResult.asset
  })

  describe('expected usage', () => {
    it('should return loyalty passes for a wallet', async () => {
      expect.assertions(2)
      if (!loyaltyPass) throw new Error('Test setup failed')

      // ACT
      const passes = await getWalletLoyaltyPasses(context, feePayer.publicKey)

      // ASSERT
      expect(passes).toBeDefined()
      expect(Array.isArray(passes)).toBe(true)
    })
  })

  describe('unexpected usage', () => {
    it('should handle errors gracefully', async () => {
      expect.assertions(2)

      // ARRANGE
      const invalidContext = { ...context, umi: undefined }

      // ACT & ASSERT
      try {
        await getWalletLoyaltyPasses(invalidContext, feePayer.publicKey)
        expect(true).toBe(false) // Should not reach here
      } catch (error) {
        expect(error).toBeDefined()
        expect(error.message).toContain('Failed to fetch wallet loyalty passes')
      }
    })
  })
})
