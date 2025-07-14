import { generateSigner, keypairIdentity, createSignerFromKeypair } from '@metaplex-foundation/umi'
import { beforeAll, describe, expect, it } from 'vitest'
import {
  createTestVoucherConfig,
  createTestVoucherConfigEmpty,
  createTestVoucherConfigWithSigners,
  createPercentageOffVoucherConfig,
  createFixedCreditsVoucherConfig,
  createBOGOVoucherConfig,
  createVoucherWithConditions,
} from './helpers/create-test-voucher'
import { getTestContext } from './helpers/get-test-context'
import { ensureFeePayerBalance } from './helpers/ensure-fee-payer-balance'
import { mintVoucher, MintVoucherConfig } from '../lib/mint-voucher'
import { createVoucherCollection } from '../lib/create-voucher-collection'
import { FEES } from '../utils/fee-structure'

const { feePayer, context } = getTestContext()

describe('mint-voucher', { sequential: true, timeout: 30000 }, () => {
  let feePayerSigner: any
  let collectionAddress: any
  let collectionUpdateAuthority: any

  beforeAll(async () => {
    // Ensure we have enough sol for both the collection creation and voucher minting
    await ensureFeePayerBalance(context.umi, {
      account: feePayer.publicKey,
      amount: 2 + FEES.CREATE_VOUCHER_COLLECTION + FEES.LOYALTY_OPERATIONS,
    })
    context.umi.use(keypairIdentity(feePayer))
    feePayerSigner = createSignerFromKeypair(context.umi, feePayer)

    // Create a voucher collection for testing
    const collectionResult = await createVoucherCollection(context, {
      programAuthority: context.programAuthority,
      voucherCollectionName: 'Test Voucher Collection',
      metadataUri: 'https://arweave.net/test-collection-metadata',
      metadata: {
        merchantName: 'Test Coffee Shop',
        merchantAddress: 'test_coffee_shop_001',
        voucherTypes: ['discount', 'free_item', 'credits'],
      },
    })
    collectionAddress = collectionResult.collection.publicKey
    collectionUpdateAuthority = collectionResult.updateAuthority
  })

  describe('expected usage', () => {
    it('should mint a new voucher with a generated asset signer and pay the fee', async () => {
      expect.assertions(5)
      // ARRANGE
      const config = createTestVoucherConfigWithSigners(context.umi, {
        collectionAddress: collectionAddress,
        recipient: context.umi.identity.publicKey,
        updateAuthority: collectionUpdateAuthority,
      })

      // ACT
      const result = await mintVoucher(context, config)

      // ASSERT
      expect(result).toBeTruthy()
      expect(result.asset).toBeTruthy()
      expect(result.signature).toBeTruthy()
      expect(result.voucherAddress).toBeTruthy()
      // Verify the transaction signature format (base58 string between 86-88 characters)
      expect(result.signature).toMatch(/^[1-9A-HJ-NP-Za-km-z]{86,88}$/)
    })

    it('should mint a new voucher with a provided asset signer', async () => {
      expect.assertions(5)
      // ARRANGE
      const assetSigner = generateSigner(context.umi)
      const config: MintVoucherConfig = createTestVoucherConfigWithSigners(context.umi, {
        assetSigner,
        collectionAddress: collectionAddress,
        recipient: context.umi.identity.publicKey,
        updateAuthority: collectionUpdateAuthority,
      })
      // ACT
      const result = await mintVoucher(context, config)

      // ASSERT
      expect(result).toBeTruthy()
      expect(result.asset).toBeTruthy()
      expect(result.signature).toBeTruthy()
      expect(result.voucherAddress).toBeTruthy()
      expect(result.asset.publicKey).toEqual(assetSigner.publicKey)
    })

    it('should mint a percentage off voucher', async () => {
      expect.assertions(5)
      // ARRANGE
      const config = createPercentageOffVoucherConfig(context.umi, {
        collectionAddress: collectionAddress,
        recipient: context.umi.identity.publicKey,
        updateAuthority: collectionUpdateAuthority,
      })

      // ACT
      const result = await mintVoucher(context, config)

      // ASSERT
      expect(result).toBeTruthy()
      expect(result.asset).toBeTruthy()
      expect(result.signature).toBeTruthy()
      expect(result.voucherAddress).toBeTruthy()
      expect(result.signature).toMatch(/^[1-9A-HJ-NP-Za-km-z]{86,88}$/)
    })

    it('should mint a fixed credits voucher', async () => {
      expect.assertions(5)
      // ARRANGE
      const config = createFixedCreditsVoucherConfig(context.umi, {
        collectionAddress: collectionAddress,
        recipient: context.umi.identity.publicKey,
        updateAuthority: collectionUpdateAuthority,
      })

      // ACT
      const result = await mintVoucher(context, config)

      // ASSERT
      expect(result).toBeTruthy()
      expect(result.asset).toBeTruthy()
      expect(result.signature).toBeTruthy()
      expect(result.voucherAddress).toBeTruthy()
      expect(result.signature).toMatch(/^[1-9A-HJ-NP-Za-km-z]{86,88}$/)
    })

    it('should mint a BOGO voucher', async () => {
      expect.assertions(5)
      // ARRANGE
      const config = createBOGOVoucherConfig(context.umi, {
        collectionAddress: collectionAddress,
        recipient: context.umi.identity.publicKey,
        updateAuthority: collectionUpdateAuthority,
      })

      // ACT
      const result = await mintVoucher(context, config)

      // ASSERT
      expect(result).toBeTruthy()
      expect(result.asset).toBeTruthy()
      expect(result.signature).toBeTruthy()
      expect(result.voucherAddress).toBeTruthy()
      expect(result.signature).toMatch(/^[1-9A-HJ-NP-Za-km-z]{86,88}$/)
    })

    it('should mint a voucher with conditions', async () => {
      expect.assertions(5)
      // ARRANGE
      const conditions = [
        {
          type: 'minimum_purchase' as const,
          value: 50,
          operator: 'greater_than' as const,
        },
        {
          type: 'user_tier' as const,
          value: 'Gold',
          operator: 'equals' as const,
        },
      ]
      const config = createVoucherWithConditions(context.umi, conditions, {
        collectionAddress: collectionAddress,
        recipient: context.umi.identity.publicKey,
        updateAuthority: collectionUpdateAuthority,
      })

      // ACT
      const result = await mintVoucher(context, config)

      // ASSERT
      expect(result).toBeTruthy()
      expect(result.asset).toBeTruthy()
      expect(result.signature).toBeTruthy()
      expect(result.voucherAddress).toBeTruthy()
      expect(result.signature).toMatch(/^[1-9A-HJ-NP-Za-km-z]{86,88}$/)
    })

    it('should mint a transferable voucher', async () => {
      expect.assertions(5)
      // ARRANGE
      const config = createTestVoucherConfigWithSigners(context.umi, {
        collectionAddress: collectionAddress,
        recipient: context.umi.identity.publicKey,
        updateAuthority: collectionUpdateAuthority,
        voucherData: {
          type: 'percentage_off',
          value: 25,
          description: '25% off - transferable',
          expiryDate: Date.now() + 7 * 24 * 60 * 60 * 1000,
          maxUses: 1,
          transferable: true,
          merchantId: 'test_shop_001',
        },
      })

      // ACT
      const result = await mintVoucher(context, config)

      // ASSERT
      expect(result).toBeTruthy()
      expect(result.asset).toBeTruthy()
      expect(result.signature).toBeTruthy()
      expect(result.voucherAddress).toBeTruthy()
      expect(result.signature).toMatch(/^[1-9A-HJ-NP-Za-km-z]{86,88}$/)
    })
  })

  describe('unexpected usage', () => {
    describe('config validation', () => {
      it('should throw an error if the collection address is not set', async () => {
        expect.assertions(2)
        // ARRANGE
        const brokenConfig: MintVoucherConfig = createTestVoucherConfigEmpty({
          collectionAddress: '' as any,
        })

        // ACT
        try {
          await mintVoucher(context, brokenConfig)
        } catch (error) {
          // ASSERT
          expect(error).toBeDefined()
          expect(error.message).toEqual('assertValidMintVoucherConfig: Collection address is undefined')
        }
      })

      it('should throw an error if the recipient is not set', async () => {
        expect.assertions(2)
        // ARRANGE
        const brokenConfig: MintVoucherConfig = createTestVoucherConfigEmpty({
          collectionAddress: collectionAddress,
          recipient: '' as any,
          updateAuthority: collectionUpdateAuthority,
        })

        // ACT
        try {
          await mintVoucher(context, brokenConfig)
        } catch (error) {
          // ASSERT
          expect(error).toBeDefined()
          expect(error.message).toEqual('assertValidMintVoucherConfig: Recipient is undefined')
        }
      })

      it('should throw an error if the voucher name is not set', async () => {
        expect.assertions(2)
        // ARRANGE
        const brokenConfig: MintVoucherConfig = createTestVoucherConfigEmpty({
          collectionAddress: collectionAddress,
          recipient: context.umi.identity.publicKey,
          voucherName: '',
          updateAuthority: collectionUpdateAuthority,
        })

        // ACT
        try {
          await mintVoucher(context, brokenConfig)
        } catch (error) {
          // ASSERT
          expect(error).toBeDefined()
          expect(error.message).toEqual('assertValidMintVoucherConfig: Voucher name is undefined')
        }
      })

      it('should throw an error if the metadata URI is not set', async () => {
        expect.assertions(2)
        // ARRANGE
        const brokenConfig: MintVoucherConfig = createTestVoucherConfigEmpty({
          collectionAddress: collectionAddress,
          recipient: context.umi.identity.publicKey,
          voucherName: 'Test Voucher',
          voucherMetadataUri: '',
          updateAuthority: collectionUpdateAuthority,
        })

        // ACT
        try {
          await mintVoucher(context, brokenConfig)
        } catch (error) {
          // ASSERT
          expect(error).toBeDefined()
          expect(error.message).toEqual('assertValidMintVoucherConfig: Voucher metadata URI is undefined')
        }
      })

      it('should throw an error if the metadata URI is not a valid URL', async () => {
        expect.assertions(2)
        // ARRANGE
        const brokenConfig: MintVoucherConfig = createTestVoucherConfigEmpty({
          collectionAddress: collectionAddress,
          recipient: context.umi.identity.publicKey,
          voucherName: 'Test Voucher',
          voucherMetadataUri: 'foobar',
          updateAuthority: collectionUpdateAuthority,
        })

        // ACT
        try {
          await mintVoucher(context, brokenConfig)
        } catch (error) {
          // ASSERT
          expect(error).toBeDefined()
          expect(error.message).toEqual('assertValidMintVoucherConfig: Voucher metadata URI is not a valid URL')
        }
      })

      it('should throw an error if the voucher data is not set', async () => {
        expect.assertions(2)
        // ARRANGE
        const brokenConfig: MintVoucherConfig = createTestVoucherConfigEmpty({
          collectionAddress: collectionAddress,
          recipient: context.umi.identity.publicKey,
          voucherName: 'Test Voucher',
          voucherMetadataUri: 'https://arweave.net/test-metadata',
          updateAuthority: collectionUpdateAuthority,
          voucherData: undefined,
        })

        // ACT
        try {
          await mintVoucher(context, {
            ...brokenConfig,
            voucherData: undefined,
          } as unknown as MintVoucherConfig)
        } catch (error) {
          // ASSERT
          expect(error).toBeDefined()
          expect(error.message).toEqual('assertValidMintVoucherConfig: Voucher data is undefined')
        }
      })

      it('should throw an error if the voucher type is not set', async () => {
        expect.assertions(2)
        // ARRANGE
        const brokenConfig: MintVoucherConfig = createTestVoucherConfigEmpty({
          collectionAddress: collectionAddress,
          recipient: context.umi.identity.publicKey,
          voucherName: 'Test Voucher',
          voucherMetadataUri: 'https://arweave.net/test-metadata',
          updateAuthority: collectionUpdateAuthority,
          voucherData: {
            type: 'percentage_off' as any,
            value: 10,
            description: 'Test voucher',
            expiryDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
            maxUses: 1,
            merchantId: 'test_shop_001',
          },
        })

        // ACT
        try {
          await mintVoucher(context, {
            ...brokenConfig,
            voucherData: {
              ...brokenConfig.voucherData,
              type: undefined,
            },
          } as unknown as MintVoucherConfig)
        } catch (error) {
          // ASSERT
          expect(error).toBeDefined()
          expect(error.message).toEqual('assertValidMintVoucherConfig: Voucher type is undefined')
        }
      })

      it('should throw an error if the voucher value is negative', async () => {
        expect.assertions(2)
        // ARRANGE
        const brokenConfig: MintVoucherConfig = createTestVoucherConfigEmpty({
          collectionAddress: collectionAddress,
          recipient: context.umi.identity.publicKey,
          voucherName: 'Test Voucher',
          voucherMetadataUri: 'https://arweave.net/test-metadata',
          updateAuthority: collectionUpdateAuthority,
          voucherData: {
            type: 'percentage_off',
            value: -10,
            description: 'Test voucher',
            expiryDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
            maxUses: 1,
            merchantId: 'test_shop_001',
          },
        })

        // ACT
        try {
          await mintVoucher(context, brokenConfig)
        } catch (error) {
          // ASSERT
          expect(error).toBeDefined()
          expect(error.message).toEqual('assertValidMintVoucherConfig: Voucher value must be a non-negative number')
        }
      })

      it('should throw an error if the voucher description is not set', async () => {
        expect.assertions(2)
        // ARRANGE
        const brokenConfig: MintVoucherConfig = createTestVoucherConfigEmpty({
          collectionAddress: collectionAddress,
          recipient: context.umi.identity.publicKey,
          voucherName: 'Test Voucher',
          voucherMetadataUri: 'https://arweave.net/test-metadata',
          updateAuthority: collectionUpdateAuthority,
          voucherData: {
            type: 'percentage_off',
            value: 10,
            description: '',
            expiryDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
            maxUses: 1,
            merchantId: 'test_shop_001',
          },
        })

        // ACT
        try {
          await mintVoucher(context, brokenConfig)
        } catch (error) {
          // ASSERT
          expect(error).toBeDefined()
          expect(error.message).toEqual('assertValidMintVoucherConfig: Voucher description is undefined')
        }
      })

      it('should throw an error if the expiry date is in the past', async () => {
        expect.assertions(2)
        // ARRANGE
        const brokenConfig: MintVoucherConfig = createTestVoucherConfigEmpty({
          collectionAddress: collectionAddress,
          recipient: context.umi.identity.publicKey,
          voucherName: 'Test Voucher',
          voucherMetadataUri: 'https://arweave.net/test-metadata',
          updateAuthority: collectionUpdateAuthority,
          voucherData: {
            type: 'percentage_off',
            value: 10,
            description: 'Test voucher',
            expiryDate: Date.now() - 24 * 60 * 60 * 1000, // 1 day ago
            maxUses: 1,
            merchantId: 'test_shop_001',
          },
        })

        // ACT
        try {
          await mintVoucher(context, brokenConfig)
        } catch (error) {
          // ASSERT
          expect(error).toBeDefined()
          expect(error.message).toEqual('assertValidMintVoucherConfig: Voucher expiry date must be in the future')
        }
      })

      it('should throw an error if max uses is zero or negative', async () => {
        expect.assertions(2)
        // ARRANGE
        const brokenConfig: MintVoucherConfig = createTestVoucherConfigEmpty({
          collectionAddress: collectionAddress,
          recipient: context.umi.identity.publicKey,
          voucherName: 'Test Voucher',
          voucherMetadataUri: 'https://arweave.net/test-metadata',
          updateAuthority: collectionUpdateAuthority,
          voucherData: {
            type: 'percentage_off',
            value: 10,
            description: 'Test voucher',
            expiryDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
            maxUses: 0,
            merchantId: 'test_shop_001',
          },
        })

        // ACT
        try {
          await mintVoucher(context, brokenConfig)
        } catch (error) {
          // ASSERT
          expect(error).toBeDefined()
          expect(error.message).toEqual('assertValidMintVoucherConfig: Voucher max uses must be greater than 0')
        }
      })

      it('should throw an error if the merchant ID is not set', async () => {
        expect.assertions(2)
        // ARRANGE
        const brokenConfig: MintVoucherConfig = {
          collectionAddress: collectionAddress,
          recipient: context.umi.identity.publicKey,
          voucherName: 'Test Voucher',
          voucherMetadataUri: 'https://arweave.net/test-metadata',
          updateAuthority: feePayerSigner,
          voucherData: {
            type: 'percentage_off',
            value: 10,
            description: 'Test voucher',
            expiryDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
            maxUses: 1,
            merchantId: '', // This should trigger the error
          },
        }

        // ACT
        try {
          await mintVoucher(context, brokenConfig)
        } catch (error) {
          // ASSERT
          expect(error).toBeDefined()
          expect(error.message).toEqual('assertValidMintVoucherConfig: Merchant ID is undefined')
        }
      })
    })
  })
})
