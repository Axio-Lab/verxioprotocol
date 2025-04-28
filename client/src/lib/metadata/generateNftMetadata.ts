import { storeMetadata } from '@/app/actions/metadata'

interface MetadataInput {
  loyaltyProgramName: string
  metadata: {
    organizationName: string
    brandColor: string
  }
  tiers: Array<{
    name: string
    xpRequired: number
    rewards: string[]
  }>
  pointsPerAction: Record<string, number>
  metadataUri: string
}

export async function generateNftMetadata(data: MetadataInput, imageUri: string, creator: string, mimeType?: string) {
  try {
    if (!data || !imageUri || !creator) {
      throw new Error('Missing required data')
    }

    const metadata = {
      name: data.loyaltyProgramName,
      symbol: 'VERXIO',
      description: `Loyalty Program for ${data.metadata.organizationName}`,
      image: imageUri,
      properties: {
        files: [
          {
            uri: imageUri,
            type: mimeType || 'image/png',
          },
        ],
        category: 'image',
        creators: [
          {
            address: creator,
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
          trait_type: 'Brand Color',
          value: data.metadata.brandColor,
        },
      ],
      program: {
        name: data.loyaltyProgramName,
        metadata: data.metadata,
        tiers: data.tiers,
        pointsPerAction: data.pointsPerAction,
      },
    }

    const formData = new FormData()
    formData.append('metadata', JSON.stringify(metadata))

    const result = await storeMetadata(metadata)
    return { uri: result }
  } catch (error) {
    console.error('Error generating NFT metadata:', error)
    throw new Error('Failed to generate NFT metadata')
  }
}
