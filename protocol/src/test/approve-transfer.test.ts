import { generateSigner, keypairIdentity, KeypairSigner } from '@metaplex-foundation/umi'
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { createTestLoyaltyProgram } from './helpers/create-test-loyalty-program'
import { getTestContext } from './helpers/get-test-context'
import { ensureFeePayerBalance } from './helpers/ensure-fee-payer-balance'
import { issueLoyaltyPass } from '../lib/issue-loyalty-pass'
import { approveTransfer } from '../lib/approve-transfer'

const { feePayer, context } = getTestContext()

describe('approve-transfer', () => {
  beforeAll(async () => {
    await ensureFeePayerBalance(context.umi, { account: feePayer.publicKey, amount: 1 })
    context.umi.use(keypairIdentity(feePayer))
  })

  let collection: KeypairSigner | undefined
  let loyaltyPass: KeypairSigner | undefined
  let passSigner: KeypairSigner | undefined
  let newOwner: KeypairSigner | undefined
  let authority: KeypairSigner | undefined
  beforeEach(async () => {
    // Create a new collection and loyalty pass for each test
    const created = await createTestLoyaltyProgram(context)
    collection = created.collection
    context.collectionAddress = collection.publicKey
    passSigner = generateSigner(context.umi)
    newOwner = generateSigner(context.umi)
    authority = created.updateAuthority

    const passResult = await issueLoyaltyPass(context, {
      collectionAddress: collection.publicKey,
      passName: 'Test Pass',
      passMetadataUri: 'https://arweave.net/123abc',
      recipient: feePayer.publicKey,
      assetSigner: passSigner,
      updateAuthority: authority!,
    })
    loyaltyPass = passResult.asset
  })

  describe('expected usage', () => {
    it('should approve transfer to a new owner', async () => {
      expect.assertions(1)
      if (!loyaltyPass || !newOwner) throw new Error('Test setup failed')

      // ACT
      await approveTransfer(context, loyaltyPass.publicKey, newOwner.publicKey)

      // ASSERT
      expect(true).toBe(true) // If we get here, the transfer was successful
    })
  })

  describe('unexpected usage', () => {
    it('should throw an error if collection address is not set', async () => {
      expect.assertions(2)
      if (!loyaltyPass || !newOwner) throw new Error('Test setup failed')

      // ARRANGE
      const invalidContext = { ...context, collectionAddress: undefined }

      // ACT & ASSERT
      try {
        await approveTransfer(invalidContext, loyaltyPass.publicKey, newOwner.publicKey)
        expect(true).toBe(false) // Should not reach here
      } catch (error) {
        expect(error).toBeDefined()
        expect(error.message).toContain('Collection not initialized')
      }
    })
  })
})
