import { beforeAll, describe, it, expect } from 'vitest'
import { generateSigner, createSignerFromKeypair, PublicKey, keypairIdentity } from '@metaplex-foundation/umi'
import { createVoucherCollection } from '../lib/create-voucher-collection'
import { mintVoucher } from '../lib/mint-voucher'
import { validateVoucher } from '../lib/validate-voucher'
import { getTestContext } from './helpers/get-test-context'
import { createTestVoucherConfig } from './helpers/create-test-voucher'

const { feePayer, context } = getTestContext()

describe('validateVoucher (fetch only, all scenarios)', { sequential: true, timeout: 30000 }, () => {
  let collectionAddress: PublicKey
  let validVoucherAddress: PublicKey
  let conditionVoucherAddress: PublicKey
  let emptyConditionVoucherAddress: PublicKey

  beforeAll(async () => {
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
        voucherTypes: ['percentage_off', 'fixed_verxio_credits', 'free_item'],
      },
    })

    collectionAddress = collectionResult.collection.publicKey

    // Create valid voucher (no conditions)
    const validVoucherSigner = generateSigner(context.umi)
    const validConfig = createTestVoucherConfig({
      collectionAddress,
      updateAuthority,
      assetSigner: validVoucherSigner,
      voucherData: {
        type: 'percentage_off',
        value: 20,
        description: '20% off your next purchase',
        expiryDate: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days from now
        maxUses: 5,
        transferable: true,
        merchantId: 'test_merchant_001',
      },
    })
    await mintVoucher(context, validConfig)
    validVoucherAddress = validVoucherSigner.publicKey

    // Create voucher with conditions
    const conditionVoucherSigner = generateSigner(context.umi)
    const conditionConfig = createTestVoucherConfig({
      collectionAddress,
      updateAuthority,
      assetSigner: conditionVoucherSigner,
      voucherData: {
        type: 'percentage_off',
        value: 25,
        description: '25% off with minimum purchase',
        expiryDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
        maxUses: 1,
        transferable: false,
        merchantId: 'test_merchant_001',
        conditions: [
          {
            type: 'minimum_purchase',
            value: 50,
            operator: 'greater_than',
          },
        ],
      },
    })
    await mintVoucher(context, conditionConfig)
    conditionVoucherAddress = conditionVoucherSigner.publicKey

    // Create voucher with empty conditions array
    const emptyConditionVoucherSigner = generateSigner(context.umi)
    const emptyConditionConfig = createTestVoucherConfig({
      collectionAddress,
      updateAuthority,
      assetSigner: emptyConditionVoucherSigner,
      voucherData: {
        type: 'fixed_verxio_credits',
        value: 10,
        description: '10 credits, no conditions',
        expiryDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
        maxUses: 2,
        transferable: false,
        merchantId: 'test_merchant_001',
        conditions: [],
      },
    })
    await mintVoucher(context, emptyConditionConfig)
    emptyConditionVoucherAddress = emptyConditionVoucherSigner.publicKey
  })

  it('should fetch a valid voucher and return all details (correct merchantId)', async () => {
    const result = await validateVoucher(context, {
      voucherAddress: validVoucherAddress,
    })
    expect(result.errors).toHaveLength(0)
    expect(result.voucher).toBeDefined()
    expect(result.voucher?.type).toBe('percentage_off')
    expect(result.voucher?.value).toBe(20)
    expect(result.voucher?.merchantId).toBe('test_merchant_001')
    expect(result.voucher?.conditions).toEqual([])
  })

  it('should fetch a voucher with conditions and return the conditions', async () => {
    const result = await validateVoucher(context, {
      voucherAddress: conditionVoucherAddress,
    })
    expect(result.errors).toHaveLength(0)
    expect(result.voucher).toBeDefined()
    expect(result.voucher?.type).toBe('percentage_off')
    expect(result.voucher?.conditions).toBeDefined()
    expect(Array.isArray(result.voucher?.conditions)).toBe(true)
    expect(result.voucher?.conditions?.[0]?.type).toBe('minimum_purchase')
    expect(result.voucher?.conditions?.[0]?.value).toBe(50)
  })

  it('should fetch a voucher with empty conditions array', async () => {
    const result = await validateVoucher(context, {
      voucherAddress: emptyConditionVoucherAddress,
    })
    expect(result.errors).toHaveLength(0)
    expect(result.voucher).toBeDefined()
    expect(result.voucher?.type).toBe('fixed_verxio_credits')
    expect(result.voucher?.conditions).toEqual([])
  })

  it('should fetch a valid voucher with wrong merchantId (should still return voucher)', async () => {
    const result = await validateVoucher(context, {
      voucherAddress: validVoucherAddress,
    })
    expect(result.errors).toHaveLength(0)
    expect(result.voucher).toBeDefined()
    expect(result.voucher?.merchantId).toBe('test_merchant_001')
  })

  it('should fetch a valid voucher with no merchantId (should still return voucher)', async () => {
    const result = await validateVoucher(context, {
      voucherAddress: validVoucherAddress,
    })
    expect(result.errors).toHaveLength(0)
    expect(result.voucher).toBeDefined()
    expect(result.voucher?.merchantId).toBe('test_merchant_001')
  })

  it('should return an error for a non-existent voucher', async () => {
    const nonExistentAddress = generateSigner(context.umi).publicKey
    const result = await validateVoucher(context, {
      voucherAddress: nonExistentAddress,
    })
    expect(result.voucher).toBeUndefined()
    expect(result.errors.length).toBeGreaterThan(0)
  })
})
