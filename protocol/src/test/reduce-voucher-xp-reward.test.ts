import { beforeAll, describe, it, expect } from 'vitest'
import { generateSigner, PublicKey, keypairIdentity, createSignerFromKeypair } from '@metaplex-foundation/umi'
import { createVoucherCollection } from '../lib/create-voucher-collection'
import { mintVoucher } from '../lib/mint-voucher'
import { reduceVoucherXpReward } from '../lib/reduce-voucher-xp-reward'
import { validateVoucher } from '../lib/validate-voucher'
import { getTestContext } from './helpers/get-test-context'
import { createTestVoucherConfig } from './helpers/create-test-voucher'
import { ensureFeePayerBalance } from './helpers/ensure-fee-payer-balance'

const { feePayer, context } = getTestContext()

describe('reduceVoucherXpReward', { sequential: true, timeout: 30000 }, () => {
  let collectionAddress: PublicKey
  let collectionUpdateAuthority: any
  let voucherWithXpAddress: PublicKey
  let voucherWithoutXpAddress: PublicKey

  beforeAll(async () => {
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
    collectionUpdateAuthority = collectionResult.updateAuthority || updateAuthority

    // Create voucher with XP reward
    const voucherWithXpSigner = generateSigner(context.umi)
    const voucherWithXpResult = await mintVoucher(context, {
      ...createTestVoucherConfig(),
      collectionAddress,
      assetSigner: voucherWithXpSigner,
      updateAuthority: collectionUpdateAuthority,
      recipient: feePayer.publicKey,
      voucherData: {
        type: 'percentage_off',
        value: 20,
        description: '20% off with 500 XP reward',
        expiryDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
        maxUses: 3,
        merchantId: 'test_merchant_001',
        xpReward: 500,
      },
    })
    voucherWithXpAddress = voucherWithXpResult.voucherAddress

    // Create voucher without XP reward
    const voucherWithoutXpSigner = generateSigner(context.umi)
    const voucherWithoutXpResult = await mintVoucher(context, {
      ...createTestVoucherConfig(),
      collectionAddress,
      assetSigner: voucherWithoutXpSigner,
      updateAuthority: collectionUpdateAuthority,
      recipient: feePayer.publicKey,
      voucherData: {
        type: 'fixed_verxio_credits',
        value: 100,
        description: '100 Verxio Credits (no XP)',
        expiryDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
        maxUses: 1,
        merchantId: 'test_merchant_001',
      },
    })
    voucherWithoutXpAddress = voucherWithoutXpResult.voucherAddress
  })

  describe('successful XP reduction', () => {
    it('should reduce XP reward successfully', async () => {
      // Validate voucher before reduction
      const before = await validateVoucher(context, {
        voucherAddress: voucherWithXpAddress,
      })
      expect(before.voucher?.xpReward).toBe(500)

      // Reduce XP reward
      const result = await reduceVoucherXpReward(context, {
        voucherAddress: voucherWithXpAddress,
        updateAuthority: collectionUpdateAuthority,
        xpToReduce: 100,
        reason: 'Customer cashed out XP',
      })

      expect(result.success).toBe(true)
      expect(result.signature).toBeTruthy()
      expect(result.previousXpReward).toBe(500)
      expect(result.newXpReward).toBe(400)
      expect(result.updatedVoucher).toBeTruthy()
      expect(result.updatedVoucher!.xpReward).toBe(400)
      expect(result.errors).toHaveLength(0)

      // Validate voucher after reduction
      const after = await validateVoucher(context, {
        voucherAddress: voucherWithXpAddress,
      })
      expect(after.voucher?.xpReward).toBe(400)
    })

    it('should reduce XP reward to zero', async () => {
      // Reduce all remaining XP
      const result = await reduceVoucherXpReward(context, {
        voucherAddress: voucherWithXpAddress,
        updateAuthority: collectionUpdateAuthority,
        xpToReduce: 400,
      })

      expect(result.success).toBe(true)
      expect(result.previousXpReward).toBe(400)
      expect(result.newXpReward).toBe(0)
      expect(result.updatedVoucher!.xpReward).toBe(0)

      // Validate voucher after reduction
      const after = await validateVoucher(context, {
        voucherAddress: voucherWithXpAddress,
      })
      expect(after.voucher?.xpReward).toBe(0)
    })

    it('should handle partial XP reduction correctly', async () => {
      // Create a new voucher for this test
      const testVoucherSigner = generateSigner(context.umi)
      const testVoucherResult = await mintVoucher(context, {
        ...createTestVoucherConfig(),
        collectionAddress,
        assetSigner: testVoucherSigner,
        updateAuthority: collectionUpdateAuthority,
        recipient: feePayer.publicKey,
        voucherData: {
          type: 'percentage_off',
          value: 15,
          description: '15% off with 1000 XP',
          expiryDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
          maxUses: 2,
          merchantId: 'test_merchant_001',
          xpReward: 1000,
        },
      })

      // First reduction
      const firstReduction = await reduceVoucherXpReward(context, {
        voucherAddress: testVoucherResult.voucherAddress,
        updateAuthority: collectionUpdateAuthority,
        xpToReduce: 300,
      })

      expect(firstReduction.success).toBe(true)
      expect(firstReduction.previousXpReward).toBe(1000)
      expect(firstReduction.newXpReward).toBe(700)

      // Second reduction
      const secondReduction = await reduceVoucherXpReward(context, {
        voucherAddress: testVoucherResult.voucherAddress,
        updateAuthority: collectionUpdateAuthority,
        xpToReduce: 250,
      })

      expect(secondReduction.success).toBe(true)
      expect(secondReduction.previousXpReward).toBe(700)
      expect(secondReduction.newXpReward).toBe(450)

      // Validate final state
      const validation = await validateVoucher(context, {
        voucherAddress: testVoucherResult.voucherAddress,
      })
      expect(validation.voucher?.xpReward).toBe(450)
    })
  })

  describe('error handling', () => {
    it('should fail to reduce XP from voucher without XP reward', async () => {
      const result = await reduceVoucherXpReward(context, {
        voucherAddress: voucherWithoutXpAddress,
        updateAuthority: collectionUpdateAuthority,
        xpToReduce: 100,
      })

      expect(result.success).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors[0]).toContain('does not have any XP reward')
      expect(result.signature).toBeUndefined()
    })

    it('should fail when trying to reduce more XP than available', async () => {
      // Create a new voucher with limited XP
      const limitedXpSigner = generateSigner(context.umi)
      const limitedXpResult = await mintVoucher(context, {
        ...createTestVoucherConfig(),
        collectionAddress,
        assetSigner: limitedXpSigner,
        updateAuthority: collectionUpdateAuthority,
        recipient: feePayer.publicKey,
        voucherData: {
          type: 'percentage_off',
          value: 10,
          description: '10% off with 50 XP',
          expiryDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
          maxUses: 1,
          merchantId: 'test_merchant_001',
          xpReward: 50,
        },
      })

      const result = await reduceVoucherXpReward(context, {
        voucherAddress: limitedXpResult.voucherAddress,
        updateAuthority: collectionUpdateAuthority,
        xpToReduce: 100, // Trying to reduce more than available
      })

      expect(result.success).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors[0]).toContain('Cannot reduce')
      expect(result.signature).toBeUndefined()
    })

    it('should fail when XP to reduce is zero or negative', async () => {
      const result = await reduceVoucherXpReward(context, {
        voucherAddress: voucherWithXpAddress,
        updateAuthority: collectionUpdateAuthority,
        xpToReduce: 0,
      })

      expect(result.success).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors[0]).toContain('must be greater than 0')
    })

    it('should fail to reduce XP from cancelled voucher', async () => {
      // Create and cancel a voucher
      const cancelVoucherSigner = generateSigner(context.umi)
      const { cancelVoucher } = await import('../lib/cancel-voucher')

      const cancelVoucherResult = await mintVoucher(context, {
        ...createTestVoucherConfig(),
        collectionAddress,
        assetSigner: cancelVoucherSigner,
        updateAuthority: collectionUpdateAuthority,
        recipient: feePayer.publicKey,
        voucherData: {
          type: 'percentage_off',
          value: 15,
          description: '15% off with 200 XP',
          expiryDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
          maxUses: 1,
          merchantId: 'test_merchant_001',
          xpReward: 200,
        },
      })

      await cancelVoucher(context, {
        voucherAddress: cancelVoucherResult.voucherAddress,
        updateAuthority: collectionUpdateAuthority,
        reason: 'Test cancellation',
      })

      // Try to reduce XP from cancelled voucher
      const result = await reduceVoucherXpReward(context, {
        voucherAddress: cancelVoucherResult.voucherAddress,
        updateAuthority: collectionUpdateAuthority,
        xpToReduce: 100,
      })

      expect(result.success).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors[0]).toContain('cancelled')
    })

    it('should fail with invalid voucher address', async () => {
      const invalidAddress = generateSigner(context.umi).publicKey

      const result = await reduceVoucherXpReward(context, {
        voucherAddress: invalidAddress,
        updateAuthority: collectionUpdateAuthority,
        xpToReduce: 100,
      })

      expect(result.success).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors[0]).toContain('Failed to reduce voucher XP reward')
    })

    it('should fail with wrong update authority', async () => {
      const wrongAuthority = generateSigner(context.umi)

      // Create a new voucher
      const testVoucherSigner = generateSigner(context.umi)
      const testVoucherResult = await mintVoucher(context, {
        ...createTestVoucherConfig(),
        collectionAddress,
        assetSigner: testVoucherSigner,
        updateAuthority: collectionUpdateAuthority,
        recipient: feePayer.publicKey,
        voucherData: {
          type: 'percentage_off',
          value: 20,
          description: '20% off with 300 XP',
          expiryDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
          maxUses: 1,
          merchantId: 'test_merchant_001',
          xpReward: 300,
        },
      })

      const result = await reduceVoucherXpReward(context, {
        voucherAddress: testVoucherResult.voucherAddress,
        updateAuthority: wrongAuthority,
        xpToReduce: 100,
      })

      expect(result.success).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors[0]).toContain('Failed to reduce voucher XP reward')
    })
  })

  describe('edge cases', () => {
    it('should handle reducing exactly the remaining XP', async () => {
      // Create a new voucher with specific XP
      const exactXpSigner = generateSigner(context.umi)
      const exactXpResult = await mintVoucher(context, {
        ...createTestVoucherConfig(),
        collectionAddress,
        assetSigner: exactXpSigner,
        updateAuthority: collectionUpdateAuthority,
        recipient: feePayer.publicKey,
        voucherData: {
          type: 'percentage_off',
          value: 25,
          description: '25% off with 250 XP',
          expiryDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
          maxUses: 1,
          merchantId: 'test_merchant_001',
          xpReward: 250,
        },
      })

      const result = await reduceVoucherXpReward(context, {
        voucherAddress: exactXpResult.voucherAddress,
        updateAuthority: collectionUpdateAuthority,
        xpToReduce: 250, // Reduce exactly all remaining XP
      })

      expect(result.success).toBe(true)
      expect(result.previousXpReward).toBe(250)
      expect(result.newXpReward).toBe(0)
    })

    it('should preserve other voucher properties after XP reduction', async () => {
      // Create a new voucher
      const preserveSigner = generateSigner(context.umi)
      const preserveResult = await mintVoucher(context, {
        ...createTestVoucherConfig(),
        collectionAddress,
        assetSigner: preserveSigner,
        updateAuthority: collectionUpdateAuthority,
        recipient: feePayer.publicKey,
        voucherData: {
          type: 'fixed_verxio_credits',
          value: 500,
          description: '500 credits with 750 XP',
          expiryDate: Date.now() + 60 * 24 * 60 * 60 * 1000,
          maxUses: 5,
          merchantId: 'test_merchant_001',
          xpReward: 750,
        },
      })

      const before = await validateVoucher(context, {
        voucherAddress: preserveResult.voucherAddress,
      })

      const result = await reduceVoucherXpReward(context, {
        voucherAddress: preserveResult.voucherAddress,
        updateAuthority: collectionUpdateAuthority,
        xpToReduce: 200,
      })

      expect(result.success).toBe(true)

      const after = await validateVoucher(context, {
        voucherAddress: preserveResult.voucherAddress,
      })

      // Verify other properties remain unchanged
      expect(after.voucher?.type).toBe(before.voucher?.type)
      expect(after.voucher?.value).toBe(before.voucher?.value)
      expect(after.voucher?.description).toBe(before.voucher?.description)
      expect(after.voucher?.expiryDate).toBe(before.voucher?.expiryDate)
      expect(after.voucher?.maxUses).toBe(before.voucher?.maxUses)
      expect(after.voucher?.currentUses).toBe(before.voucher?.currentUses)
      expect(after.voucher?.status).toBe(before.voucher?.status)
      expect(after.voucher?.merchantId).toBe(before.voucher?.merchantId)

      // Only XP reward should change
      expect(after.voucher?.xpReward).toBe(before.voucher!.xpReward! - 200)
    })
  })
})
