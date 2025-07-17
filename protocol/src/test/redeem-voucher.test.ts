import { beforeAll, describe, it, expect } from 'vitest'
import { generateSigner, createSignerFromKeypair, PublicKey, keypairIdentity } from '@metaplex-foundation/umi'
import { createVoucherCollection } from '../lib/create-voucher-collection'
import { mintVoucher } from '../lib/mint-voucher'
import { redeemVoucher } from '../lib/redeem-voucher'
import { validateVoucher } from '../lib/validate-voucher'
import { getTestContext } from './helpers/get-test-context'
import { createTestVoucherConfig } from './helpers/create-test-voucher'
import { ensureFeePayerBalance } from './helpers/ensure-fee-payer-balance'

const { feePayer, context } = getTestContext()

describe('redeemVoucher', { sequential: true, timeout: 30000 }, () => {
  let collectionAddress: PublicKey
  let percentageOffVoucherAddress: PublicKey
  let fixedCreditsVoucherAddress: PublicKey

  beforeAll(async () => {
    // Set the signer identity
    await ensureFeePayerBalance(context.umi, {
      account: feePayer.publicKey,
      amount: 1,
    })
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
        updateAuthority,
        redemptionAmount: 100,
      })

      expect(result.success).toBe(true)

      // Verify voucher is now marked as used
      const validation = await validateVoucher(context, {
        voucherAddress: singleUseSigner.publicKey,
      })

      expect(validation.voucher).toBeDefined()
      expect(validation.voucher!.status).toBe('used')
    })
  })

  describe('Redemption history tracking', () => {
    it('should record redemption history after successful redemption', async () => {
      const updateAuthority = createSignerFromKeypair(context.umi, feePayer)

      // Create a new voucher for this test
      const historyVoucherSigner = generateSigner(context.umi)
      const historyConfig = createTestVoucherConfig({
        collectionAddress,
        updateAuthority,
        assetSigner: historyVoucherSigner,
        voucherData: {
          type: 'percentage_off',
          value: 25,
          description: '25% off with history tracking',
          expiryDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
          maxUses: 2,
          transferable: false,
          merchantId: 'test_merchant_001',
        },
      })

      await mintVoucher(context, historyConfig)

      // Redeem voucher with details
      const result = await redeemVoucher(context, {
        voucherAddress: historyVoucherSigner.publicKey,
        merchantId: 'test_merchant_001',
        updateAuthority,
        redemptionAmount: 200,
        redemptionDetails: {
          transactionId: 'tx_123',
          items: ['coffee', 'sandwich'],
          totalAmount: 200,
          discountApplied: 50,
        },
      })

      expect(result.success).toBe(true)

      // Verify redemption history was recorded
      const validation = await validateVoucher(context, {
        voucherAddress: historyVoucherSigner.publicKey,
      })

      expect(validation.voucher).toBeDefined()
      expect(validation.voucher!.redemptionHistory).toBeDefined()
      expect(validation.voucher!.redemptionHistory!.length).toBe(1)

      const redemptionRecord = validation.voucher!.redemptionHistory![0]
      expect(redemptionRecord.timestamp).toBeGreaterThan(0)
      expect(redemptionRecord.redemptionValue).toBe(50) // 25% of 200
      expect(redemptionRecord.transactionId).toBe('tx_123')
      expect(redemptionRecord.items).toEqual(['coffee', 'sandwich'])
      expect(redemptionRecord.totalAmount).toBe(200)
      expect(redemptionRecord.discountApplied).toBe(50)
    })

    it('should accumulate multiple redemption records', async () => {
      const updateAuthority = createSignerFromKeypair(context.umi, feePayer)

      // Create a multi-use voucher
      const multiUseVoucherSigner = generateSigner(context.umi)
      const multiUseConfig = createTestVoucherConfig({
        collectionAddress,
        updateAuthority,
        assetSigner: multiUseVoucherSigner,
        voucherData: {
          type: 'fixed_verxio_credits',
          value: 50,
          description: '50 credits multi-use',
          expiryDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
          maxUses: 3,
          transferable: false,
          merchantId: 'test_merchant_001',
        },
      })

      await mintVoucher(context, multiUseConfig)

      // First redemption
      await redeemVoucher(context, {
        voucherAddress: multiUseVoucherSigner.publicKey,
        merchantId: 'test_merchant_001',
        updateAuthority,
        redemptionAmount: 100,
        redemptionDetails: {
          transactionId: 'tx_1',
          totalAmount: 100,
        },
      })

      // Second redemption
      await redeemVoucher(context, {
        voucherAddress: multiUseVoucherSigner.publicKey,
        merchantId: 'test_merchant_001',
        updateAuthority,
        redemptionAmount: 150,
        redemptionDetails: {
          transactionId: 'tx_2',
          totalAmount: 150,
        },
      })

      // Verify both redemptions are recorded
      const validation = await validateVoucher(context, {
        voucherAddress: multiUseVoucherSigner.publicKey,
      })

      expect(validation.voucher).toBeDefined()
      expect(validation.voucher!.redemptionHistory).toBeDefined()
      expect(validation.voucher!.redemptionHistory!.length).toBe(2)
      expect(validation.voucher!.currentUses).toBe(2)
      expect(validation.voucher!.status).toBe('active') // Still has 1 use left

      // Check first redemption record
      const firstRecord = validation.voucher!.redemptionHistory![0]
      expect(firstRecord.transactionId).toBe('tx_1')
      expect(firstRecord.redemptionValue).toBe(50) // Fixed credits value

      // Check second redemption record
      const secondRecord = validation.voucher!.redemptionHistory![1]
      expect(secondRecord.transactionId).toBe('tx_2')
      expect(secondRecord.redemptionValue).toBe(50) // Fixed credits value
    })
  })
})
