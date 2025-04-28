import { generateSigner, keypairIdentity, KeypairSigner } from '@metaplex-foundation/umi'
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { createTestLoyaltyProgram } from './helpers/create-test-loyalty-program'
import { getTestContext } from './helpers/get-test-context'
import { ensureFeePayerBalance } from './helpers/ensure-fee-payer-balance'
import { updateLoyaltyProgram } from '../lib/update-loyalty-program'
import { getCollectionAttribute } from '../lib/index'
import { ATTRIBUTE_KEYS } from '../lib/constants'

const { feePayer, context } = getTestContext()

describe('update-loyalty-program', () => {
  beforeAll(async () => {
    await ensureFeePayerBalance(context.umi, { account: feePayer.publicKey, amount: 1 })
    context.umi.use(keypairIdentity(feePayer))
  })

  let collection: KeypairSigner | undefined
  let authority: KeypairSigner | undefined
  beforeEach(async () => {
    // Create a new collection for each test
    const created = await createTestLoyaltyProgram(context)
    collection = created.collection
    authority = created.updateAuthority
    context.collectionAddress = collection.publicKey
  })

  describe('expected usage', () => {
    it('should update points per action configuration', async () => {
      expect.assertions(4)
      if (!collection || !authority) throw new Error('Test setup failed')

      // ARRANGE
      const config = {
        collectionAddress: collection.publicKey,
        programAuthority: context.programAuthority,
        updateAuthority: authority,
        newPointsPerAction: {
          swap: 700, // Update existing action
          purchase: 2900, // Add new action
        },
      }

      // ACT
      const result = await updateLoyaltyProgram(context, config)

      // ASSERT
      expect(result).toBeTruthy()
      expect(result.signature).toBeTruthy()

      // Verify the update
      const updatedPointsPerAction = await getCollectionAttribute(context, ATTRIBUTE_KEYS.POINTS_PER_ACTION)
      expect(updatedPointsPerAction.swap).toBe(700)
      expect(updatedPointsPerAction.purchase).toBe(2900)
    })

    it('should update tier configuration', async () => {
      expect.assertions(5)
      if (!collection || !authority) throw new Error('Test setup failed')

      // ARRANGE
      const config = {
        collectionAddress: collection.publicKey,
        programAuthority: context.programAuthority,
        updateAuthority: authority,
        newTiers: [
          { name: 'Grind', xpRequired: 0, rewards: ['nothing for you!'] }, // Grind tier must exist
          { name: 'Bronze', xpRequired: 400, rewards: ['free item'] }, // Update existing tier
          { name: 'Silver', xpRequired: 1000, rewards: ['5% cashback'] },
          { name: 'Gold', xpRequired: 2000, rewards: ['10% cashback'] },
          { name: 'Platinum', xpRequired: 5000, rewards: ['20% cashback'] }, // Add new tier
        ],
      }

      // ACT
      const result = await updateLoyaltyProgram(context, config)

      // ASSERT
      expect(result).toBeTruthy()
      expect(result.signature).toBeTruthy()

      // Verify the update
      const updatedTiers = await getCollectionAttribute(context, ATTRIBUTE_KEYS.TIERS)
      expect(updatedTiers[0].name).toBe('Grind') // Grind tier should be first
      expect(updatedTiers.find((tier) => tier.name === 'Bronze')?.xpRequired).toBe(400)
      expect(updatedTiers.find((tier) => tier.name === 'Platinum')).toBeTruthy()
    })

    it('should update both tiers and points per action', async () => {
      expect.assertions(6)
      if (!collection || !authority) throw new Error('Test setup failed')

      // ARRANGE
      const config = {
        collectionAddress: collection.publicKey,
        programAuthority: context.programAuthority,
        updateAuthority: authority,
        newTiers: [
          { name: 'Grind', xpRequired: 0, rewards: ['nothing for you!'] },
          { name: 'Bronze', xpRequired: 400, rewards: ['free item'] },
          { name: 'Silver', xpRequired: 1000, rewards: ['5% cashback'] },
          { name: 'Gold', xpRequired: 2000, rewards: ['10% cashback'] },
        ],
        newPointsPerAction: {
          swap: 700,
          purchase: 2900,
        },
      }

      // ACT
      const result = await updateLoyaltyProgram(context, config)

      // ASSERT
      expect(result).toBeTruthy()
      expect(result.signature).toBeTruthy()

      // Verify both updates
      const updatedTiers = await getCollectionAttribute(context, ATTRIBUTE_KEYS.TIERS)
      const updatedPointsPerAction = await getCollectionAttribute(context, ATTRIBUTE_KEYS.POINTS_PER_ACTION)

      expect(updatedTiers[0].name).toBe('Grind')
      expect(updatedTiers.find((tier) => tier.name === 'Bronze')?.xpRequired).toBe(400)
      expect(updatedPointsPerAction.swap).toBe(700)
      expect(updatedPointsPerAction.purchase).toBe(2900)
    })
  })

  describe('unexpected usage: config validation', () => {
    it('should throw an error if collection address is invalid', async () => {
      expect.assertions(2)
      if (!collection || !authority) throw new Error('Test setup failed')

      // ARRANGE
      const invalidConfig = {
        collectionAddress: generateSigner(context.umi).publicKey,
        programAuthority: context.programAuthority,
        updateAuthority: authority,
        newPointsPerAction: { swap: 700 },
      }

      // ACT & ASSERT
      try {
        await updateLoyaltyProgram(context, invalidConfig)
        expect(true).toBe(false) // Should not reach here
      } catch (error) {
        expect(error).toBeDefined()
        expect(error.message).toContain('Failed to update loyalty program')
      }
    })

    it('should throw an error if trying to remove Grind tier', async () => {
      expect.assertions(2)
      if (!collection || !authority) throw new Error('Test setup failed')

      // ARRANGE
      const invalidConfig = {
        collectionAddress: collection.publicKey,
        programAuthority: context.programAuthority,
        updateAuthority: authority,
        newTiers: [
          { name: 'Bronze', xpRequired: 400, rewards: ['free item'] },
          { name: 'Silver', xpRequired: 1000, rewards: ['5% cashback'] },
          { name: 'Gold', xpRequired: 2000, rewards: ['10% cashback'] },
        ],
      }

      // ACT & ASSERT
      try {
        await updateLoyaltyProgram(context, invalidConfig)
        expect(true).toBe(false) // Should not reach here
      } catch (error) {
        expect(error).toBeDefined()
        expect(error.message).toContain('Grind tier must exist')
      }
    })

    it('should throw an error if points per action value is negative', async () => {
      expect.assertions(2)
      if (!collection || !authority) throw new Error('Test setup failed')

      // ARRANGE
      const invalidConfig = {
        collectionAddress: collection.publicKey,
        programAuthority: context.programAuthority,
        updateAuthority: authority,
        newPointsPerAction: {
          swap: -100,
        },
      }

      // ACT & ASSERT
      try {
        await updateLoyaltyProgram(context, invalidConfig)
        expect(true).toBe(false) // Should not reach here
      } catch (error) {
        expect(error).toBeDefined()
        expect(error.message).toContain('Points for action')
      }
    })
  })
})
