import { PublicKey, TransactionBuilder } from '@metaplex-foundation/umi'
import { updateCollectionPlugin } from '@metaplex-foundation/mpl-core'
import { VerxioContext } from '@schemas/verxio-context'
import { ATTRIBUTE_KEYS, PLUGIN_TYPES } from '@/lib/constants'
import { LoyaltyProgramTier } from '@schemas/loyalty-program-tier'
import { assertValidContext } from '@utils/assert-valid-context'
import { getCollectionAttribute } from '@lib/index'
import { createFeeInstruction } from '@utils/fee-structure'
import { KeypairSigner } from '@metaplex-foundation/umi'

export interface UpdateLoyaltyProgramInstructionConfig {
  collectionAddress: PublicKey
  programAuthority: PublicKey
  updateAuthority: KeypairSigner
  newTiers?: LoyaltyProgramTier[]
  newPointsPerAction?: Record<string, number>
}

export interface UpdateLoyaltyProgramInstructionResult {
  instruction: TransactionBuilder
  updatedTiers: LoyaltyProgramTier[]
  updatedPointsPerAction: Record<string, number>
}

export async function updateLoyaltyProgramInstruction(
  context: VerxioContext,
  config: UpdateLoyaltyProgramInstructionConfig,
): Promise<UpdateLoyaltyProgramInstructionResult> {
  assertValidContext(context)
  assertValidUpdateLoyaltyProgramInstructionConfig(config)

  // Get current configuration
  const currentTiers = await getCollectionAttribute(context, ATTRIBUTE_KEYS.TIERS)
  const currentPointsPerAction = await getCollectionAttribute(context, ATTRIBUTE_KEYS.POINTS_PER_ACTION)

  if (!currentTiers || !currentPointsPerAction) {
    throw new Error('Failed to create update instruction: Current configuration not found')
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

  // Create the base instruction
  let instruction = updateCollectionPlugin(context.umi, {
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
  })

  const feeInstruction = createFeeInstruction(context.umi, context.umi.identity.publicKey, 'LOYALTY_OPERATIONS')
  instruction = instruction.add(feeInstruction)

  return {
    instruction,
    updatedTiers,
    updatedPointsPerAction,
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
function assertValidUpdateLoyaltyProgramInstructionConfig(config: UpdateLoyaltyProgramInstructionConfig) {
  if (!config) {
    throw new Error('assertValidUpdateLoyaltyProgramInstructionConfig: Config is undefined')
  }
  if (!config.collectionAddress) {
    throw new Error('assertValidUpdateLoyaltyProgramInstructionConfig: Collection address is undefined')
  }
  if (!config.programAuthority) {
    throw new Error('assertValidUpdateLoyaltyProgramInstructionConfig: Program authority is undefined')
  }
  if (!config.updateAuthority) {
    throw new Error('assertValidUpdateLoyaltyProgramInstructionConfig: Update authority is undefined')
  }
  if (config.newTiers && !Array.isArray(config.newTiers)) {
    throw new Error('assertValidUpdateLoyaltyProgramInstructionConfig: New tiers must be an array')
  }
  if (config.newPointsPerAction && typeof config.newPointsPerAction !== 'object') {
    throw new Error('assertValidUpdateLoyaltyProgramInstructionConfig: New points per action must be an object')
  }
}
