import { generateSigner, keypairIdentity, KeypairSigner } from '@metaplex-foundation/umi'
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { createTestLoyaltyProgram } from './helpers/create-test-loyalty-program'
import { getTestContext } from './helpers/get-test-context'
import { ensureFeePayerBalance } from './helpers/ensure-fee-payer-balance'
import { issueLoyaltyPass } from '../lib/issue-loyalty-pass'
import { awardLoyaltyPoints } from '../lib/award-loyalty-points'
import { getAssetData } from '../lib/get-asset-data'

const { feePayer, context } = getTestContext()

describe('get-asset-data', () => {
  beforeAll(async () => {
    await ensureFeePayerBalance(context.umi, { account: feePayer.publicKey, amount: 1 })
    context.umi.use(keypairIdentity(feePayer))
  })

  let collection: KeypairSigner | undefined
  let loyaltyPass: KeypairSigner | undefined
  let passSigner: KeypairSigner | undefined

  beforeEach(async () => {
    // Create a new collection and loyalty pass for each test
    const created = await createTestLoyaltyProgram(context)
    collection = created.collection
    context.collectionAddress = collection.publicKey
    passSigner = generateSigner(context.umi)

    const passResult = await issueLoyaltyPass(context, {
      collectionAddress: collection.publicKey,
      passName: 'Test Pass',
      passMetadataUri: 'https://arweave.net/123abc',
      recipient: feePayer.publicKey,
      assetSigner: passSigner,
    })
    loyaltyPass = passResult.asset

    // Award some initial points
    await awardLoyaltyPoints(context, {
      passAddress: loyaltyPass.publicKey,
      action: 'swap',
      signer: passSigner,
      multiplier: 100,
    })
  })

  describe('expected usage', () => {
    it('should fetch asset data for a valid pass', async () => {
      expect.assertions(7)
      if (!loyaltyPass) throw new Error('Test setup failed')

      // ACT
      const data = await getAssetData(context, loyaltyPass.publicKey)

      // ASSERT
      expect(data).toBeTruthy()
      expect(data?.xp).toBeGreaterThan(0)
      expect(data?.lastAction).toBe('swap')
      expect(data?.currentTier).toBeDefined()
      expect(data?.tierUpdatedAt).toBeDefined()
      expect(data?.rewards).toBeDefined()
      expect(data?.actionHistory).toHaveLength(1)
    })

    it('should throw an error for an invalid pass', async () => {
      expect.assertions(2)

      // ARRANGE
      const invalidPass = generateSigner(context.umi)

      // ACT & ASSERT
      try {
        await getAssetData(context, invalidPass.publicKey)
        expect(true).toBe(false) // Should not reach here
      } catch (error) {
        expect(error).toBeDefined()
        expect(error.message).toContain('not found')
      }
    })
  })
})
