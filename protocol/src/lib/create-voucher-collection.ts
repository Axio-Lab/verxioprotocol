import { generateSigner, KeypairSigner, PublicKey } from '@metaplex-foundation/umi'
import {
  createCollection,
  CreateCollectionArgsPlugin,
  PluginAuthority,
  ExternalPluginAdapterSchema,
  writeCollectionExternalPluginAdapterDataV1,
} from '@metaplex-foundation/mpl-core'
import { ATTRIBUTE_KEYS, DEFAULT_VOUCHER_COLLECTION_DATA, DEFAULT_VOUCHER_TIERS, PLUGIN_TYPES } from '@lib/constants'
import { LoyaltyProgramTier } from '@schemas/loyalty-program-tier'
import { VerxioContext } from '@schemas/verxio-context'
import { toBase58 } from '@utils/to-base58'
import { assertValidContext } from '@utils/assert-valid-context'
import { createFeeInstruction } from '@utils/fee-structure'
import { generateVoucherCollectionMetadata, uploadImage } from './metadata/generate-nft-metadata'

export interface CreateVoucherCollectionConfig {
  collectionSigner?: KeypairSigner
  voucherCollectionName: string
  programAuthority: PublicKey
  updateAuthority?: KeypairSigner
  metadata: {
    merchantName: string
    merchantAddress: string
    contactInfo?: string
    voucherTypes: string[] // ["discount", "free_item", "credits"]
    [key: string]: any // Allow additional metadata fields
  }
  // Tier configuration - optional custom tier names, uses default thresholds if not provided
  tiers?: Array<{
    name: string // Custom tier name (e.g., "Starter", "Pro", "VIP")
    xpRequired?: number // Optional: if not provided, uses default thresholds
    rewards?: string[] // Optional rewards for this tier
  }>
  // New image and metadata options
  imageBuffer?: Buffer
  imageFilename?: string
  imageContentType?: string
  description?: string
  // Legacy support - if metadataUri is provided, use it instead of generating
  metadataUri?: string
}

export async function createVoucherCollection(
  context: VerxioContext,
  config: CreateVoucherCollectionConfig,
): Promise<{ collection: KeypairSigner; signature: string; updateAuthority?: KeypairSigner }> {
  assertValidContext(context)
  assertValidCreateVoucherCollectionConfig(config)
  const collection = config.collectionSigner ?? generateSigner(context.umi)
  const updateAuthority = config.updateAuthority ?? generateSigner(context.umi)

  try {
    // Generate metadata URI if not provided
    let metadataUri = config.metadataUri
    if (!metadataUri) {
      if (!config.imageBuffer || !config.imageFilename) {
        throw new Error('Either metadataUri or imageBuffer with imageFilename must be provided')
      }

      // Upload image first
      const imageUri = await uploadImage(context, config.imageBuffer, config.imageFilename, config.imageContentType)

      // Generate metadata
      metadataUri = await generateVoucherCollectionMetadata(context, {
        collectionName: config.voucherCollectionName,
        merchantName: config.metadata.merchantName,
        description: config.description || `Voucher collection for ${config.metadata.merchantName}`,
        imageUri,
        creator: config.programAuthority,
        mimeType: config.imageContentType,
      })
    }

    const feeInstruction = createFeeInstruction(
      context.umi,
      context.umi.identity.publicKey,
      'CREATE_VOUCHER_COLLECTION',
    )

    // Create collection with plugins
    const createTxn = await createCollection(context.umi, {
      collection,
      name: config.voucherCollectionName,
      plugins: createVoucherCollectionPlugins(config, updateAuthority.publicKey),
      uri: metadataUri,
      updateAuthority: updateAuthority.publicKey,
    })
      .add(feeInstruction)
      .sendAndConfirm(context.umi, {
        confirm: { commitment: 'confirmed' },
      })

    // Initialize collection data in a separate transaction to avoid size limits
    try {
      await writeCollectionExternalPluginAdapterDataV1(context.umi, {
        collection: collection.publicKey,
        authority: updateAuthority,
        key: {
          __kind: PLUGIN_TYPES.APP_DATA,
          fields: [
            {
              __kind: 'Address',
              address: updateAuthority.publicKey,
            },
          ],
        },
        data: new TextEncoder().encode(JSON.stringify(DEFAULT_VOUCHER_COLLECTION_DATA)),
      }).sendAndConfirm(context.umi, {
        confirm: { commitment: 'confirmed' },
      })
    } catch (error) {
      // If data initialization fails, collection is still created, log but don't fail
      console.warn('Failed to initialize collection data:', error)
    }

    const txn = createTxn

    return { collection, signature: toBase58(txn.signature), updateAuthority }
  } catch (error) {
    throw new Error(`Failed to create voucher collection: ${error}`)
  }
}

