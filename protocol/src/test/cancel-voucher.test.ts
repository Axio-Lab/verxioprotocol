import { beforeAll, describe, it, expect } from 'vitest'
import { generateSigner, createSignerFromKeypair, PublicKey, keypairIdentity } from '@metaplex-foundation/umi'
import { createVoucherCollection } from '../lib/create-voucher-collection'
import { mintVoucher } from '../lib/mint-voucher'
import { cancelVoucher } from '../lib/cancel-voucher'
import { validateVoucher } from '../lib/validate-voucher'
import { getTestContext } from './helpers/get-test-context'
import { createTestVoucherConfig } from './helpers/create-test-voucher'

const { feePayer, context } = getTestContext()

describe('cancelVoucher', { sequential: true, timeout: 30000 }, () => {
  let collectionAddress: PublicKey
  let collectionUpdateAuthority: any
  let activeVoucherAddress: PublicKey
  let usedVoucherAddress: PublicKey

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

    // Create active voucher
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
        expiryDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
        maxUses: 3,
        merchantId: 'test_merchant_001',
      },
    })
    activeVoucherAddress = activeVoucherResult.voucherAddress

    // Create used voucher (we'll mark it as used by setting currentUses = maxUses)
    const usedVoucherSigner = generateSigner(context.umi)
    const usedVoucherResult = await mintVoucher(context, {
      ...createTestVoucherConfig(),
      collectionAddress,
      assetSigner: usedVoucherSigner,
      updateAuthority: collectionUpdateAuthority,
      recipient: feePayer.publicKey,
      voucherData: {
        type: 'fixed_verxio_credits',
        value: 100,
        description: '100 Verxio Credits',
        expiryDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
        maxUses: 1,
        merchantId: 'test_merchant_001',
      },
    })
    usedVoucherAddress = usedVoucherResult.voucherAddress
  })

  describe('successful cancellation', () => {
    it('should cancel an active voucher', async () => {
      const result = await cancelVoucher(context, {
        voucherAddress: activeVoucherAddress,
        updateAuthority: collectionUpdateAuthority,
        reason: 'Merchant request',
      })

      expect(result.success).toBe(true)
      expect(result.signature).toBeTruthy()
      expect(result.updatedVoucher).toBeTruthy()
      expect(result.updatedVoucher!.status).toBe('cancelled')
      expect(result.updatedVoucher!.usedAt).toBeTruthy()
      expect(result.errors).toHaveLength(0)
    })

    it('should update voucher status to cancelled', async () => {
      // Validate the voucher to check its status
      const validation = await validateVoucher(context, {
        voucherAddress: activeVoucherAddress,
        merchantId: 'test_merchant_001',
      })

      expect(validation.isValid).toBe(false)
      expect(validation.errors).toContain('Voucher is cancelled')
      expect(validation.voucher!.status).toBe('cancelled')
    })
  })

  describe('error handling', () => {
    it('should fail to cancel an already cancelled voucher', async () => {
      const result = await cancelVoucher(context, {
        voucherAddress: activeVoucherAddress,
        updateAuthority: collectionUpdateAuthority,
      })

      expect(result.success).toBe(false)
      expect(result.errors).toContain('Voucher is already cancelled')
    })

    it('should fail with invalid voucher address', async () => {
      const invalidAddress = generateSigner(context.umi).publicKey

      const result = await cancelVoucher(context, {
        voucherAddress: invalidAddress,
        updateAuthority: collectionUpdateAuthority,
      })

      expect(result.success).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors[0]).toContain('Failed to cancel voucher')
    })

    it('should fail with wrong update authority', async () => {
      const wrongAuthority = generateSigner(context.umi)

      const result = await cancelVoucher(context, {
        voucherAddress: usedVoucherAddress,
        updateAuthority: wrongAuthority,
      })

      expect(result.success).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors[0]).toContain('Failed to cancel voucher')
    })
  })

  describe('validation after cancellation', () => {
    it('should prevent redemption of cancelled voucher', async () => {
      const validation = await validateVoucher(context, {
        voucherAddress: activeVoucherAddress,
        merchantId: 'test_merchant_001',
        redemptionContext: {
          purchaseAmount: 100,
        },
      })

      expect(validation.isValid).toBe(false)
      expect(validation.errors).toContain('Voucher is cancelled')
    })
  })
})
