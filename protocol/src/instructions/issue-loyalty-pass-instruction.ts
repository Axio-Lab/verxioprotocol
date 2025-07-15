import { generateSigner, KeypairSigner, PublicKey, publicKey, TransactionBuilder } from '@metaplex-foundation/umi'
import { create, ExternalPluginAdapterSchema, writeData } from '@metaplex-foundation/mpl-core'
import { ATTRIBUTE_KEYS, DEFAULT_PASS_DATA, PLUGIN_TYPES } from '@/lib/constants'
import { VerxioContext } from '@schemas/verxio-context'
import { createFeeInstruction } from '@utils/fee-structure'
import { generateLoyaltyPassMetadata, uploadImage } from '../lib/metadata/generate-nft-metadata'

export interface IssueLoyaltyPassInstructionConfig {
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

export interface IssueLoyaltyPassInstructionResult {
  instruction: TransactionBuilder
  asset: KeypairSigner
}

export async function issueLoyaltyPassInstruction(
  context: VerxioContext,
  config: IssueLoyaltyPassInstructionConfig,
): Promise<IssueLoyaltyPassInstructionResult> {
  assertValidIssueLoyaltyPassInstructionConfig(config)

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

  // Create the base instruction
  let instruction = create(context.umi, {
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

  const feeInstruction = createFeeInstruction(context.umi, context.umi.identity.publicKey, 'LOYALTY_OPERATIONS')
  instruction = instruction.add(feeInstruction)

  // Add pass data initialization
  instruction = instruction.add(
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

  return {
    instruction,
    asset,
  }
}

// TODO: Replace with zod validation
function assertValidIssueLoyaltyPassInstructionConfig(config: IssueLoyaltyPassInstructionConfig) {
  if (!config) {
    throw new Error('assertValidIssueLoyaltyPassInstructionConfig: Config is undefined')
  }
  if (!config.collectionAddress || !config.collectionAddress.toString().trim()) {
    throw new Error('assertValidIssueLoyaltyPassInstructionConfig: Collection address is undefined')
  }
  if (!config.recipient || !config.recipient.toString().trim()) {
    throw new Error('assertValidIssueLoyaltyPassInstructionConfig: Recipient is undefined')
  }
  if (!config.passName || !config.passName.trim()) {
    throw new Error('assertValidIssueLoyaltyPassInstructionConfig: Pass name is undefined')
  }
  if (!config.organizationName || !config.organizationName.trim()) {
    throw new Error('assertValidIssueLoyaltyPassInstructionConfig: Organization name is undefined')
  }

  // Validate metadata URI if provided, or ensure image data is provided
  if (config.passMetadataUri) {
    if (!config.passMetadataUri.trim()) {
      throw new Error('assertValidIssueLoyaltyPassInstructionConfig: Pass metadata URI is empty')
    }
    if (!config.passMetadataUri.startsWith('https://') && !config.passMetadataUri.startsWith('http://')) {
      throw new Error('assertValidIssueLoyaltyPassInstructionConfig: Pass metadata URI is not a valid URL')
    }
  } else {
    // If no passMetadataUri, require image data
    if (!config.imageBuffer) {
      throw new Error(
        'assertValidIssueLoyaltyPassInstructionConfig: Image buffer is required when passMetadataUri is not provided',
      )
    }
    if (!config.imageFilename || !config.imageFilename.trim()) {
      throw new Error(
        'assertValidIssueLoyaltyPassInstructionConfig: Image filename is required when passMetadataUri is not provided',
      )
    }
  }

  if (!config.updateAuthority) {
    throw new Error('assertValidIssueLoyaltyPassInstructionConfig: Update authority is undefined')
  }
}
