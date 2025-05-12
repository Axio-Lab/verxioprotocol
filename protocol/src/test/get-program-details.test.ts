import { generateSigner, keypairIdentity, KeypairSigner } from '@metaplex-foundation/umi'
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { createTestLoyaltyProgram } from './helpers/create-test-loyalty-program'
import { getTestContext } from './helpers/get-test-context'
import { ensureFeePayerBalance } from './helpers/ensure-fee-payer-balance'
import { getProgramDetails } from '../lib/get-program-details'

const { feePayer, context } = getTestContext()

describe('get-program-details', () => {
  beforeAll(async () => {
    await ensureFeePayerBalance(context.umi, { account: feePayer.publicKey, amount: 1 })
    context.umi.use(keypairIdentity(feePayer))
  })

  let collection: KeypairSigner | undefined

  beforeEach(async () => {
    // Create a new collection for each test
    const created = await createTestLoyaltyProgram(context)
    collection = created.collection
    context.collectionAddress = collection.publicKey
  })

  describe('expected usage', () => {
    it('should return program details', async () => {
      expect.assertions(12)
      if (!collection) throw new Error('Test setup failed')

      // ACT
      const details = await getProgramDetails(context)

      // ASSERT
      expect(details).toBeDefined()
      expect(details.name).toBeDefined()
      expect(details.uri).toBeDefined()
      expect(details.collectionAddress).toBeDefined()
      expect(details.updateAuthority).toBeDefined()
      expect(details.numMinted).toBeDefined()
      expect(details.transferAuthority).toBeDefined()
      expect(details.creator).toBeDefined()
      expect(details.tiers).toBeDefined()
      expect(details.pointsPerAction).toBeDefined()
      expect(details.metadata).toBeDefined()
      expect(details.broadcasts).toBeDefined()
    })

    it('should return valid tiers data', async () => {
      expect.assertions(3)
      if (!collection) throw new Error('Test setup failed')

      // ACT
      const details = await getProgramDetails(context)

      // ASSERT
      expect(Array.isArray(details.tiers)).toBe(true)
      expect(details.tiers[0]).toHaveProperty('name')
      expect(details.tiers[0]).toHaveProperty('xpRequired')
    })

    it('should return valid points per action data', async () => {
      expect.assertions(2)
      if (!collection) throw new Error('Test setup failed')

      // ACT
      const details = await getProgramDetails(context)

      // ASSERT
      expect(typeof details.pointsPerAction).toBe('object')
      expect(Object.keys(details.pointsPerAction).length).toBeGreaterThan(0)
    })

    it('should return valid metadata', async () => {
      expect.assertions(2)
      if (!collection) throw new Error('Test setup failed')

      // ACT
      const details = await getProgramDetails(context)

      // ASSERT
      expect(typeof details.metadata).toBe('object')
      expect(details.metadata).toHaveProperty('organizationName')
    })

    it('should return valid broadcast data', async () => {
      expect.assertions(3)
      if (!collection) throw new Error('Test setup failed')

      // ACT
      const details = await getProgramDetails(context)

      // ASSERT
      expect(details.broadcasts).toBeDefined()
      expect(Array.isArray(details.broadcasts.broadcasts)).toBe(true)
      expect(details.broadcasts.totalBroadcasts).toBeDefined()
    })
  })

  describe('unexpected usage', () => {
    it('should throw an error if collection address is not set', async () => {
      expect.assertions(2)
      if (!collection) throw new Error('Test setup failed')

      // ARRANGE
      const invalidContext = { ...context, collectionAddress: undefined }

      // ACT & ASSERT
      try {
        await getProgramDetails(invalidContext)
        expect(true).toBe(false) // Should not reach here
      } catch (error) {
        expect(error).toBeDefined()
        expect(error.message).toContain('Collection not initialized')
      }
    })

    it('should throw an error if collection is not found', async () => {
      expect.assertions(2)
      if (!collection) throw new Error('Test setup failed')

      // ARRANGE
      const invalidContext = { ...context }
      invalidContext.collectionAddress = generateSigner(context.umi).publicKey

      // ACT & ASSERT
      try {
        await getProgramDetails(invalidContext)
        expect(true).toBe(false) // Should not reach here
      } catch (error) {
        expect(error).toBeDefined()
        expect(error.message).toContain('The account of type [CollectionV1] was not found')
      }
    })
  })
})
