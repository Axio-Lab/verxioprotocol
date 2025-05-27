import { KeypairSigner, PublicKey as UmiPublicKey, TransactionBuilder } from '@metaplex-foundation/umi'
import { fetchAsset, writeData } from '@metaplex-foundation/mpl-core'
import { VerxioContext } from '@schemas/verxio-context'
import { ATTRIBUTE_KEYS, PLUGIN_TYPES } from '@/lib/constants'
import { getCollectionAttribute, calculateNewTier } from '@lib/index'
import { createFeeInstruction } from '@utils/fee-structure'

export interface AwardLoyaltyPointsInstructionConfig {
  passAddress: UmiPublicKey
  action: string
  signer: KeypairSigner
  multiplier?: number
}

export interface AwardLoyaltyPointsInstructionResult {
  instruction: TransactionBuilder
  newXp: number
  pointsAwarded: number
  newTier: any
}

export async function awardLoyaltyPointsInstruction(
  context: VerxioContext,
  config: AwardLoyaltyPointsInstructionConfig,
): Promise<AwardLoyaltyPointsInstructionResult> {
  let asset
  try {
    asset = await fetchAsset(context.umi, config.passAddress)
  } catch (error) {
    throw new Error('Failed to create award points instruction: Pass not found')
  }

  const appDataPlugin = asset.appDatas?.[0]
  if (!appDataPlugin) {
    throw new Error('AppData plugin not found')
  }

  const currentData = appDataPlugin.data || {}
  const currentXp = currentData.xp || 0
  const pointsPerAction = await getCollectionAttribute(context, ATTRIBUTE_KEYS.POINTS_PER_ACTION)

  if (
    !pointsPerAction ||
    Object.keys(pointsPerAction).length === 0 ||
    Object.values(pointsPerAction).every((v) => v === 0)
  ) {
    throw new Error('Points per action configuration not found')
  }

  if (!pointsPerAction[config.action] || pointsPerAction[config.action] === 0) {
    throw new Error(`Action '${config.action}' is not defined in points per action configuration`)
  }

  const pointsToAward = pointsPerAction[config.action] * (config.multiplier || 1)
  const newXp = currentXp + pointsToAward
  const newTier = await calculateNewTier(context, newXp)

  // Create a minimal data object with only necessary fields
  const dataToWrite = {
    xp: newXp,
    lastAction: config.action,
    currentTier: newTier.name,
    tierUpdatedAt: newTier.name !== currentData.currentTier ? Date.now() : currentData.tierUpdatedAt,
    actionHistory: currentData.actionHistory || [],
    messageHistory: currentData.messageHistory || [],
    rewards: newTier.rewards || [],
  }

  // Encode the data more efficiently
  const encodedData = new TextEncoder().encode(JSON.stringify(dataToWrite))

  // Create the base instruction
  let instruction = writeData(context.umi, {
    key: {
      type: PLUGIN_TYPES.APP_DATA,
      dataAuthority: appDataPlugin.dataAuthority,
    },
    authority: config.signer,
    data: encodedData,
    asset: config.passAddress,
    collection: context.collectionAddress!,
  })

  const feeInstruction = createFeeInstruction(context.umi, context.umi.identity.publicKey, 'VERXIO_INTERACTION')
  instruction = instruction.add(feeInstruction)

  return {
    instruction,
    newXp,
    pointsAwarded: pointsToAward,
    newTier,
  }
}
