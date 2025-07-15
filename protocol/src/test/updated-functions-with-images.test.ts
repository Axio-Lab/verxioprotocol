import { describe, it, expect, beforeEach, vi } from 'vitest'
import { generateSigner, publicKey, keypairIdentity } from '@metaplex-foundation/umi'
import { VerxioContext } from '../schemas/verxio-context'
import { createLoyaltyProgram } from '../lib/create-loyalty-program'
import { issueLoyaltyPass } from '../lib/issue-loyalty-pass'
import { createVoucherCollection } from '../lib/create-voucher-collection'
import { mintVoucher } from '../lib/mint-voucher'
import { createMockUmiUploader } from './helpers/mock-uploader'
import { getTestContext } from './helpers/get-test-context'

describe('Updated Functions with Image Upload', () => {
  let context: VerxioContext
  let mockUploader: any
  let feePayerSigner: any
  let loyaltyProgramCollection: any
  let voucherCollection: any
  let voucherCollectionUpdateAuthority: any
  let testRecipient: any

  beforeEach(async () => {
    // Use the same test context setup as other tests
    const { context: testContext, feePayer } = getTestContext()
    testContext.umi.use(keypairIdentity(feePayer))
    mockUploader = createMockUmiUploader()
    testContext.umi.uploader = mockUploader
    context = testContext
    feePayerSigner = feePayer
    testRecipient = generateSigner(context.umi)

    // Create a real loyalty program for use in pass/voucher tests
    const loyaltyProgramConfig = {
      loyaltyProgramName: 'Test Loyalty Program',
      pointsPerAction: { purchase: 100, review: 50 },
      programAuthority: context.programAuthority,
      updateAuthority: feePayerSigner,
      tiers: [
        { name: 'Bronze', xpRequired: 0, rewards: ['5% off'] },
        { name: 'Silver', xpRequired: 1000, rewards: ['10% off'] },
      ],
      metadata: {
        organizationName: 'Test Organization',
        brandColor: '#FF5733',
      },
      imageBuffer: Buffer.from('fake-loyalty-program-image'),
      imageFilename: 'loyalty-program.png',
      imageContentType: 'image/png',
    }
    const loyaltyProgramResult = await createLoyaltyProgram(context, loyaltyProgramConfig)
    loyaltyProgramCollection = loyaltyProgramResult.collection

    // Create a real voucher collection for use in voucher tests
    const voucherCollectionConfig = {
      voucherCollectionName: 'Test Voucher Collection',
      programAuthority: context.programAuthority,
      updateAuthority: feePayerSigner, // Use feePayerSigner as update authority
      metadata: {
        merchantName: 'Test Merchant',
        merchantAddress: 'test-merchant-001',
        voucherTypes: ['percentage_off', 'free_item'],
      },
      imageBuffer: Buffer.from('fake-voucher-collection-image'),
      imageFilename: 'voucher-collection.png',
      imageContentType: 'image/png',
    }
    const voucherCollectionResult = await createVoucherCollection(context, voucherCollectionConfig)
    voucherCollection = voucherCollectionResult.collection
    voucherCollectionUpdateAuthority = voucherCollectionResult.updateAuthority || feePayerSigner
  })

  describe('createLoyaltyProgram with image', () => {
    it('should create loyalty program with image upload and metadata generation', async () => {
      // Already tested in beforeEach, just assert
      expect(loyaltyProgramCollection).toBeDefined()
      expect(loyaltyProgramCollection.publicKey).toBeDefined()
    })

    it('should create loyalty program with existing metadata URI', async () => {
      const config = {
        loyaltyProgramName: 'Test Loyalty Program',
        pointsPerAction: { purchase: 100, review: 50 },
        programAuthority: context.programAuthority,
        updateAuthority: feePayerSigner,
        tiers: [{ name: 'Bronze', xpRequired: 0, rewards: ['5% off'] }],
        metadata: {
          organizationName: 'Test Organization',
        },
        metadataUri: 'https://arweave.net/existing-metadata',
      }
      const result = await createLoyaltyProgram(context, config)
      expect(result).toBeDefined()
      expect(result.signature).toBeDefined()
    })

    it('should throw error when neither metadataUri nor imageBuffer is provided', async () => {
      const config = {
        loyaltyProgramName: 'Test Loyalty Program',
        pointsPerAction: { purchase: 100 },
        programAuthority: context.programAuthority,
        updateAuthority: feePayerSigner,
        tiers: [{ name: 'Bronze', xpRequired: 0, rewards: ['5% off'] }],
        metadata: { organizationName: 'Test Organization' },
      }
      await expect(createLoyaltyProgram(context, config)).rejects.toThrow(
        'assertValidCreateLoyaltyProgramConfig: Image buffer is required when metadataUri is not provided',
      )
    })
  })

  describe('issueLoyaltyPass with image', () => {
    it('should issue loyalty pass with image upload and metadata generation', async () => {
      const imageBuffer = Buffer.from('fake-loyalty-pass-image')
      const config = {
        collectionAddress: loyaltyProgramCollection.publicKey,
        recipient: testRecipient.publicKey,
        passName: 'Test Loyalty Pass',
        updateAuthority: feePayerSigner,
        organizationName: 'Test Organization',
        imageBuffer,
        imageFilename: 'loyalty-pass.png',
        imageContentType: 'image/png',
      }
      const result = await issueLoyaltyPass(context, config)
      expect(result).toBeDefined()
      expect(result.signature).toBeDefined()
    })

    it('should issue loyalty pass with existing metadata URI', async () => {
      const config = {
        collectionAddress: loyaltyProgramCollection.publicKey,
        recipient: testRecipient.publicKey,
        passName: 'Test Loyalty Pass',
        updateAuthority: feePayerSigner,
        organizationName: 'Test Organization',
        passMetadataUri: 'https://arweave.net/existing-pass-metadata',
      }
      const result = await issueLoyaltyPass(context, config)
      expect(result).toBeDefined()
      expect(result.signature).toBeDefined()
    })
  })

  describe('createVoucherCollection with image', () => {
    it('should create voucher collection with image upload and metadata generation', async () => {
      // Already tested in beforeEach, just assert
      expect(voucherCollection).toBeDefined()
      expect(voucherCollection.publicKey).toBeDefined()
    })
  })

  describe('mintVoucher with image', () => {
    it('should mint voucher with image upload and metadata generation', async () => {
      const imageBuffer = Buffer.from('fake-voucher-image')
      const config = {
        collectionAddress: voucherCollection.publicKey,
        recipient: testRecipient.publicKey,
        voucherName: 'Test Voucher',
        voucherData: {
          type: 'percentage_off' as const,
          value: 25,
          description: '25% off your purchase',
          expiryDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
          maxUses: 1,
          merchantId: 'test-merchant-001',
        },
        updateAuthority: voucherCollectionUpdateAuthority,
        imageBuffer,
        imageFilename: 'voucher.png',
        imageContentType: 'image/png',
      }
      const result = await mintVoucher(context, config)
      expect(result).toBeDefined()
      expect(result.signature).toBeDefined()
    })

    it('should mint voucher with existing metadata URI', async () => {
      const config = {
        collectionAddress: voucherCollection.publicKey,
        recipient: testRecipient.publicKey,
        voucherName: 'Test Voucher',
        voucherData: {
          type: 'percentage_off' as const,
          value: 25,
          description: '25% off your purchase',
          expiryDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
          maxUses: 1,
          merchantId: 'test-merchant-001',
        },
        updateAuthority: voucherCollectionUpdateAuthority,
        voucherMetadataUri: 'https://arweave.net/existing-voucher-metadata',
      }
      const result = await mintVoucher(context, config)
      expect(result).toBeDefined()
      expect(result.signature).toBeDefined()
    })
  })
})