export function createVoucherCollectionPlugins(
  config: CreateVoucherCollectionConfig,
  updateAuthority: PublicKey,
): CreateCollectionArgsPlugin[] {
  // Create tiers: use custom names if provided, otherwise use defaults
  // Default thresholds: 0, 500, 1000, 2000
  const tiers: LoyaltyProgramTier[] = config.tiers
    ? config.tiers.map((customTier, index) => {
        const defaultTier = DEFAULT_VOUCHER_TIERS[index] ?? DEFAULT_VOUCHER_TIERS[DEFAULT_VOUCHER_TIERS.length - 1]
        return {
          name: customTier.name,
          xpRequired: customTier.xpRequired ?? defaultTier.xpRequired,
          rewards: customTier.rewards ?? defaultTier.rewards,
        }
      })
    : DEFAULT_VOUCHER_TIERS

  return [
    {
      type: PLUGIN_TYPES.ATTRIBUTES,
      attributeList: [
        { key: ATTRIBUTE_KEYS.PROGRAM_TYPE, value: 'voucher' },
        { key: ATTRIBUTE_KEYS.CREATOR, value: config.programAuthority.toString() },
        { key: ATTRIBUTE_KEYS.METADATA, value: JSON.stringify(config.metadata) },
        { key: ATTRIBUTE_KEYS.TIERS, value: JSON.stringify(tiers) },
      ],
    },
    {
      type: PLUGIN_TYPES.PERMANENT_TRANSFER_DELEGATE,
      authority: {
        address: config.programAuthority,
        type: 'Address',
      } as PluginAuthority,
    },
    {
      type: PLUGIN_TYPES.UPDATE_DELEGATE,
      authority: {
        address: updateAuthority,
        type: 'Address',
      } as PluginAuthority,
      additionalDelegates: [],
    },
    {
      type: PLUGIN_TYPES.APP_DATA,
      dataAuthority: {
        type: 'Address',
        address: updateAuthority,
      },
      schema: ExternalPluginAdapterSchema.Json,
    },
  ]
}

// TODO: Replace with zod validation
function assertValidCreateVoucherCollectionConfig(config: CreateVoucherCollectionConfig) {
  if (!config) {
    throw new Error('assertValidCreateVoucherCollectionConfig: Config is undefined')
  }
  if (
    !config.voucherCollectionName ||
    !config.voucherCollectionName.trim() ||
    !config.voucherCollectionName.trim().length
  ) {
    throw new Error('assertValidCreateVoucherCollectionConfig: Voucher collection name is undefined')
  }

  // Validate metadata URI if provided, or ensure image data is provided
  if (config.metadataUri) {
    if (!config.metadataUri.trim() || !config.metadataUri.trim().length) {
      throw new Error('assertValidCreateVoucherCollectionConfig: Metadata URI is empty')
    }
    if (!config.metadataUri.startsWith('https://') && !config.metadataUri.startsWith('http://')) {
      throw new Error('assertValidCreateVoucherCollectionConfig: Metadata URI is not a valid URL')
    }
  } else {
    // If no metadataUri, require image data
    if (!config.imageBuffer) {
      throw new Error(
        'assertValidCreateVoucherCollectionConfig: Image buffer is required when metadataUri is not provided',
      )
    }
    if (!config.imageFilename || !config.imageFilename.trim()) {
      throw new Error(
        'assertValidCreateVoucherCollectionConfig: Image filename is required when metadataUri is not provided',
      )
    }
  }

  if (!config.programAuthority) {
    throw new Error('assertValidCreateVoucherCollectionConfig: Program authority is undefined')
  }
  if (!config.metadata) {
    throw new Error('assertValidCreateVoucherCollectionConfig: Metadata is undefined')
  }
  if (
    !config.metadata.merchantName ||
    !config.metadata.merchantName.trim() ||
    !config.metadata.merchantName.trim().length
  ) {
    throw new Error('assertValidCreateVoucherCollectionConfig: Merchant name is undefined')
  }
  if (
    !config.metadata.merchantAddress ||
    !config.metadata.merchantAddress.trim() ||
    !config.metadata.merchantAddress.trim().length
  ) {
    throw new Error('assertValidCreateVoucherCollectionConfig: Merchant address is undefined')
  }
  if (
    !config.metadata.voucherTypes ||
    !Array.isArray(config.metadata.voucherTypes) ||
    config.metadata.voucherTypes.length === 0
  ) {
    throw new Error('assertValidCreateVoucherCollectionConfig: Voucher types are undefined or empty')
  }
}
