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

    // Award some initial points
    await awardLoyaltyPoints(context, {
      passAddress: loyaltyPass.publicKey,
      action: 'swap',
      signer: authority!,
      multiplier: 100,
    })
  })

  describe('expected usage', () => {
    it('should fetch asset data for a valid pass', async () => {
      expect.assertions(9)
      if (!loyaltyPass) throw new Error('Test setup failed')

      // ACT
      const data = await getAssetData(context, loyaltyPass.publicKey)
      console.log('data', data)

      // ASSERT
      expect(data).toBeTruthy()
      expect(data?.xp).toBeGreaterThan(0)
      expect(data?.lastAction).toBe('swap')
      expect(data?.currentTier).toBeDefined()
      expect(data?.tierUpdatedAt).toBeDefined()
      expect(data?.rewards).toBeDefined()
      expect(data?.actionHistory).toBeDefined()
      expect(data?.pass).toBe(loyaltyPass.publicKey.toString())
      expect(data?.metadata).toBeDefined()
    })

    it('should return null for an invalid pass', async () => {
      expect.assertions(1)

      // ARRANGE
      const invalidPass = generateSigner(context.umi)

      // ACT & ASSERT
      const result = await getAssetData(context, invalidPass.publicKey)
      expect(result).toBeNull()
    })
  })

  it('should fetch asset data with all fields', async () => {
    if (!loyaltyPass) throw new Error('Loyalty pass not created')

    const data = await getAssetData(context, loyaltyPass.publicKey)

    expect(data).toBeDefined()
    expect(data).toHaveProperty('xp')
    expect(data).toHaveProperty('lastAction')
    expect(data).toHaveProperty('actionHistory')
    expect(data).toHaveProperty('currentTier')
    expect(data).toHaveProperty('tierUpdatedAt')
    expect(data).toHaveProperty('rewards')
    expect(data).toHaveProperty('name')
    expect(data).toHaveProperty('uri')
    expect(data).toHaveProperty('owner')
    expect(data).toHaveProperty('pass')
    expect(data).toHaveProperty('metadata')
    expect(data).toHaveProperty('rewardTiers')
  })

  it('should return null for non-existent asset', async () => {
    const nonExistentAsset = generateSigner(context.umi)
    const data = await getAssetData(context, nonExistentAsset.publicKey)
    expect(data).toBeNull()
  })
})
