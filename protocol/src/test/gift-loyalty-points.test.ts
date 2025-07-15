import { generateSigner, keypairIdentity, KeypairSigner } from '@metaplex-foundation/umi'
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { createTestLoyaltyProgram } from './helpers/create-test-loyalty-program'
import { getTestContext } from './helpers/get-test-context'
import { ensureFeePayerBalance } from './helpers/ensure-fee-payer-balance'
import { issueLoyaltyPass } from '../lib/issue-loyalty-pass'
import { giftLoyaltyPoints } from '../lib/gift-loyalty-points'

const { feePayer, context } = getTestContext()

describe('gift-loyalty-points', () => {
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
    it('should gift points for a valid amount with a reason', async () => {
      expect.assertions(3)
      if (!loyaltyPass || !authority) throw new Error('Test setup failed')

      // ARRANGE
      const config = {
        passAddress: loyaltyPass.publicKey,
        pointsToGift: 50,
        signer: authority,
        action: 'bonus',
      }

      // ACT
      const result = await giftLoyaltyPoints(context, config)

      // ASSERT
      expect(result).toBeTruthy()
      expect(result.points).toBeGreaterThan(0) // Should have more points than before
      expect(result.signature).toBeTruthy()
    })

    it('should update tier when points exceed threshold', async () => {
      expect.assertions(4)
      if (!loyaltyPass || !authority) throw new Error('Test setup failed')

      // ARRANGE
      const config = {
        passAddress: loyaltyPass.publicKey,
        pointsToGift: 1000, // Gift enough points to exceed a tier threshold
        signer: authority,
        action: 'promotion',
      }

      // ACT
      const result = await giftLoyaltyPoints(context, config)

      // ASSERT
      expect(result).toBeTruthy()
      expect(result.points).toBeGreaterThanOrEqual(1000) // Should have at least 1000 points
      expect(result.signature).toBeTruthy()
      expect(result.newTier.name).not.toBe('Grind') // Should be in a higher tier
    })
  })

  describe('unexpected usage: config validation', () => {
    it('should throw an error if pass address is invalid', async () => {
      expect.assertions(2)
      if (!passSigner || !authority) throw new Error('Test setup failed')

      // ARRANGE
      const invalidConfig = {
        passAddress: generateSigner(context.umi).publicKey,
        pointsToGift: 50,
        signer: authority,
        action: 'invalid',
      }

      // ACT & ASSERT
      try {
        await giftLoyaltyPoints(context, invalidConfig)
        expect(true).toBe(false) // Should not reach here
      } catch (error) {
        expect(error).toBeDefined()
        expect(error.message).toContain('The account of type [AssetV1] was not found at the provided address')
      }
    })

    it('should throw an error if points to gift is not a positive number', async () => {
      expect.assertions(2)
      if (!loyaltyPass || !authority) throw new Error('Test setup failed')

      // ARRANGE
      const invalidConfig = {
        passAddress: loyaltyPass.publicKey,
        pointsToGift: 0,
        signer: authority,
        action: 'zero',
      }

      // ACT & ASSERT
      try {
        await giftLoyaltyPoints(context, invalidConfig)
        expect(true).toBe(false) // Should not reach here
      } catch (error) {
        expect(error).toBeDefined()
        expect(error.message).toContain('Points to gift must be a positive number')
      }
    })

    it('should throw an error if signer is not the pass owner', async () => {
      expect.assertions(2)
      if (!loyaltyPass) throw new Error('Test setup failed')

      // ARRANGE
      const invalidSigner = generateSigner(context.umi)
      const invalidConfig = {
        passAddress: loyaltyPass.publicKey,
        pointsToGift: 50,
        signer: invalidSigner,
        action: 'unauthorized',
      }

      // ACT & ASSERT
      try {
        await giftLoyaltyPoints(context, invalidConfig)
        expect(true).toBe(false) // Should not reach here
      } catch (error) {
        expect(error).toBeDefined()
        expect(error.message).toContain('Invalid Authority')
      }
    })
  })
})
