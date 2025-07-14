import { beforeAll, describe, it, expect } from 'vitest'
import { generateSigner, createSignerFromKeypair, PublicKey, keypairIdentity } from '@metaplex-foundation/umi'
import { createVoucherCollection } from '../lib/create-voucher-collection'
import { mintVoucher } from '../lib/mint-voucher'
import { redeemVoucher } from '../lib/redeem-voucher'
import { validateVoucher } from '../lib/validate-voucher'
import { getTestContext } from './helpers/get-test-context'
import { createTestVoucherConfig } from './helpers/create-test-voucher'

const { feePayer, context } = getTestContext()

describe('redeemVoucher', { sequential: true, timeout: 30000 }, () => {
  let collectionAddress: PublicKey
  let percentageOffVoucherAddress: PublicKey
  let fixedCreditsVoucherAddress: PublicKey

  beforeAll(async () => {
    // Set the signer identity
    context.umi.use(keypairIdentity(feePayer))
    // Create voucher collection
    const collectionSigner = generateSigner(context.umi)
    const updateAuthority = createSignerFromKeypair(context.umi, feePayer)

    const collectionResult = await createVoucherCollection(context, {
      collectionSigner,
      metadataUri: 'https://arweave.net/test-collection',
      voucherCollectionName: 'Test Voucher Collection',
      programAuthority: context.programAuthority,
      updateAuthority,
      metadata: {
        merchantName: 'Test Merchant',
        merchantAddress: 'test_merchant_001',
        voucherTypes: ['percentage_off', 'fixed_verxio_credits'],
      },
    })

    collectionAddress = collectionResult.collection.publicKey

    // Create percentage off voucher
    const percentageOffSigner = generateSigner(context.umi)
    const percentageOffConfig = createTestVoucherConfig({
      collectionAddress,
      updateAuthority,
      assetSigner: percentageOffSigner,
      voucherData: {
        type: 'percentage_off',
        value: 20,
        description: '20% off your next purchase',
        expiryDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
        maxUses: 1,
        transferable: false,
        merchantId: 'test_merchant_001',
      },
    })

    await mintVoucher(context, percentageOffConfig)
    percentageOffVoucherAddress = percentageOffSigner.publicKey

    // Create fixed credits voucher
    const fixedCreditsSigner = generateSigner(context.umi)
    const fixedCreditsConfig = createTestVoucherConfig({
      collectionAddress,
      updateAuthority,
      assetSigner: fixedCreditsSigner,
      voucherData: {
        type: 'fixed_verxio_credits',
        value: 100,
        description: '100 Verxio credits',
        expiryDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
        maxUses: 1,
        transferable: false,
        merchantId: 'test_merchant_001',
      },
    })

    await mintVoucher(context, fixedCreditsConfig)
    fixedCreditsVoucherAddress = fixedCreditsSigner.publicKey
  })

  describe('Successful redemptions', () => {
    it('should redeem percentage off voucher successfully', async () => {
      const updateAuthority = createSignerFromKeypair(context.umi, feePayer)

      const result = await redeemVoucher(context, {
        voucherAddress: percentageOffVoucherAddress,
        merchantId: 'test_merchant_001',
        redemptionContext: {
          purchaseAmount: 100,
        },
        updateAuthority,
        redemptionAmount: 100,
      })

      console.log('Percentage off redemption result:', result)
      expect(result.success).toBe(true)
      expect(result.redemptionValue).toBe(20) // 20% of 100
      expect(result.signature).toBeDefined()
      expect(result.errors).toHaveLength(0)
    })

    it('should redeem fixed credits voucher successfully', async () => {
      const updateAuthority = createSignerFromKeypair(context.umi, feePayer)

      const result = await redeemVoucher(context, {
        voucherAddress: fixedCreditsVoucherAddress,
        merchantId: 'test_merchant_001',
        redemptionContext: {
          purchaseAmount: 150,
        },
        updateAuthority,
        redemptionAmount: 150,
      })

      expect(result.success).toBe(true)
      expect(result.redemptionValue).toBe(100) // Fixed 100 credits
      expect(result.signature).toBeDefined()
      expect(result.errors).toHaveLength(0)
    })
  })

  describe('Failed redemptions', () => {
    it('should fail redemption for invalid voucher', async () => {
      const updateAuthority = createSignerFromKeypair(context.umi, feePayer)
      const invalidAddress = generateSigner(context.umi).publicKey

      const result = await redeemVoucher(context, {
        voucherAddress: invalidAddress,
        merchantId: 'test_merchant_001',
        redemptionContext: {
          purchaseAmount: 100,
        },
        updateAuthority,
        redemptionAmount: 100,
      })

      expect(result.success).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.signature).toBeUndefined()
    })

    it('should fail redemption for wrong merchant', async () => {
      const updateAuthority = createSignerFromKeypair(context.umi, feePayer)

      // Create a new voucher for this test
      const wrongMerchantSigner = generateSigner(context.umi)

      const wrongMerchantConfig = createTestVoucherConfig({
        collectionAddress,
        updateAuthority,
        assetSigner: wrongMerchantSigner,
        voucherData: {
          type: 'percentage_off',
          value: 15,
          description: '15% off',
          expiryDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
          maxUses: 1,
          transferable: false,
          merchantId: 'test_merchant_001',
        },
      })

      await mintVoucher(context, wrongMerchantConfig)

      const result = await redeemVoucher(context, {
        voucherAddress: wrongMerchantSigner.publicKey,
        merchantId: 'wrong_merchant',
        redemptionContext: {
          purchaseAmount: 100,
        },
        updateAuthority,
        redemptionAmount: 100,
      })

      expect(result.success).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.signature).toBeUndefined()
    })
  })

  describe('Voucher state updates', () => {
    it('should mark single-use voucher as used after redemption', async () => {
      const updateAuthority = createSignerFromKeypair(context.umi, feePayer)

      // Create new single-use voucher
      const singleUseSigner = generateSigner(context.umi)

      const singleUseConfig = createTestVoucherConfig({
        collectionAddress,
        updateAuthority,
        assetSigner: singleUseSigner,
        voucherData: {
          type: 'percentage_off',
          value: 15,
          description: '15% off single use',
          expiryDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
          maxUses: 1,
          transferable: false,
          merchantId: 'test_merchant_001',
        },
      })

      await mintVoucher(context, singleUseConfig)

      // Redeem voucher
      const result = await redeemVoucher(context, {
        voucherAddress: singleUseSigner.publicKey,
        merchantId: 'test_merchant_001',
        redemptionContext: {
          purchaseAmount: 100,
        },
        updateAuthority,
        redemptionAmount: 100,
      })

      expect(result.success).toBe(true)

      // Verify voucher is now marked as used
      const validation = await validateVoucher(context, {
        voucherAddress: singleUseSigner.publicKey,
        merchantId: 'test_merchant_001',
      })

      expect(validation.isValid).toBe(false)
      expect(validation.errors).toContain('Voucher is used')
    })
  })
})
