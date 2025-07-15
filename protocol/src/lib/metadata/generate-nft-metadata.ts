import { VerxioContext } from '@schemas/verxio-context'
import { PublicKey } from '@metaplex-foundation/umi'
import { createGenericFile } from '@metaplex-foundation/umi'

export interface MetadataInput {
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
}

export interface VoucherMetadataInput {
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
}

export async function generateLoyaltyProgramMetadata(context: VerxioContext, data: MetadataInput): Promise<string> {
  try {
    if (!data || !data.imageUri || !data.creator) {
      throw new Error('Missing required data for metadata generation')
    }

    const metadata = {
      name: data.loyaltyProgramName,
      symbol: 'VERXIO',
      description: `Loyalty Program for ${data.metadata.organizationName}`,
      image: data.imageUri,
      properties: {
        files: [
          {
            uri: data.imageUri,
            type: data.mimeType || 'image/png',
          },
        ],
        category: 'image',
        creators: [
          {
            address: data.creator.toString(),
            share: 100,
          },
        ],
      },
      attributes: [
        {
          trait_type: 'Organization',
          value: data.metadata.organizationName,
        },
        {
          trait_type: 'Program Type',
          value: 'Loyalty Program',
        },
        {
          trait_type: 'Tiers',
          value: data.tiers.length.toString(),
        },
        ...(data.metadata.brandColor
          ? [
              {
                trait_type: 'Brand Color',
                value: data.metadata.brandColor,
              },
            ]
          : []),
      ],
      program: {
        name: data.loyaltyProgramName,
        metadata: data.metadata,
        tiers: data.tiers,
        pointsPerAction: data.pointsPerAction,
      },
    }

    const metadataUri = await context.umi.uploader.uploadJson(metadata)
    return metadataUri
  } catch (error) {
    console.error('Error generating loyalty program metadata:', error)
    throw new Error('Failed to generate loyalty program metadata')
  }
}

export async function generateLoyaltyPassMetadata(
  context: VerxioContext,
  data: {
    passName: string
    organizationName: string
    imageUri: string
    creator: PublicKey
    mimeType?: string
  },
): Promise<string> {
  try {
    if (!data || !data.imageUri || !data.creator) {
      throw new Error('Missing required data for pass metadata generation')
    }

    const metadata = {
      name: data.passName,
      symbol: 'VERXIO-PASS',
      description: `Loyalty Pass for ${data.organizationName}`,
      image: data.imageUri,
      properties: {
        files: [
          {
            uri: data.imageUri,
            type: data.mimeType || 'image/png',
          },
        ],
        category: 'image',
        creators: [
          {
            address: data.creator.toString(),
            share: 100,
          },
        ],
      },
      attributes: [
        {
          trait_type: 'Organization',
          value: data.organizationName,
        },
        {
          trait_type: 'Pass Type',
          value: 'Loyalty Pass',
        },
        {
          trait_type: 'Status',
          value: 'Active',
        },
      ],
    }

    const metadataUri = await context.umi.uploader.uploadJson(metadata)
    return metadataUri
  } catch (error) {
    console.error('Error generating loyalty pass metadata:', error)
    throw new Error('Failed to generate loyalty pass metadata')
  }
}

export async function generateVoucherCollectionMetadata(
  context: VerxioContext,
  data: {
    collectionName: string
    merchantName: string
    description: string
    imageUri: string
    creator: PublicKey
    mimeType?: string
  },
): Promise<string> {
  try {
    if (!data || !data.imageUri || !data.creator) {
      throw new Error('Missing required data for collection metadata generation')
    }

    const metadata = {
      name: data.collectionName,
      symbol: 'VERXIO-VOUCHER',
      description: data.description,
      image: data.imageUri,
      properties: {
        files: [
          {
            uri: data.imageUri,
            type: data.mimeType || 'image/png',
          },
        ],
        category: 'image',
        creators: [
          {
            address: data.creator.toString(),
            share: 100,
          },
        ],
      },
      attributes: [
        {
          trait_type: 'Merchant',
          value: data.merchantName,
        },
        {
          trait_type: 'Collection Type',
          value: 'Voucher Collection',
        },
        {
          trait_type: 'Status',
          value: 'Active',
        },
      ],
    }

    const metadataUri = await context.umi.uploader.uploadJson(metadata)
    return metadataUri
  } catch (error) {
    console.error('Error generating voucher collection metadata:', error)
    throw new Error('Failed to generate voucher collection metadata')
  }
}

export async function generateVoucherMetadata(context: VerxioContext, data: VoucherMetadataInput): Promise<string> {
  try {
    if (!data || !data.imageUri || !data.creator) {
      throw new Error('Missing required data for voucher metadata generation')
    }

    const metadata = {
      name: data.voucherName,
      symbol: 'VERXIO-VOUCHER',
      description: data.voucherData.description,
      image: data.imageUri,
      properties: {
        files: [
          {
            uri: data.imageUri,
            type: data.mimeType || 'image/png',
          },
        ],
        category: 'image',
        creators: [
          {
            address: data.creator.toString(),
            share: 100,
          },
        ],
      },
      attributes: [
        {
          trait_type: 'Voucher Type',
          value: data.voucherData.type,
        },
        {
          trait_type: 'Value',
          value: data.voucherData.value.toString(),
        },
        {
          trait_type: 'Merchant ID',
          value: data.voucherData.merchantId,
        },
        {
          trait_type: 'Status',
          value: 'Active',
        },
      ],
    }

    const metadataUri = await context.umi.uploader.uploadJson(metadata)
    return metadataUri
  } catch (error) {
    console.error('Error generating voucher metadata:', error)
    throw new Error('Failed to generate voucher metadata')
  }
}

export async function uploadImage(
  context: VerxioContext,
  imageBuffer: Buffer,
  filename: string,
  contentType: string = 'image/png',
): Promise<string> {
  try {
    if (!imageBuffer) {
      throw new Error('Image buffer is required')
    }
    if (!filename || typeof filename !== 'string') {
      throw new Error('Valid filename is required')
    }
    if (!context || !context.umi || !context.umi.uploader) {
      throw new Error('Valid context with uploader is required')
    }

    const genericFile = createGenericFile(imageBuffer, filename, {
      contentType,
    })

    const [imageUri] = await context.umi.uploader.upload([genericFile])
    return imageUri
  } catch (error) {
    console.error('Error uploading image:', error)
    throw new Error('Failed to upload image')
  }
}
