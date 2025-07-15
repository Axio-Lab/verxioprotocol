import { VerxioContext } from '@schemas/verxio-context'
import { generateSigner, KeypairSigner, PublicKey, publicKey } from '@metaplex-foundation/umi'
import { create, ExternalPluginAdapterSchema, writeData } from '@metaplex-foundation/mpl-core'
import { ATTRIBUTE_KEYS, DEFAULT_PASS_DATA, PLUGIN_TYPES } from '@lib/constants'
import { toBase58 } from '@utils/to-base58'
import { createFeeInstruction } from '@/utils/fee-structure'
import { generateLoyaltyPassMetadata, uploadImage } from './metadata/generate-nft-metadata'

export interface IssueLoyaltyPassConfig {
  collectionAddress: PublicKey
  recipient: PublicKey
  passName: string
  assetSigner?: KeypairSigner
  updateAuthority: KeypairSigner
  // New image and metadata options
  imageBuffer?: Buffer
  imageFilename?: string
  imageContentType?: string
  organizationName: string
  // Legacy support - if passMetadataUri is provided, use it instead of generating
  passMetadataUri?: string
}

export async function issueLoyaltyPass(
  context: VerxioContext,
  config: IssueLoyaltyPassConfig,
): Promise<{
  asset: KeypairSigner
  signature: string
}> {
  try {
    assertValidIssueLoyaltyPassConfig(config)

    const asset = config.assetSigner ?? generateSigner(context.umi)

    // Generate metadata URI if not provided
    let metadataUri = config.passMetadataUri
    if (!metadataUri) {
      if (!config.imageBuffer || !config.imageFilename) {
        throw new Error('Either passMetadataUri or imageBuffer with imageFilename must be provided')
      }

      // Upload image first
      const imageUri = await uploadImage(context, config.imageBuffer, config.imageFilename, config.imageContentType)

      // Generate metadata
      metadataUri = await generateLoyaltyPassMetadata(context, {
        passName: config.passName,
        organizationName: config.organizationName,
        imageUri,
        creator: config.updateAuthority.publicKey,
        mimeType: config.imageContentType,
      })
    }

    const feeInstruction = createFeeInstruction(context.umi, context.umi.identity.publicKey, 'LOYALTY_OPERATIONS')
    const txnInstruction = create(context.umi, {
      asset,
      name: config.passName,
      uri: metadataUri,
      owner: config.recipient,
      authority: config.updateAuthority,
      collection: {
        publicKey: config.collectionAddress,
      },
      plugins: [
        {
          type: PLUGIN_TYPES.APP_DATA,
          dataAuthority: {
            type: 'Address',
            address: config.updateAuthority.publicKey,
          },
          schema: ExternalPluginAdapterSchema.Json,
        },
        {
          type: PLUGIN_TYPES.ATTRIBUTES,
          attributeList: [{ key: ATTRIBUTE_KEYS.TYPE, value: `${config.passName} loyalty pass` }],
        },
      ],
    })
      .add(feeInstruction)
      .add(
        writeData(context.umi, {
          key: {
            type: PLUGIN_TYPES.APP_DATA,
            dataAuthority: {
              type: 'Address',
              address: config.updateAuthority.publicKey,
            },
          },
          authority: config.updateAuthority,
          data: new TextEncoder().encode(JSON.stringify(DEFAULT_PASS_DATA)),
          asset: publicKey(asset.publicKey),
          collection: config.collectionAddress,
        }),
      )

    const tx = await txnInstruction.sendAndConfirm(context.umi, { confirm: { commitment: 'confirmed' } })

    return {
      asset,
      signature: toBase58(tx.signature),
    }
  } catch (error) {
    console.error('Error in issueLoyaltyPass:', error)
    throw new Error(`Failed to issue loyalty pass: ${error}`)
  }
}

// TODO: Replace with zod validation
function assertValidIssueLoyaltyPassConfig(config: IssueLoyaltyPassConfig) {
  if (!config) {
    console.error('Validation failed: config is undefined')
    throw new Error('assertValidIssueLoyaltyPassConfig: Config is undefined')
  }
  if (!config.collectionAddress) {
    console.error('Validation failed: collectionAddress is undefined', config)
    throw new Error('assertValidIssueLoyaltyPassConfig: Collection address is undefined')
  }
  if (!config.recipient) {
    console.error('Validation failed: recipient is undefined', config)
    throw new Error('assertValidIssueLoyaltyPassConfig: Recipient is undefined')
  }
  if (!config.passName || !config.passName.trim() || !config.passName.trim().length) {
    console.error('Validation failed: passName is invalid', config)
    throw new Error('assertValidIssueLoyaltyPassConfig: Pass name is undefined')
  }
  if (!config.organizationName || !config.organizationName.trim()) {
    console.error('Validation failed: organizationName is invalid', config)
    throw new Error('assertValidIssueLoyaltyPassConfig: Organization name is undefined')
  }

  // Validate metadata URI if provided, or ensure image data is provided
  if (config.passMetadataUri) {
    if (!config.passMetadataUri.trim() || !config.passMetadataUri.trim().length) {
      console.error('Validation failed: passMetadataUri is empty', config)
      throw new Error('assertValidIssueLoyaltyPassConfig: Pass metadata URI is empty')
    }
    if (!config.passMetadataUri.startsWith('https://') && !config.passMetadataUri.startsWith('http://')) {
      console.error('Validation failed: passMetadataUri is not a valid URL', config)
      throw new Error('assertValidIssueLoyaltyPassConfig: Pass metadata URI is not a valid URL')
    }
  } else {
    // If no passMetadataUri, require image data
    if (!config.imageBuffer) {
      console.error('Validation failed: imageBuffer is required', config)
      throw new Error(
        'assertValidIssueLoyaltyPassConfig: Image buffer is required when passMetadataUri is not provided',
      )
    }
    if (!config.imageFilename || !config.imageFilename.trim()) {
      console.error('Validation failed: imageFilename is required', config)
      throw new Error(
        'assertValidIssueLoyaltyPassConfig: Image filename is required when passMetadataUri is not provided',
      )
    }
  }
}
