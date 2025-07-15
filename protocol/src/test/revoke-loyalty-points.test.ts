import { generateSigner, keypairIdentity, KeypairSigner } from '@metaplex-foundation/umi'
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { createTestLoyaltyProgram } from './helpers/create-test-loyalty-program'
import { getTestContext } from './helpers/get-test-context'
import { ensureFeePayerBalance } from './helpers/ensure-fee-payer-balance'
import { issueLoyaltyPass } from '../lib/issue-loyalty-pass'
import { awardLoyaltyPoints } from '../lib/award-loyalty-points'
import { revokeLoyaltyPoints } from '../lib/revoke-loyalty-points'

const { feePayer, context } = getTestContext()

describe('revoke-loyalty-points', () => {
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
      multiplier: 100, // Award enough points for testing
    })
  })

  describe('expected usage', () => {
    it('should revoke points for a valid amount', async () => {
      expect.assertions(3)
      if (!loyaltyPass || !authority) throw new Error('Test setup failed')

      // ARRANGE
      const config = {
        passAddress: loyaltyPass.publicKey,
        pointsToRevoke: 50,
        signer: authority,
      }

      // ACT
      const result = await revokeLoyaltyPoints(context, config)

      // ASSERT
      expect(result).toBeTruthy()
      expect(result.points).toBeLessThan(60000) // Should have less points than before (60000 - 50)
      expect(result.signature).toBeTruthy()
    })

    it('should not allow points to go below 0', async () => {
      expect.assertions(3)
      if (!loyaltyPass || !authority) throw new Error('Test setup failed')

      // ARRANGE
      const config = {
        passAddress: loyaltyPass.publicKey,
        pointsToRevoke: 100000, // Try to revoke more points than available (we have ~60000)
        signer: authority,
      }

      // ACT
      const result = await revokeLoyaltyPoints(context, config)

      // ASSERT
      expect(result).toBeTruthy()
      expect(result.points).toBe(0) // Should not go below 0
      expect(result.signature).toBeTruthy()
    })

    it('should update tier when points are reduced below threshold', async () => {
      expect.assertions(4)
      if (!loyaltyPass || !authority) throw new Error('Test setup failed')

      // ARRANGE
      const config = {
        passAddress: loyaltyPass.publicKey,
        pointsToRevoke: 59950, // Revoke more points to ensure we drop below 100 (we have ~60000)
        signer: authority,
      }

      // ACT
      const result = await revokeLoyaltyPoints(context, config)

      // ASSERT
      expect(result).toBeTruthy()
      expect(result.points).toBeLessThan(100) // Should have very few points left
      expect(result.signature).toBeTruthy()
      expect(result.newTier.name).toBe('Grind') // Should be in the lowest tier after revoking most points
    })
  })

  describe('unexpected usage: config validation', () => {
    it('should throw an error if pass address is invalid', async () => {
      expect.assertions(2)
      if (!authority) throw new Error('Test setup failed')

      // ARRANGE
      const invalidConfig = {
        passAddress: generateSigner(context.umi).publicKey,
        pointsToRevoke: 50,
        signer: authority,
      }

      // ACT & ASSERT
      try {
        await revokeLoyaltyPoints(context, invalidConfig)
        expect(true).toBe(false) // Should not reach here
      } catch (error) {
        expect(error).toBeDefined()
        expect(error.message).toContain('Failed to revoke points')
      }
    })

    it('should throw an error if points to revoke is not a positive number', async () => {
      expect.assertions(2)
      if (!loyaltyPass || !authority) throw new Error('Test setup failed')

      // ARRANGE
      const invalidConfig = {
        passAddress: loyaltyPass.publicKey,
        pointsToRevoke: 0,
        signer: authority,
      }

      // ACT & ASSERT
      try {
        await revokeLoyaltyPoints(context, invalidConfig)
        expect(true).toBe(false) // Should not reach here
      } catch (error) {
        expect(error).toBeDefined()
        expect(error.message).toContain('Points to revoke must be a positive number')
      }
    })

    it('should throw an error if signer is not the pass owner', async () => {
      expect.assertions(2)
      if (!loyaltyPass) throw new Error('Test setup failed')

      // ARRANGE
      const invalidSigner = generateSigner(context.umi)
      const invalidConfig = {
        passAddress: loyaltyPass.publicKey,
        pointsToRevoke: 50,
        signer: invalidSigner,
      }

      // ACT & ASSERT
      try {
        await revokeLoyaltyPoints(context, invalidConfig)
        expect(true).toBe(false) // Should not reach here
      } catch (error) {
        expect(error).toBeDefined()
        expect(error.message).toContain('Failed to revoke points')
      }
    })
  })
})
