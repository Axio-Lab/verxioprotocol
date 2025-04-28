import { PublicKey } from '@metaplex-foundation/umi'
import { updateCollectionPlugin } from '@metaplex-foundation/mpl-core'
import { VerxioContext } from '@schemas/verxio-context'
import { ATTRIBUTE_KEYS, PLUGIN_TYPES } from '@lib/constants'
import { LoyaltyProgramTier } from '@schemas/loyalty-program-tier'
import { assertValidContext } from '@utils/assert-valid-context'
import { getCollectionAttribute } from './index'
import { toBase58 } from '@utils/to-base58'
import { createFeeInstruction } from '@/utils/fee-structure'
import { KeypairSigner } from '@metaplex-foundation/umi'

export interface UpdateLoyaltyProgramConfig {
  collectionAddress: PublicKey
  programAuthority: PublicKey
  updateAuthority: KeypairSigner
  newTiers?: LoyaltyProgramTier[]
  newPointsPerAction?: Record<string, number>
}

export async function updateLoyaltyProgram(
  context: VerxioContext,
  config: UpdateLoyaltyProgramConfig,
): Promise<{ signature: string }> {
  assertValidContext(context)
  assertValidUpdateLoyaltyProgramConfig(config)

  try {
    // Get current configuration
    const currentTiers = await getCollectionAttribute(context, ATTRIBUTE_KEYS.TIERS)
    const currentPointsPerAction = await getCollectionAttribute(context, ATTRIBUTE_KEYS.POINTS_PER_ACTION)

    if (!currentTiers || !currentPointsPerAction) {
      throw new Error('Failed to update loyalty program: Current configuration not found')
    }

    // Validate and merge new tiers
    let updatedTiers = currentTiers
    if (config.newTiers) {
      updatedTiers = validateAndMergeTiers(currentTiers, config.newTiers)
    }

    // Validate and merge new points per action
    let updatedPointsPerAction = currentPointsPerAction
    if (config.newPointsPerAction) {
      updatedPointsPerAction = validateAndMergePointsPerAction(currentPointsPerAction, config.newPointsPerAction)
    }

    // Update the collection plugin with new configuration
    const feeInstruction = createFeeInstruction(context.umi, context.umi.identity.publicKey, 'LOYALTY_OPERATIONS')
    const txnInstruction = updateCollectionPlugin(context.umi, {
      collection: config.collectionAddress,
      plugin: {
        type: PLUGIN_TYPES.ATTRIBUTES,
        attributeList: [
          { key: ATTRIBUTE_KEYS.PROGRAM_TYPE, value: 'loyalty' },
          { key: ATTRIBUTE_KEYS.TIERS, value: JSON.stringify(updatedTiers) },
          { key: ATTRIBUTE_KEYS.POINTS_PER_ACTION, value: JSON.stringify(updatedPointsPerAction) },
          { key: ATTRIBUTE_KEYS.CREATOR, value: config.programAuthority.toString() },
        ],
      },
      authority: config.updateAuthority,
    }).add(feeInstruction)

    const tx = await txnInstruction.sendAndConfirm(context.umi, { confirm: { commitment: 'confirmed' } })
    return { signature: toBase58(tx.signature) }
  } catch (error) {
    throw new Error(`Failed to update loyalty program: ${error}`)
  }
}

function validateAndMergeTiers(
  currentTiers: LoyaltyProgramTier[],
  newTiers: LoyaltyProgramTier[],
): LoyaltyProgramTier[] {
  // Ensure Grind tier exists and is first
  const grindTier = currentTiers.find((tier) => tier.name === 'Grind')
  if (!grindTier) {
    throw new Error('Grind tier must exist and cannot be removed')
  }

  // Create a map of existing tiers for easy lookup
  const existingTiersMap = new Map(currentTiers.map((tier) => [tier.name, tier]))

  // Process new tiers
  const updatedTiers = newTiers.map((newTier) => {
    const existingTier = existingTiersMap.get(newTier.name)
    if (existingTier) {
      // Update existing tier
      return {
        ...existingTier,
        xpRequired: newTier.xpRequired,
        rewards: newTier.rewards,
      }
    }
    // Add new tier
    return newTier
  })

  // Ensure Grind tier is first
  const grindTierIndex = updatedTiers.findIndex((tier) => tier.name === 'Grind')
  if (grindTierIndex !== 0) {
    const grindTier = updatedTiers.splice(grindTierIndex, 1)[0]
    updatedTiers.unshift(grindTier)
  }

  // Check if Grind tier exists in the updated tiers
  if (!updatedTiers.find((tier) => tier.name === 'Grind')) {
    throw new Error('Grind tier must exist')
  }

  return updatedTiers
}

function validateAndMergePointsPerAction(
  currentPointsPerAction: Record<string, number>,
  newPointsPerAction: Record<string, number>,
): Record<string, number> {
  // Create a copy of current points per action
  const updatedPointsPerAction = { ...currentPointsPerAction }

  // Update or add new points per action
  Object.entries(newPointsPerAction).forEach(([action, points]) => {
    if (points < 0) {
      throw new Error(`Points for action '${action}' cannot be negative`)
    }
    updatedPointsPerAction[action] = points
  })

  return updatedPointsPerAction
}

// TODO: Replace with zod validation
function assertValidUpdateLoyaltyProgramConfig(config: UpdateLoyaltyProgramConfig) {
  if (!config) {
    throw new Error('assertValidUpdateLoyaltyProgramConfig: Config is undefined')
  }
  if (!config.collectionAddress) {
    throw new Error('assertValidUpdateLoyaltyProgramConfig: Collection address is undefined')
  }
  if (!config.programAuthority) {
    throw new Error('assertValidUpdateLoyaltyProgramConfig: Program authority is undefined')
  }
  if (!config.updateAuthority) {
    throw new Error('assertValidUpdateLoyaltyProgramConfig: Update authority is undefined')
  }
  if (config.newTiers && !Array.isArray(config.newTiers)) {
    throw new Error('assertValidUpdateLoyaltyProgramConfig: New tiers must be an array')
  }
  if (config.newPointsPerAction && typeof config.newPointsPerAction !== 'object') {
    throw new Error('assertValidUpdateLoyaltyProgramConfig: New points per action must be an object')
  }
}
