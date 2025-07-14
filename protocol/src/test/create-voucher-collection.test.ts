import { generateSigner, keypairIdentity } from '@metaplex-foundation/umi'
import { beforeAll, describe, expect, it } from 'vitest'
import {
  createTestVoucherCollectionConfig,
  createTestVoucherCollectionConfigEmpty,
  createTestVoucherCollectionConfigWithSigners,
} from './helpers/create-test-voucher-collection'
import { getTestContext } from './helpers/get-test-context'
import { ensureFeePayerBalance } from './helpers/ensure-fee-payer-balance'
import { createVoucherCollection, CreateVoucherCollectionConfig } from '../lib/create-voucher-collection'
import { FEES } from '../utils/fee-structure'

const { feePayer, context } = getTestContext()

describe('create-voucher-collection', { sequential: true, timeout: 30000 }, () => {
  beforeAll(async () => {
    // Ensure we have enough sol for both the collection creation and the fee
    await ensureFeePayerBalance(context.umi, {
      account: feePayer.publicKey,
      amount: 1 + FEES.CREATE_VOUCHER_COLLECTION,
    })
    context.umi.use(keypairIdentity(feePayer))
  })

  describe('expected usage', () => {
    it('should create a new voucher collection with a generated collection signer and pay the fee', async () => {
      expect.assertions(4)
      // ARRANGE
      const config = createTestVoucherCollectionConfig({
        programAuthority: context.programAuthority,
        metadata: {
          merchantName: 'Test Coffee Shop',
          merchantAddress: 'test_coffee_shop_001',
          voucherTypes: ['discount', 'free_item', 'credits'],
        },
      })

      // ACT
      const result = await createVoucherCollection(context, config)

      // ASSERT
      expect(result).toBeTruthy()
      expect(result.collection).toBeTruthy()
      expect(result.signature).toBeTruthy()
      // Verify the transaction signature format (base58 string between 86-88 characters)
      expect(result.signature).toMatch(/^[1-9A-HJ-NP-Za-km-z]{86,88}$/)
    })

    it('should create a new voucher collection with a provided collection signer', async () => {
      expect.assertions(4)
      // ARRANGE
      const collectionSigner = generateSigner(context.umi)
      const config: CreateVoucherCollectionConfig = createTestVoucherCollectionConfig({
        collectionSigner,
        programAuthority: context.programAuthority,
        metadata: {
          merchantName: 'Test Coffee Shop',
          merchantAddress: 'test_coffee_shop_001',
          voucherTypes: ['discount', 'free_item', 'credits'],
        },
      })
      // ACT
      const result = await createVoucherCollection(context, config)

      // ASSERT
      expect(result).toBeTruthy()
      expect(result.collection).toBeTruthy()
      expect(result.signature).toBeTruthy()
      expect(result.collection.publicKey).toEqual(collectionSigner.publicKey)
    })

    it('should create a new voucher collection with a provided update authority', async () => {
      expect.assertions(5)
      // ARRANGE
      const updateAuthority = generateSigner(context.umi)
      const config: CreateVoucherCollectionConfig = createTestVoucherCollectionConfig({
        programAuthority: context.programAuthority,
        updateAuthority,
        metadata: {
          merchantName: 'Test Coffee Shop',
          merchantAddress: 'test_coffee_shop_001',
          voucherTypes: ['discount', 'free_item', 'credits'],
        },
      })
      // ACT
      const result = await createVoucherCollection(context, config)

      // ASSERT
      expect(result).toBeTruthy()
      expect(result.collection).toBeTruthy()
      expect(result.signature).toBeTruthy()
      expect(result.updateAuthority).toBeTruthy()
      expect(result.updateAuthority?.publicKey).toEqual(updateAuthority.publicKey)
    })

    it('should create a voucher collection with different voucher types', async () => {
      expect.assertions(4)
      // ARRANGE
      const config = createTestVoucherCollectionConfig({
        programAuthority: context.programAuthority,
        metadata: {
          merchantName: 'Test Restaurant',
          merchantAddress: 'test_restaurant_001',
          voucherTypes: ['percentage_off', 'fixed_verxio_credits', 'buy_one_get_one'],
        },
      })

      // ACT
      const result = await createVoucherCollection(context, config)

      // ASSERT
      expect(result).toBeTruthy()
      expect(result.collection).toBeTruthy()
      expect(result.signature).toBeTruthy()
      expect(result.signature).toMatch(/^[1-9A-HJ-NP-Za-km-z]{86,88}$/)
    })

    it('should create a voucher collection with contact info', async () => {
      expect.assertions(4)
      // ARRANGE
      const config = createTestVoucherCollectionConfig({
        programAuthority: context.programAuthority,
        metadata: {
          merchantName: 'Test Store',
          merchantAddress: 'test_store_001',
          contactInfo: 'support@teststore.com',
          voucherTypes: ['discount', 'free_item'],
        },
      })

      // ACT
      const result = await createVoucherCollection(context, config)

      // ASSERT
      expect(result).toBeTruthy()
      expect(result.collection).toBeTruthy()
      expect(result.signature).toBeTruthy()
      expect(result.signature).toMatch(/^[1-9A-HJ-NP-Za-km-z]{86,88}$/)
    })
  })

  describe('unexpected usage', () => {
    describe('config validation', () => {
      it('should throw an error if the voucher collection name is not set', async () => {
        expect.assertions(2)
        // ARRANGE
        const brokenConfig: CreateVoucherCollectionConfig = createTestVoucherCollectionConfigEmpty({
          voucherCollectionName: '',
        })

        // ACT
        try {
          await createVoucherCollection(context, brokenConfig)
        } catch (error) {
          // ASSERT
          expect(error).toBeDefined()
          expect(error.message).toEqual(
            'assertValidCreateVoucherCollectionConfig: Voucher collection name is undefined',
          )
        }
      })

      it('should throw an error if the metadata URI is not set', async () => {
        expect.assertions(2)
        // ARRANGE
        const brokenConfig: CreateVoucherCollectionConfig = createTestVoucherCollectionConfigEmpty({
          voucherCollectionName: 'Test Voucher Collection',
        })

        // ACT
        try {
          await createVoucherCollection(context, brokenConfig)
        } catch (error) {
          // ASSERT
          expect(error).toBeDefined()
          expect(error.message).toEqual('assertValidCreateVoucherCollectionConfig: Metadata URI is undefined')
        }
      })

      it('should throw an error if the metadata URI is not a valid URL', async () => {
        expect.assertions(2)
        // ARRANGE
        const brokenConfig: CreateVoucherCollectionConfig = createTestVoucherCollectionConfigEmpty({
          voucherCollectionName: 'Test Voucher Collection',
          metadataUri: 'foobar',
        })

        // ACT
        try {
          await createVoucherCollection(context, brokenConfig)
        } catch (error) {
          // ASSERT
          expect(error).toBeDefined()
          expect(error.message).toEqual('assertValidCreateVoucherCollectionConfig: Metadata URI is not a valid URL')
        }
      })

      it('should throw an error if the program authority is not set', async () => {
        expect.assertions(2)
        // ARRANGE
        const brokenConfig: CreateVoucherCollectionConfig = createTestVoucherCollectionConfigEmpty({
          voucherCollectionName: 'Test Voucher Collection',
          metadataUri: 'https://arweave.net/test-voucher-collection-metadata',
          programAuthority: undefined,
        })

        // ACT
        try {
          await createVoucherCollection(context, brokenConfig)
        } catch (error) {
          // ASSERT
          expect(error).toBeDefined()
          expect(error.message).toEqual('assertValidCreateVoucherCollectionConfig: Program authority is undefined')
        }
      })

      it('should throw an error if the metadata is not set', async () => {
        expect.assertions(2)
        // ARRANGE
        const brokenConfig: CreateVoucherCollectionConfig = createTestVoucherCollectionConfigEmpty({
          voucherCollectionName: 'Test Voucher Collection',
          metadataUri: 'https://arweave.net/test-voucher-collection-metadata',
          programAuthority: context.programAuthority,
        })

        // ACT
        try {
          await createVoucherCollection(context, {
            ...brokenConfig,
            metadata: undefined,
          } as unknown as CreateVoucherCollectionConfig)
        } catch (error) {
          // ASSERT
          expect(error).toBeDefined()
          expect(error.message).toEqual('assertValidCreateVoucherCollectionConfig: Metadata is undefined')
        }
      })

      it('should throw an error if the merchant name is not set', async () => {
        expect.assertions(2)
        // ARRANGE
        const brokenConfig: CreateVoucherCollectionConfig = createTestVoucherCollectionConfigEmpty({
          voucherCollectionName: 'Test Voucher Collection',
          metadataUri: 'https://arweave.net/test-voucher-collection-metadata',
          programAuthority: context.programAuthority,
          metadata: {
            merchantName: '',
            merchantAddress: 'test_coffee_shop_001',
            voucherTypes: ['discount', 'free_item', 'credits'],
          },
        })

        // ACT
        try {
          await createVoucherCollection(context, brokenConfig)
        } catch (error) {
          // ASSERT
          expect(error).toBeDefined()
          expect(error.message).toEqual('assertValidCreateVoucherCollectionConfig: Merchant name is undefined')
        }
      })

      it('should throw an error if the merchant address is not set', async () => {
        expect.assertions(2)
        // ARRANGE
        const brokenConfig: CreateVoucherCollectionConfig = createTestVoucherCollectionConfigEmpty({
          voucherCollectionName: 'Test Voucher Collection',
          metadataUri: 'https://arweave.net/test-voucher-collection-metadata',
          programAuthority: context.programAuthority,
          metadata: {
            merchantName: 'Test Coffee Shop',
            merchantAddress: '',
            voucherTypes: ['discount', 'free_item', 'credits'],
          },
        })

        // ACT
        try {
          await createVoucherCollection(context, brokenConfig)
        } catch (error) {
          // ASSERT
          expect(error).toBeDefined()
          expect(error.message).toEqual('assertValidCreateVoucherCollectionConfig: Merchant address is undefined')
        }
      })

      it('should throw an error if the voucher types are not set', async () => {
        expect.assertions(2)
        // ARRANGE
        const brokenConfig: CreateVoucherCollectionConfig = createTestVoucherCollectionConfigEmpty({
          voucherCollectionName: 'Test Voucher Collection',
          metadataUri: 'https://arweave.net/test-voucher-collection-metadata',
          programAuthority: context.programAuthority,
          metadata: {
            merchantName: 'Test Coffee Shop',
            merchantAddress: 'test_coffee_shop_001',
            voucherTypes: undefined,
          },
        })

        // ACT
        try {
          await createVoucherCollection(context, {
            ...brokenConfig,
            metadata: {
              ...brokenConfig.metadata,
              voucherTypes: undefined,
            },
          } as unknown as CreateVoucherCollectionConfig)
        } catch (error) {
          // ASSERT
          expect(error).toBeDefined()
          expect(error.message).toEqual(
            'assertValidCreateVoucherCollectionConfig: Voucher types are undefined or empty',
          )
        }
      })

      it('should throw an error if the voucher types are empty', async () => {
        expect.assertions(2)
        // ARRANGE
        const brokenConfig: CreateVoucherCollectionConfig = createTestVoucherCollectionConfigEmpty({
          voucherCollectionName: 'Test Voucher Collection',
          metadataUri: 'https://arweave.net/test-voucher-collection-metadata',
          programAuthority: context.programAuthority,
          metadata: {
            merchantName: 'Test Coffee Shop',
            merchantAddress: 'test_coffee_shop_001',
            voucherTypes: [],
          },
        })

        // ACT
        try {
          await createVoucherCollection(context, brokenConfig)
        } catch (error) {
          // ASSERT
          expect(error).toBeDefined()
          expect(error.message).toEqual(
            'assertValidCreateVoucherCollectionConfig: Voucher types are undefined or empty',
          )
        }
      })
    })

    describe('context validation', () => {
      it('should throw an error if context is undefined', async () => {
        expect.assertions(2)
        // ARRANGE
        const config = createTestVoucherCollectionConfig({
          programAuthority: context.programAuthority,
        })

        // ACT
        try {
          await createVoucherCollection(undefined as any, config)
        } catch (error) {
          // ASSERT
          expect(error).toBeDefined()
          expect(error.message).toContain('Context is undefined')
        }
      })

      it('should throw an error if context.umi is undefined', async () => {
        expect.assertions(2)
        // ARRANGE
        const config = createTestVoucherCollectionConfig({
          programAuthority: context.programAuthority,
        })
        const brokenContext = { ...context, umi: undefined }

        // ACT
        try {
          await createVoucherCollection(brokenContext as any, config)
        } catch (error) {
          // ASSERT
          expect(error).toBeDefined()
          expect(error.message).toContain('UMI is undefined')
        }
      })
    })
  })
})
