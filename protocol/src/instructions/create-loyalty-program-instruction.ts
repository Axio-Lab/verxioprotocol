import { generateSigner, KeypairSigner, PublicKey, TransactionBuilder } from '@metaplex-foundation/umi'
import {
  createCollection,
  CreateCollectionArgsPlugin,
  PluginAuthority,
  ExternalPluginAdapterSchema,
  writeCollectionExternalPluginAdapterDataV1,
} from '@metaplex-foundation/mpl-core'
import { ATTRIBUTE_KEYS, DEFAULT_BROADCAST_DATA, PLUGIN_TYPES } from '@/lib/constants'
import { VerxioContext } from '@schemas/verxio-context'
import { LoyaltyProgramTier } from '@schemas/loyalty-program-tier'
import { assertValidContext } from '@utils/assert-valid-context'
import { createFeeInstruction } from '@utils/fee-structure'

export interface CreateLoyaltyProgramInstructionConfig {
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

export interface CreateLoyaltyProgramInstructionResult {
  instruction: TransactionBuilder
  collection: KeypairSigner
  updateAuthority?: KeypairSigner
}

export function createLoyaltyProgramInstruction(
  context: VerxioContext,
  config: CreateLoyaltyProgramInstructionConfig,
): CreateLoyaltyProgramInstructionResult {
  assertValidContext(context)
  assertValidCreateLoyaltyProgramInstructionConfig(config)

  const collection = config.collectionSigner ?? generateSigner(context.umi)
  const updateAuthority = config.updateAuthority ?? generateSigner(context.umi)

  // Create the base instruction
  let instruction = createCollection(context.umi, {
    collection,
    name: config.loyaltyProgramName,
    plugins: createLoyaltyProgramPluginsInstruction(config, updateAuthority.publicKey),
    uri: config.metadataUri,
    updateAuthority: updateAuthority.publicKey,
  })

  const feeInstruction = createFeeInstruction(context.umi, context.umi.identity.publicKey, 'CREATE_LOYALTY_PROGRAM')
  instruction = instruction.add(feeInstruction)

  // Add broadcast data initialization
  instruction = instruction.add(
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

  return {
    instruction,
    collection,
    updateAuthority,
  }
}

export function createLoyaltyProgramPluginsInstruction(
  config: CreateLoyaltyProgramInstructionConfig,
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
function assertValidCreateLoyaltyProgramInstructionConfig(
  config: CreateLoyaltyProgramInstructionConfig,
): config is CreateLoyaltyProgramInstructionConfig {
  if (!config) {
    throw new Error('assertValidCreateLoyaltyProgramInstructionConfig: Config is undefined')
  }
  if (!config.loyaltyProgramName || !config.loyaltyProgramName.trim() || !config.loyaltyProgramName.trim().length) {
    throw new Error('assertValidCreateLoyaltyProgramInstructionConfig: Loyalty program name is undefined')
  }
  if (!config.metadataUri || !config.metadataUri.trim() || !config.metadataUri.trim().length) {
    throw new Error('assertValidCreateLoyaltyProgramInstructionConfig: Metadata URI is undefined')
  }
  if (!config.metadataUri.startsWith('https://') && !config.metadataUri.startsWith('http://')) {
    throw new Error('assertValidCreateLoyaltyProgramInstructionConfig: Metadata URI is not a valid URL')
  }
  if (!config.programAuthority || !config.programAuthority.toString().trim()) {
    throw new Error('assertValidCreateLoyaltyProgramInstructionConfig: Program authority is undefined')
  }
  if (!config.tiers) {
    throw new Error('assertValidCreateLoyaltyProgramInstructionConfig: Tiers are undefined')
  }
  if (!config.tiers.length) {
    throw new Error('assertValidCreateLoyaltyProgramInstructionConfig: Tiers are empty')
  }
  if (!config.pointsPerAction) {
    throw new Error('assertValidCreateLoyaltyProgramInstructionConfig: Points per action are undefined')
  }
  if (!Object.values(config.pointsPerAction).length) {
    throw new Error('assertValidCreateLoyaltyProgramInstructionConfig: Points per action must not be empty')
  }
  if (!config.metadata) {
    throw new Error('assertValidCreateLoyaltyProgramInstructionConfig: Metadata is undefined')
  }
  if (
    !config.metadata.organizationName ||
    !config.metadata.organizationName.trim() ||
    !config.metadata.organizationName.trim().length
  ) {
    throw new Error('assertValidCreateLoyaltyProgramInstructionConfig: Organization name is undefined')
  }
  return true
}
