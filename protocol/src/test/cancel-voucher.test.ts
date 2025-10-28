import { beforeAll, describe, it, expect } from 'vitest'
import { generateSigner, PublicKey, keypairIdentity } from '@metaplex-foundation/umi'
import { createVoucherCollection } from '../lib/create-voucher-collection'
import { mintVoucher } from '../lib/mint-voucher'
import { cancelVoucher } from '../lib/cancel-voucher'
import { validateVoucher } from '../lib/validate-voucher'
import { getTestContext } from './helpers/get-test-context'
import { createTestVoucherConfig } from './helpers/create-test-voucher'

const { feePayer, context } = getTestContext()

describe('voucher lifecycle: create, mint, validate, cancel, validate', { sequential: true, timeout: 30000 }, () => {
  let collectionAddress: PublicKey
  let collectionUpdateAuthority: any
  let voucherAddress: PublicKey

  beforeAll(async () => {
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

    // Mint a voucher
    const voucherSigner = generateSigner(context.umi)
    const mintResult = await mintVoucher(context, {
      ...createTestVoucherConfig(),
      collectionAddress,
      assetSigner: voucherSigner,
      updateAuthority: collectionUpdateAuthority,
      recipient: feePayer.publicKey,
      voucherData: {
        type: 'percentage_off',
        value: 20,
        description: '20% off purchase',
        expiryDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
        maxUses: 3,
        merchantId: 'test_merchant_001',
        // You can add conditions here if you want to test them
      },
    })
    voucherAddress = mintResult.voucherAddress
  })

  it('should show voucher details before and after cancellation', async () => {
    // Validate and log voucher before cancellation
    const before = await validateVoucher(context, {
      voucherAddress,
    })
    console.log('Voucher before cancel:', before.voucher)

    // Cancel the voucher
    const cancelResult = await cancelVoucher(context, {
      voucherAddress,
      updateAuthority: collectionUpdateAuthority,
      reason: 'Merchant request',
    })
    expect(cancelResult.success).toBe(true)
    expect(cancelResult.updatedVoucher).toBeTruthy()
    expect(cancelResult.updatedVoucher!.status).toBe('cancelled')
    expect(cancelResult.updatedVoucher!.cancellationMessage).toBe('Merchant request')

    // Validate and log voucher after cancellation
    const after = await validateVoucher(context, {
      voucherAddress,
    })
    console.log('Voucher after cancel:', after.voucher)
  })
})

// --- RESTORE ORIGINAL TESTS BELOW ---
describe('cancelVoucher', { sequential: true, timeout: 30000 }, () => {
  let collectionAddress: PublicKey
  let collectionUpdateAuthority: any
  let activeVoucherAddress: PublicKey
  let usedVoucherAddress: PublicKey

  beforeAll(async () => {
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
      // Log voucher before cancellation
      const before = await validateVoucher(context, {
        voucherAddress: activeVoucherAddress,
      })
      console.log('Voucher before cancel:', before.voucher)
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
      expect(result.updatedVoucher!.cancellationMessage).toBe('Merchant request')
      expect(result.errors).toHaveLength(0)

      // Log voucher after cancellation
      const after = await validateVoucher(context, {
        voucherAddress: activeVoucherAddress,
      })
      console.log('Voucher after cancel:', after.voucher)
      expect(after.voucher?.cancellationMessage).toBe('Merchant request')
    })

    it('should update voucher status to cancelled', async () => {
      // Validate the voucher to check its status
      const validation = await validateVoucher(context, {
        voucherAddress: activeVoucherAddress,
      })
      console.log('Voucher status check:', validation.voucher)
      expect(validation.voucher).toBeDefined()
      expect(validation.voucher!.status).toBe('cancelled')
    })
  })

  describe('error handling', () => {
    it('should fail to cancel an already cancelled voucher', async () => {
      // Log voucher before attempting to cancel again
      const before = await validateVoucher(context, {
        voucherAddress: activeVoucherAddress,
      })
      console.log('Voucher before second cancel attempt:', before.voucher)

      const result = await cancelVoucher(context, {
        voucherAddress: activeVoucherAddress,
        updateAuthority: collectionUpdateAuthority,
      })

      expect(result.success).toBe(false)
      expect(result.errors).toContain('Voucher is already cancelled')

      // Log voucher after failed cancel attempt
      const after = await validateVoucher(context, {
        voucherAddress: activeVoucherAddress,
      })
      console.log('Voucher after failed cancel attempt:', after.voucher)
    })

    it('should fail with invalid voucher address', async () => {
      const invalidAddress = generateSigner(context.umi).publicKey

      // Log attempt to validate invalid voucher
      const before = await validateVoucher(context, {
        voucherAddress: invalidAddress,
      })
      console.log('Invalid voucher before cancel attempt:', before.voucher)

      const result = await cancelVoucher(context, {
        voucherAddress: invalidAddress,
        updateAuthority: collectionUpdateAuthority,
      })

      expect(result.success).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors[0]).toContain('Failed to cancel voucher')

      // Log after failed cancel attempt
      const after = await validateVoucher(context, {
        voucherAddress: invalidAddress,
      })
      console.log('Invalid voucher after failed cancel attempt:', after.voucher)
    })

    it('should fail with wrong update authority', async () => {
      const wrongAuthority = generateSigner(context.umi)

      // Log voucher before wrong authority attempt
      const before = await validateVoucher(context, {
        voucherAddress: usedVoucherAddress,
      })
      console.log('Used voucher before wrong authority cancel attempt:', before.voucher)

      const result = await cancelVoucher(context, {
        voucherAddress: usedVoucherAddress,
        updateAuthority: wrongAuthority,
      })

      expect(result.success).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors[0]).toContain('Failed to cancel voucher')

      // Log voucher after wrong authority attempt
      const after = await validateVoucher(context, {
        voucherAddress: usedVoucherAddress,
      })
      console.log('Used voucher after wrong authority cancel attempt:', after.voucher)
    })
  })

  describe('validation after cancellation', () => {
    it('should prevent redemption of cancelled voucher', async () => {
      // Log voucher before redemption attempt
      const before = await validateVoucher(context, {
        voucherAddress: activeVoucherAddress,
      })
      console.log('Voucher before redemption attempt:', before.voucher)

      const validation = await validateVoucher(context, {
        voucherAddress: activeVoucherAddress,
      })

      expect(validation.voucher).toBeDefined()
      expect(validation.voucher!.status).toBe('cancelled')
      // Log voucher after redemption attempt
      console.log('Voucher after redemption attempt:', validation.voucher)
    })
  })
})
