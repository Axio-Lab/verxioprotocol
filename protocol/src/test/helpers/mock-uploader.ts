import { VerxioContext } from '@schemas/verxio-context'
import { PublicKey } from '@metaplex-foundation/umi'

// Mock uploader for testing - returns dummy URIs
export function createMockUploader() {
  let imageCounter = 0
  let metadataCounter = 0

  return {
    uploadImage: async (
      context: VerxioContext,
      imageBuffer: Buffer,
      filename: string,
      contentType: string = 'image/png',
    ): Promise<string> => {
      imageCounter++
      return `https://arweave.net/mock-image-${imageCounter}.${contentType.split('/')[1] || 'png'}`
    },

    generateLoyaltyProgramMetadata: async (
      context: VerxioContext,
      data: {
        loyaltyProgramName: string
        metadata: {
          organizationName: string
          brandColor?: string
        }
        tiers: Array<{
          name: string
          xpRequired: number
          rewards: string[]
        }>
        pointsPerAction: Record<string, number>
        imageUri: string
        creator: PublicKey
        mimeType?: string
      },
    ): Promise<string> => {
      metadataCounter++
      return `https://arweave.net/mock-loyalty-program-metadata-${metadataCounter}.json`
    },

    generateLoyaltyPassMetadata: async (
      context: VerxioContext,
      data: {
        passName: string
        organizationName: string
        imageUri: string
        creator: PublicKey
        mimeType?: string
      },
    ): Promise<string> => {
      metadataCounter++
      return `https://arweave.net/mock-loyalty-pass-metadata-${metadataCounter}.json`
    },

    generateVoucherCollectionMetadata: async (
      context: VerxioContext,
      data: {
        collectionName: string
        merchantName: string
        description: string
        imageUri: string
        creator: PublicKey
        mimeType?: string
      },
    ): Promise<string> => {
      metadataCounter++
      return `https://arweave.net/mock-voucher-collection-metadata-${metadataCounter}.json`
    },

    generateVoucherMetadata: async (
      context: VerxioContext,
      data: {
        voucherName: string
        voucherData: {
          type: string
          value: number
          description: string
          merchantId: string
        }
        imageUri: string
        creator: PublicKey
        mimeType?: string
      },
    ): Promise<string> => {
      metadataCounter++
      return `https://arweave.net/mock-voucher-metadata-${metadataCounter}.json`
    },
  }
}

// Mock UMI uploader for testing
export function createMockUmiUploader() {
  let counter = 0

  return {
    upload: async (files: any[]): Promise<string[]> => {
      counter++
      return files.map((_, index) => `https://arweave.net/mock-upload-${counter}-${index}.json`)
    },
    uploadJson: async (json: any): Promise<string> => {
      counter++
      return `https://arweave.net/mock-json-${counter}.json`
    },
  }
}
