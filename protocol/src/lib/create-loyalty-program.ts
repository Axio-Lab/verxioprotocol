import { generateSigner, KeypairSigner, PublicKey } from '@metaplex-foundation/umi'
import { createCollection, CreateCollectionArgsPlugin, PluginAuthority } from '@metaplex-foundation/mpl-core'
import { ATTRIBUTE_KEYS, PLUGIN_TYPES } from '@lib/constants'
import { VerxioContext } from '@schemas/verxio-context'
import { toBase58 } from '@utils/to-base58'
import { LoyaltyProgramTier } from '@schemas/loyalty-program-tier'
import { assertValidContext } from '@utils/assert-valid-context'

export interface CreateLoyaltyProgramConfig {
  collectionSigner?: KeypairSigner
  metadataUri: string
  organizationName: string
  pointsPerAction: Record<string, number>
  programAuthority: PublicKey
  tiers: LoyaltyProgramTier[]
}

export async function createLoyaltyProgram(
  context: VerxioContext,
  config: CreateLoyaltyProgramConfig,
): Promise<{ collection: KeypairSigner; signature: string }> {
  assertValidContext(context)
  assertValidCreateLoyaltyProgramConfig(config)
  const collection = config.collectionSigner ?? generateSigner(context.umi)

  try {
    const tx = await createCollection(context.umi, {
      collection,
      name: config.organizationName,
      plugins: createLoyaltyProgramPlugins(config),
      uri: config.metadataUri,
    }).sendAndConfirm(context.umi, { confirm: { commitment: 'confirmed' } })

    return { collection, signature: toBase58(tx.signature) }
  } catch (error) {
    throw new Error(`Failed to create loyalty program: ${error}`)
  }
}

export function createLoyaltyProgramPlugins(config: CreateLoyaltyProgramConfig): CreateCollectionArgsPlugin[] {
  return [
    {
      type: PLUGIN_TYPES.ATTRIBUTES,
      attributeList: [
        { key: ATTRIBUTE_KEYS.PROGRAM_TYPE, value: 'loyalty' },
        { key: ATTRIBUTE_KEYS.TIERS, value: JSON.stringify(config.tiers) },
        { key: ATTRIBUTE_KEYS.POINTS_PER_ACTION, value: JSON.stringify(config.pointsPerAction) },
        { key: ATTRIBUTE_KEYS.CREATOR, value: config.programAuthority.toString() },
      ],
    },
    {
      type: PLUGIN_TYPES.PERMANENT_TRANSFER_DELEGATE,
      authority: {
        address: config.programAuthority,
        type: 'Address',
      } as PluginAuthority,
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
  if (!config.organizationName || !config.organizationName.trim() || !config.organizationName.trim().length) {
    throw new Error('assertValidCreateLoyaltyProgramConfig: Organization name is undefined')
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
  return true
}
