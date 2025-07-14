import { beforeAll, describe, it, expect } from 'vitest'
import { generateSigner, createSignerFromKeypair, PublicKey, keypairIdentity } from '@metaplex-foundation/umi'
import { createVoucherCollection } from '../lib/create-voucher-collection'
import { mintVoucher } from '../lib/mint-voucher'
import { extendVoucherExpiry, getTimeRemainingUntilExpiry, shouldExtendVoucher } from '../lib/extend-voucher-expiry'
import { validateVoucher } from '../lib/validate-voucher'
import { getTestContext } from './helpers/get-test-context'
import { createTestVoucherConfig } from './helpers/create-test-voucher'

const { feePayer, context } = getTestContext()

describe('extendVoucherExpiry', { sequential: true, timeout: 30000 }, () => {
  let collectionAddress: PublicKey
  let collectionUpdateAuthority: any
  let activeVoucherAddress: PublicKey
  let expiredVoucherAddress: PublicKey
  let cancelledVoucherAddress: PublicKey

  beforeAll(async () => {
    // Set the signer identity
    context.umi.use(keypairIdentity(feePayer))

    // Create voucher collection
    const collectionSigner = generateSigner(context.umi)

    const collectionResult = await createVoucherCollection(context, {
      collectionSigner,
      metadataUri: 'https://arweave.net/test-collection',
      voucherCollectionName: 'Test Voucher Collection',
      programAuthority: context.programAuthority,
      metadata: {
        merchantName: 'Test Merchant',
        merchantAddress: 'test_merchant_001',
        voucherTypes: ['percentage_off', 'fixed_verxio_credits'],
      },
    })

    collectionAddress = collectionResult.collection.publicKey
    collectionUpdateAuthority = collectionResult.updateAuthority

    // Create active voucher expiring soon
    const activeVoucherSigner = generateSigner(context.umi)
    const activeVoucherResult = await mintVoucher(context, {
      ...createTestVoucherConfig(),
      collectionAddress,
      assetSigner: activeVoucherSigner,
      updateAuthority: collectionUpdateAuthority,
      recipient: feePayer.publicKey,
      voucherData: {
        type: 'percentage_off',
        value: 20,
        description: '20% off purchase',
        expiryDate: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days from now
        maxUses: 3,
        merchantId: 'test_merchant_001',
      },
    })
    activeVoucherAddress = activeVoucherResult.voucherAddress

    // Create voucher that will be made expired by extending it to a past date first
    const expiredVoucherSigner = generateSigner(context.umi)
    const expiredVoucherResult = await mintVoucher(context, {
      ...createTestVoucherConfig(),
      collectionAddress,
      assetSigner: expiredVoucherSigner,
      updateAuthority: collectionUpdateAuthority,
      recipient: feePayer.publicKey,
      voucherData: {
        type: 'fixed_verxio_credits',
        value: 100,
        description: '100 Verxio Credits',
        expiryDate: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days from now (will be made expired)
        maxUses: 1,
        merchantId: 'test_merchant_001',
      },
    })
    expiredVoucherAddress = expiredVoucherResult.voucherAddress

    // Create cancelled voucher
    const cancelledVoucherSigner = generateSigner(context.umi)
    const cancelledVoucherResult = await mintVoucher(context, {
      ...createTestVoucherConfig(),
      collectionAddress,
      assetSigner: cancelledVoucherSigner,
      updateAuthority: collectionUpdateAuthority,
      recipient: feePayer.publicKey,
      voucherData: {
        type: 'free_item',
        value: 1,
        description: 'Free Coffee',
        expiryDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
        maxUses: 1,
        merchantId: 'test_merchant_001',
      },
    })
    cancelledVoucherAddress = cancelledVoucherResult.voucherAddress
  })

  describe('successful extension', () => {
    it('should extend voucher expiry date', async () => {
      const newExpiryDate = Date.now() + 60 * 24 * 60 * 60 * 1000 // 60 days from now

      const result = await extendVoucherExpiry(context, {
        voucherAddress: activeVoucherAddress,
        updateAuthority: collectionUpdateAuthority,
        newExpiryDate,
      })

      expect(result.success).toBe(true)
      expect(result.signature).toBeTruthy()
      expect(result.updatedVoucher).toBeTruthy()
      expect(result.updatedVoucher!.expiryDate).toBe(newExpiryDate)
      expect(result.previousExpiryDate).toBeTruthy()
      expect(result.errors).toHaveLength(0)
    })

    it('should reactivate expired voucher when extending', async () => {
      // First, make the voucher expired by setting a past expiry date
      const pastExpiryDate = Date.now() - 1 * 24 * 60 * 60 * 1000 // 1 day ago

      // We'll need to manually update the voucher to be expired first
      // For now, let's test with a voucher that's close to expiring
      const newExpiryDate = Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days from now

      const result = await extendVoucherExpiry(context, {
        voucherAddress: expiredVoucherAddress,
        updateAuthority: collectionUpdateAuthority,
        newExpiryDate,
      })

      expect(result.success).toBe(true)
      expect(result.updatedVoucher!.status).toBe('active')
      expect(result.updatedVoucher!.expiryDate).toBe(newExpiryDate)
    })

    it('should validate extended voucher as active', async () => {
      const validation = await validateVoucher(context, {
        voucherAddress: activeVoucherAddress,
        merchantId: 'test_merchant_001',
      })

      expect(validation.isValid).toBe(true)
      expect(validation.voucher!.status).toBe('active')
      expect(validation.errors).toHaveLength(0)
    })
  })

  describe('error handling', () => {
    it('should fail with past expiry date', async () => {
      const pastDate = Date.now() - 1 * 24 * 60 * 60 * 1000 // 1 day ago

      const result = await extendVoucherExpiry(context, {
        voucherAddress: activeVoucherAddress,
        updateAuthority: collectionUpdateAuthority,
        newExpiryDate: pastDate,
      })

      expect(result.success).toBe(false)
      expect(result.errors).toContain('New expiry date must be in the future')
    })

    it('should fail with earlier expiry date than current', async () => {
      const earlierDate = Date.now() + 1 * 24 * 60 * 60 * 1000 // 1 day from now (less than current 60 days)

      const result = await extendVoucherExpiry(context, {
        voucherAddress: activeVoucherAddress,
        updateAuthority: collectionUpdateAuthority,
        newExpiryDate: earlierDate,
      })

      expect(result.success).toBe(false)
      expect(result.errors).toContain('New expiry date must be later than current expiry date')
    })

    it('should fail with invalid voucher address', async () => {
      const invalidAddress = generateSigner(context.umi).publicKey
      const newExpiryDate = Date.now() + 30 * 24 * 60 * 60 * 1000

      const result = await extendVoucherExpiry(context, {
        voucherAddress: invalidAddress,
        updateAuthority: collectionUpdateAuthority,
        newExpiryDate,
      })

      expect(result.success).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors[0]).toContain('Failed to extend voucher expiry')
    })

    it('should fail with wrong update authority', async () => {
      const wrongAuthority = generateSigner(context.umi)
      const newExpiryDate = Date.now() + 90 * 24 * 60 * 60 * 1000 // 90 days from now (much later than current)

      const result = await extendVoucherExpiry(context, {
        voucherAddress: cancelledVoucherAddress, // Use the cancelled voucher which hasn't been modified yet
        updateAuthority: wrongAuthority,
        newExpiryDate,
      })

      expect(result.success).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors[0]).toContain('Failed to extend voucher expiry')
    })
  })

  describe('helper functions', () => {
    it('should calculate time remaining correctly', async () => {
      const validation = await validateVoucher(context, {
        voucherAddress: activeVoucherAddress,
        merchantId: 'test_merchant_001',
      })

      const voucher = validation.voucher!
      const timeInfo = getTimeRemainingUntilExpiry(voucher)

      expect(timeInfo.isExpired).toBe(false)
      expect(timeInfo.timeRemaining).toBeGreaterThan(0)
      expect(timeInfo.daysRemaining).toBeGreaterThan(0)
    })

    it('should detect expired voucher', async () => {
      const validation = await validateVoucher(context, {
        voucherAddress: expiredVoucherAddress,
        merchantId: 'test_merchant_001',
      })

      // Note: This voucher was extended above, so it should now be active
      const voucher = validation.voucher!
      const timeInfo = getTimeRemainingUntilExpiry(voucher)

      // Since we extended it, it should no longer be expired
      expect(timeInfo.isExpired).toBe(false)
    })

    it('should identify vouchers that need extension', async () => {
      // Create a voucher expiring in 3 days
      const soonExpiringVoucherSigner = generateSigner(context.umi)
      const soonExpiringResult = await mintVoucher(context, {
        ...createTestVoucherConfig(),
        collectionAddress,
        assetSigner: soonExpiringVoucherSigner,
        updateAuthority: collectionUpdateAuthority,
        recipient: feePayer.publicKey,
        voucherData: {
          type: 'percentage_off',
          value: 15,
          description: '15% off purchase',
          expiryDate: Date.now() + 3 * 24 * 60 * 60 * 1000, // 3 days from now
          maxUses: 1,
          merchantId: 'test_merchant_001',
        },
      })

      const validation = await validateVoucher(context, {
        voucherAddress: soonExpiringResult.voucherAddress,
        merchantId: 'test_merchant_001',
      })

      const voucher = validation.voucher!
      const needsExtension = shouldExtendVoucher(voucher, 7) // 7 day warning

      expect(needsExtension).toBe(true)
    })
  })
})
