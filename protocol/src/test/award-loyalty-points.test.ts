import { generateSigner, keypairIdentity, KeypairSigner } from '@metaplex-foundation/umi'
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { createTestLoyaltyProgram } from './helpers/create-test-loyalty-program'
import { getTestContext } from './helpers/get-test-context'
import { ensureFeePayerBalance } from './helpers/ensure-fee-payer-balance'
import { issueLoyaltyPass } from '../lib/issue-loyalty-pass'
import { awardLoyaltyPoints } from '../lib/award-loyalty-points'
import { createLoyaltyProgram } from '../lib/create-loyalty-program'
import { fetchAsset } from '@metaplex-foundation/mpl-core'

const { feePayer, context } = getTestContext()

describe('award-loyalty-points', () => {
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
    it('should award points for a valid action', async () => {
      expect.assertions(3)
      if (!loyaltyPass || !authority) throw new Error('Test setup failed')

      // ARRANGE
      const config = {
        passAddress: loyaltyPass.publicKey,
        action: 'swap',
        signer: authority,
      }

      // ACT
      const result = await awardLoyaltyPoints(context, config)

      // ASSERT
      expect(result).toBeTruthy()
      expect(result.points).toBeGreaterThan(0)
      expect(result.signature).toBeTruthy()
    })

    it('should apply multiplier to points', async () => {
      expect.assertions(3)
      if (!loyaltyPass || !authority) throw new Error('Test setup failed')

      // ARRANGE
      const config = {
        passAddress: loyaltyPass.publicKey,
        action: 'swap',
        signer: authority,
        multiplier: 2,
      }

      // ACT
      const result = await awardLoyaltyPoints(context, config)

      // ASSERT
      expect(result).toBeTruthy()
      expect(result.points).toBeGreaterThan(0)
      expect(result.signature).toBeTruthy()
    })

    it('should accumulate points across multiple actions', async () => {
      expect.assertions(4)
      if (!loyaltyPass || !authority) throw new Error('Test setup failed')

      // ARRANGE
      const config = {
        passAddress: loyaltyPass.publicKey,
        action: 'swap',
        signer: authority,
      }

      // ACT
      const firstResult = await awardLoyaltyPoints(context, config)
      const secondResult = await awardLoyaltyPoints(context, config)

      // ASSERT
      expect(firstResult).toBeTruthy()
      expect(secondResult).toBeTruthy()
      expect(secondResult.points).toBeGreaterThan(firstResult.points)
      expect(secondResult.signature).toBeTruthy()
    })

    it('should update tier when points threshold is reached', async () => {
      expect.assertions(5)
      if (!loyaltyPass || !authority) throw new Error('Test setup failed')

      // ARRANGE
      const config = {
        passAddress: loyaltyPass.publicKey,
        action: 'swap',
        signer: authority,
        multiplier: 1000, // Large multiplier to ensure tier update
      }

      // ACT
      const result = await awardLoyaltyPoints(context, config)

      // ASSERT
      expect(result).toBeTruthy()
      expect(result.points).toBeGreaterThan(0)
      expect(result.signature).toBeTruthy()

      // Verify the tier was updated by checking the pass data
      const asset = await fetchAsset(context.umi, loyaltyPass.publicKey)
      const appDataPlugin = asset.appDatas?.[0]
      expect(appDataPlugin?.data).toBeDefined()
      expect(appDataPlugin?.data?.xp).toBeGreaterThan(0)
    })
  })

  describe('unexpected usage: config validation', () => {
    it('should throw an error if pass address is invalid', async () => {
      expect.assertions(2)
      if (!passSigner || !authority) throw new Error('Test setup failed')

      // ARRANGE
      const invalidConfig = {
        passAddress: generateSigner(context.umi).publicKey,
        action: 'swap',
        signer: authority,
      }

      // ACT & ASSERT
      try {
        await awardLoyaltyPoints(context, invalidConfig)
        expect(true).toBe(false) // Should not reach here
      } catch (error) {
        expect(error).toBeDefined()
        expect(error.message).toContain('Failed to award points')
      }
    })

    it('should throw an error if action is not defined in points per action', async () => {
      expect.assertions(2)
      if (!loyaltyPass || !authority) throw new Error('Test setup failed')

      // ARRANGE
      const invalidConfig = {
        passAddress: loyaltyPass.publicKey,
        action: 'invalid_action',
        signer: authority,
      }

      // ACT & ASSERT
      try {
        await awardLoyaltyPoints(context, invalidConfig)
        expect(true).toBe(false) // Should not reach here
      } catch (error) {
        expect(error).toBeDefined()
        expect(error.message).toContain("Action 'invalid_action' is not defined in points per action configuration")
      }
    })

    it('should throw an error if action is undefined in points per action configuration', async () => {
      expect.assertions(2)
      if (!loyaltyPass || !authority) throw new Error('Test setup failed')

      // ARRANGE
      const invalidConfig = {
        passAddress: loyaltyPass.publicKey,
        action: 'purchase', // This action is not defined in createTestLoyaltyProgram
        signer: authority,
      }

      // ACT & ASSERT
      try {
        await awardLoyaltyPoints(context, invalidConfig)
        expect(true).toBe(false) // Should not reach here
      } catch (error) {
        expect(error).toBeDefined()
        expect(error.message).toContain("Action 'purchase' is not defined in points per action configuration")
      }
    })

    it('should throw an error if points per action configuration is missing', async () => {
      expect.assertions(2)
      if (!loyaltyPass || !authority) throw new Error('Test setup failed')

      // ARRANGE
      // Create a new collection with minimal points configuration
      const minimalConfig = {
        programAuthority: context.programAuthority,
        loyaltyProgramName: 'Test Program',
        metadataUri: 'https://arweave.net/123abc',
        updateAuthority: generateSigner(context.umi),
        tiers: [{ name: 'Grind', xpRequired: 0, rewards: ['nothing for you!'] }],
        pointsPerAction: { swap: 0 }, // This will be treated as missing in our function
        metadata: {
          organizationName: 'Test Host',
        },
      }
      const collectionWithoutPoints = await createLoyaltyProgram(context, minimalConfig)
      context.collectionAddress = collectionWithoutPoints.collection.publicKey

      const invalidConfig = {
        passAddress: loyaltyPass.publicKey,
        action: 'swap',
        signer: authority,
      }

      // ACT & ASSERT
      try {
        await awardLoyaltyPoints(context, invalidConfig)
        expect(true).toBe(false) // Should not reach here
      } catch (error) {
        expect(error).toBeDefined()
        expect(error.message).toContain('Points per action configuration not found')
      }
    })

    it('should throw an error if signer is not the pass owner', async () => {
      expect.assertions(2)
      if (!loyaltyPass || !authority) throw new Error('Test setup failed')

      // ARRANGE
      const invalidSigner = generateSigner(context.umi)
      const invalidConfig = {
        passAddress: loyaltyPass.publicKey,
        action: 'swap',
        signer: invalidSigner,
      }

      // ACT & ASSERT
      try {
        await awardLoyaltyPoints(context, invalidConfig)
        expect(true).toBe(false) // Should not reach here
      } catch (error) {
        expect(error).toBeDefined()
        expect(error.message).toContain('Failed to award points: Signer is not the pass owner')
      }
    })
  })
})
