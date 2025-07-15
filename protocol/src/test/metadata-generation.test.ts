import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { generateSigner, publicKey } from '@metaplex-foundation/umi'
import { VerxioContext } from '@schemas/verxio-context'
import {
  generateLoyaltyProgramMetadata,
  generateLoyaltyPassMetadata,
  generateVoucherCollectionMetadata,
  generateVoucherMetadata,
  uploadImage,
} from '../lib/metadata/generate-nft-metadata'
import { createMockUmiUploader } from './helpers/mock-uploader'

describe('Metadata Generation', () => {
  let context: VerxioContext
  let mockUploader: any

  beforeEach(() => {
    const umi = createUmi('https://api.devnet.solana.com')

    // Use our mock uploader instead of the real Irys uploader
    mockUploader = createMockUmiUploader()
    umi.uploader = mockUploader

    context = {
      umi,
      programAuthority: publicKey('11111111111111111111111111111111'),
    }
  })

  describe('uploadImage', () => {
    it('should upload image and return URI', async () => {
      const imageBuffer = Buffer.from('fake-image-data')
      const filename = 'test-image.png'
      const contentType = 'image/png'

      const result = await uploadImage(context, imageBuffer, filename, contentType)

      expect(result).toMatch(/^https:\/\/arweave\.net\/mock-upload-\d+-\d+\.json$/)
    })

    it('should throw error for missing image buffer', async () => {
      await expect(uploadImage(context, null as any, 'test.png')).rejects.toThrow('Failed to upload image')
    })

    it('should throw error for missing filename', async () => {
      const imageBuffer = Buffer.from('fake-image-data')
      await expect(uploadImage(context, imageBuffer, '')).rejects.toThrow('Failed to upload image')
    })
  })

  describe('generateLoyaltyProgramMetadata', () => {
    it('should generate loyalty program metadata', async () => {
      const metadataInput = {
        loyaltyProgramName: 'Test Loyalty Program',
        metadata: {
          organizationName: 'Test Organization',
          brandColor: '#FF5733',
        },
        tiers: [
          { name: 'Bronze', xpRequired: 0, rewards: ['5% off'] },
          { name: 'Silver', xpRequired: 1000, rewards: ['10% off'] },
        ],
        pointsPerAction: { purchase: 100, review: 50 },
        imageUri: 'https://arweave.net/test-image',
        creator: context.programAuthority,
        mimeType: 'image/png',
      }

      const result = await generateLoyaltyProgramMetadata(context, metadataInput)

      expect(result).toMatch(/^https:\/\/arweave\.net\/mock-json-\d+\.json$/)
    })

    it('should throw error for missing required data', async () => {
      await expect(generateLoyaltyProgramMetadata(context, null as any)).rejects.toThrow(
        'Failed to generate loyalty program metadata',
      )
    })
  })

  describe('generateLoyaltyPassMetadata', () => {
    it('should generate loyalty pass metadata', async () => {
      const metadataInput = {
        passName: 'Test Loyalty Pass',
        organizationName: 'Test Organization',
        imageUri: 'https://arweave.net/test-image',
        creator: context.programAuthority,
        mimeType: 'image/png',
      }

      const result = await generateLoyaltyPassMetadata(context, metadataInput)

      expect(result).toMatch(/^https:\/\/arweave\.net\/mock-json-\d+\.json$/)
    })

    it('should throw error for missing required data', async () => {
      await expect(generateLoyaltyPassMetadata(context, null as any)).rejects.toThrow(
        'Failed to generate loyalty pass metadata',
      )
    })
  })

  describe('generateVoucherCollectionMetadata', () => {
    it('should generate voucher collection metadata', async () => {
      const metadataInput = {
        collectionName: 'Test Voucher Collection',
        merchantName: 'Test Merchant',
        description: 'Test voucher collection description',
        imageUri: 'https://arweave.net/test-image',
        creator: context.programAuthority,
        mimeType: 'image/png',
      }

      const result = await generateVoucherCollectionMetadata(context, metadataInput)

      expect(result).toMatch(/^https:\/\/arweave\.net\/mock-json-\d+\.json$/)
    })

    it('should throw error for missing required data', async () => {
      await expect(generateVoucherCollectionMetadata(context, null as any)).rejects.toThrow(
        'Failed to generate voucher collection metadata',
      )
    })
  })

  describe('generateVoucherMetadata', () => {
    it('should generate voucher metadata', async () => {
      const metadataInput = {
        voucherName: 'Test Voucher',
        voucherData: {
          type: 'percentage_off',
          value: 25,
          description: '25% off your purchase',
          merchantId: 'test_merchant_001',
        },
        imageUri: 'https://arweave.net/test-image',
        creator: context.programAuthority,
        mimeType: 'image/png',
      }

      const result = await generateVoucherMetadata(context, metadataInput)

      expect(result).toMatch(/^https:\/\/arweave\.net\/mock-json-\d+\.json$/)
    })

    it('should throw error for missing required data', async () => {
      await expect(generateVoucherMetadata(context, null as any)).rejects.toThrow('Failed to generate voucher metadata')
    })
  })
})
