import { generateSigner, KeypairSigner, PublicKey } from '@metaplex-foundation/umi'
import {
  createCollection,
  CreateCollectionArgsPlugin,
  PluginAuthority,
  ExternalPluginAdapterSchema,
  writeCollectionExternalPluginAdapterDataV1,
} from '@metaplex-foundation/mpl-core'
import { ATTRIBUTE_KEYS, DEFAULT_BROADCAST_DATA, PLUGIN_TYPES } from '@lib/constants'
import { VerxioContext } from '@schemas/verxio-context'
import { toBase58 } from '@utils/to-base58'
import { LoyaltyProgramTier } from '@schemas/loyalty-program-tier'
import { assertValidContext } from '@utils/assert-valid-context'
import { createFeeInstruction } from '@utils/fee-structure'

export interface CreateLoyaltyProgramConfig {
  collectionSigner?: KeypairSigner
  metadataUri: string
  loyaltyProgramName: string
  pointsPerAction: Record<string, number>
  programAuthority: PublicKey
  updateAuthority?: KeypairSigner
  tiers: LoyaltyProgramTier[]
  metadata: {
    organizationName: string
    brandColor?: string
    [key: string]: any // Allow additional metadata fields
  }
}

export async function createLoyaltyProgram(
  context: VerxioContext,
  config: CreateLoyaltyProgramConfig,
): Promise<{ collection: KeypairSigner; signature: string; updateAuthority?: KeypairSigner }> {
  assertValidContext(context)
  assertValidCreateLoyaltyProgramConfig(config)
  const collection = config.collectionSigner ?? generateSigner(context.umi)
  const updateAuthority = config.updateAuthority ?? generateSigner(context.umi)

  try {
    const feeInstruction = createFeeInstruction(context.umi, context.umi.identity.publicKey, 'CREATE_LOYALTY_PROGRAM')

    // Create collection with plugins
    const txnInstruction = createCollection(context.umi, {
      collection,
      name: config.loyaltyProgramName,
      plugins: createLoyaltyProgramPlugins(config, updateAuthority.publicKey),
      uri: config.metadataUri,
      updateAuthority: updateAuthority.publicKey,
    })
      .add(feeInstruction)

      .add(
        writeCollectionExternalPluginAdapterDataV1(context.umi, {
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
          data: new TextEncoder().encode(JSON.stringify(DEFAULT_BROADCAST_DATA)),
        }),
      )

    const txn = await txnInstruction.sendAndConfirm(context.umi, {
      confirm: { commitment: 'confirmed' },
    })

    return { collection, signature: toBase58(txn.signature), updateAuthority }
  } catch (error) {
    throw new Error(`Failed to create loyalty program: ${error}`)
  }
}

export function createLoyaltyProgramPlugins(
  config: CreateLoyaltyProgramConfig,
  updateAuthority: PublicKey,
): CreateCollectionArgsPlugin[] {
  return [
    {
      type: PLUGIN_TYPES.ATTRIBUTES,
      attributeList: [
        { key: ATTRIBUTE_KEYS.PROGRAM_TYPE, value: 'loyalty' },
        { key: ATTRIBUTE_KEYS.TIERS, value: JSON.stringify(config.tiers) },
        { key: ATTRIBUTE_KEYS.POINTS_PER_ACTION, value: JSON.stringify(config.pointsPerAction) },
        { key: ATTRIBUTE_KEYS.CREATOR, value: config.programAuthority.toString() },
        { key: ATTRIBUTE_KEYS.METADATA, value: JSON.stringify(config.metadata) },
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
function assertValidCreateLoyaltyProgramConfig(
  config: CreateLoyaltyProgramConfig,
): config is CreateLoyaltyProgramConfig {
  if (!config) {
    throw new Error('assertValidCreateLoyaltyProgramConfig: Config is undefined')
  }
  if (!config.loyaltyProgramName || !config.loyaltyProgramName.trim() || !config.loyaltyProgramName.trim().length) {
    throw new Error('assertValidCreateLoyaltyProgramConfig: Loyalty program name is undefined')
  }
  if (!config.metadataUri || !config.metadataUri.trim() || !config.metadataUri.trim().length) {
    throw new Error('assertValidCreateLoyaltyProgramConfig: Metadata URI is undefined')
  }
  if (!config.metadataUri.startsWith('https://') && !config.metadataUri.startsWith('http://')) {
    throw new Error('assertValidCreateLoyaltyProgramConfig: Metadata URI is not a valid URL')
  }
  if (!config.programAuthority || !config.programAuthority.trim() || !config.programAuthority.trim().length) {
    throw new Error('assertValidCreateLoyaltyProgramConfig: Program authority is undefined')
  }
  if (!config.tiers) {
    throw new Error('assertValidCreateLoyaltyProgramConfig: Tiers are undefined')
  }
  if (!config.tiers.length) {
    throw new Error('assertValidCreateLoyaltyProgramConfig: Tiers are empty')
  }
  if (!config.pointsPerAction) {
    throw new Error('assertValidCreateLoyaltyProgramConfig: Points per action are undefined')
  }
  if (!Object.values(config.pointsPerAction).length) {
    throw new Error('assertValidCreateLoyaltyProgramConfig: Points per action must not be empty')
  }
  if (!config.metadata) {
    throw new Error('assertValidCreateLoyaltyProgramConfig: Metadata is undefined')
  }
  if (
    !config.metadata.organizationName ||
    !config.metadata.organizationName.trim() ||
    !config.metadata.organizationName.trim().length
  ) {
    throw new Error('assertValidCreateLoyaltyProgramConfig: Host name is undefined')
  }
  return true
}
