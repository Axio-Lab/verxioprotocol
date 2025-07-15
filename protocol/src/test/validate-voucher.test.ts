import { beforeAll, describe, it, expect } from 'vitest'
import { generateSigner, createSignerFromKeypair, PublicKey, keypairIdentity } from '@metaplex-foundation/umi'
import { fetchAsset } from '@metaplex-foundation/mpl-core'
import { createVoucherCollection } from '../lib/create-voucher-collection'
import { mintVoucher } from '../lib/mint-voucher'
import { validateVoucher } from '../lib/validate-voucher'
import { getTestContext } from './helpers/get-test-context'
import { createTestVoucherConfig } from './helpers/create-test-voucher'

const { feePayer, context } = getTestContext()

describe('validateVoucher', { sequential: true, timeout: 30000 }, () => {
  let collectionAddress: PublicKey
  let validVoucherAddress: PublicKey
  let expiredVoucherAddress: PublicKey

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
        voucherTypes: ['percentage_off', 'fixed_verxio_credits', 'free_item'],
      },
    })

    collectionAddress = collectionResult.collection.publicKey

    // Create valid voucher
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

    // Create soon-to-expire voucher (we'll test expiry in validation, not minting)
    const expiredVoucherSigner = generateSigner(context.umi)
    const expiredConfig = createTestVoucherConfig({
      collectionAddress,
      updateAuthority,
      assetSigner: expiredVoucherSigner,
      voucherData: {
        type: 'fixed_verxio_credits',
        value: 100,
        description: 'Soon to expire voucher',
        expiryDate: Date.now() + 1 * 60 * 1000, // 1 minute from now (short expiry)
        maxUses: 1,
        transferable: false,
        merchantId: 'test_merchant_001',
      },
    })

    await mintVoucher(context, expiredConfig)
    expiredVoucherAddress = expiredVoucherSigner.publicKey
  })

  describe('Debug', () => {
    it('should debug asset plugins', async () => {
      const asset = await fetchAsset(context.umi, validVoucherAddress)
      console.log('Asset keys:', Object.keys(asset))
      console.log('Asset name:', (asset as any).name)
      console.log('Asset uri:', (asset as any).uri)
      console.log('Asset plugins exists:', !!(asset as any).plugins)
      console.log('Asset plugins length:', (asset as any).plugins?.length)
      console.log('Asset appDatas exists:', !!(asset as any).appDatas)
      console.log('Asset appDatas length:', (asset as any).appDatas?.length)

      if ((asset as any).appDatas) {
        console.log('AppData entries:', (asset as any).appDatas.length)
        console.log('First AppData:', (asset as any).appDatas[0])
      }

      if ((asset as any).plugins) {
        console.log(
          'Plugin types:',
          (asset as any).plugins.map((p: any) => p.type),
        )
      }

      const appDataPlugin = (asset as any).plugins?.find((p: any) => p.type === 'AppData')
      console.log('AppData plugin found:', !!appDataPlugin)

      if (appDataPlugin && appDataPlugin.data) {
        const voucherData = JSON.parse(new TextDecoder().decode(appDataPlugin.data))
        console.log('Voucher data:', voucherData)
      }

      expect(true).toBe(true) // Just to make the test pass
    })
  })

  describe('Basic validation', () => {
    it('should validate a valid voucher successfully', async () => {
      const result = await validateVoucher(context, {
        voucherAddress: validVoucherAddress,
        merchantId: 'test_merchant_001',
      })

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.warnings).toHaveLength(0)
      expect(result.voucher).toBeDefined()
      expect(result.voucher?.type).toBe('percentage_off')
      expect(result.voucher?.value).toBe(20)
    })

    it('should fail validation for expired voucher', async () => {
      // Create a voucher that will be expired when we test it
      const expiredTestSigner = generateSigner(context.umi)
      const updateAuthority = createSignerFromKeypair(context.umi, feePayer)

      const expiredTestConfig = createTestVoucherConfig({
        collectionAddress,
        updateAuthority,
        assetSigner: expiredTestSigner,
        voucherData: {
          type: 'fixed_verxio_credits',
          value: 100,
          description: 'Test expired voucher',
          expiryDate: Date.now() + 100, // Very short expiry (100ms)
          maxUses: 1,
          transferable: false,
          merchantId: 'test_merchant_001',
        },
      })

      await mintVoucher(context, expiredTestConfig)

      // Wait for voucher to expire
      await new Promise((resolve) => setTimeout(resolve, 200))

      const result = await validateVoucher(context, {
        voucherAddress: expiredTestSigner.publicKey,
        merchantId: 'test_merchant_001',
      })

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Voucher has expired')
      expect(result.voucher).toBeDefined()
    })

    it('should fail validation for wrong merchant', async () => {
      const result = await validateVoucher(context, {
        voucherAddress: validVoucherAddress,
        merchantId: 'wrong_merchant',
      })

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Voucher is not valid for merchant wrong_merchant')
      expect(result.voucher).toBeDefined()
    })

    it('should handle non-existent voucher gracefully', async () => {
      const nonExistentAddress = generateSigner(context.umi).publicKey

      const result = await validateVoucher(context, {
        voucherAddress: nonExistentAddress,
        merchantId: 'test_merchant_001',
      })

      expect(result.isValid).toBe(false)
      expect(result.errors.some((error) => error.includes('Failed to validate voucher'))).toBe(true)
      expect(result.voucher).toBeUndefined()
    })
  })

  describe('Condition validation', () => {
    it('should validate minimum purchase condition successfully', async () => {
      // Create voucher with minimum purchase condition
      const conditionVoucherSigner = generateSigner(context.umi)
      const updateAuthority = createSignerFromKeypair(context.umi, feePayer)

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

      const result = await validateVoucher(context, {
        voucherAddress: conditionVoucherSigner.publicKey,
        merchantId: 'test_merchant_001',
        redemptionContext: {
          purchaseAmount: 75, // Above minimum of 50
        },
      })

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should fail validation for insufficient purchase amount', async () => {
      // Create voucher with minimum purchase condition
      const conditionVoucherSigner = generateSigner(context.umi)
      const updateAuthority = createSignerFromKeypair(context.umi, feePayer)

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

      const result = await validateVoucher(context, {
        voucherAddress: conditionVoucherSigner.publicKey,
        merchantId: 'test_merchant_001',
        redemptionContext: {
          purchaseAmount: 25, // Below minimum of 50
        },
      })

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Minimum purchase amount of 50 required')
    })
  })

  describe('Edge cases', () => {
    it('should handle voucher with no conditions', async () => {
      const result = await validateVoucher(context, {
        voucherAddress: validVoucherAddress,
        merchantId: 'test_merchant_001',
      })

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
  })
})
