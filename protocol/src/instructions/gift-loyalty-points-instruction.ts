import { VerxioContext } from '@schemas/verxio-context'
import { KeypairSigner, PublicKey, TransactionBuilder } from '@metaplex-foundation/umi'
import { fetchAsset, writeData } from '@metaplex-foundation/mpl-core'
import { getCollectionAttribute, calculateNewTier } from '@lib/index'
import { ATTRIBUTE_KEYS, PLUGIN_TYPES } from '@/lib/constants'
import { LoyaltyProgramTier } from '@schemas/loyalty-program-tier'
import { createFeeInstruction } from '@utils/fee-structure'

export interface GiftLoyaltyPointsInstructionConfig {
  passAddress: PublicKey
  pointsToGift: number
  signer: KeypairSigner
  action: string
}

export interface GiftLoyaltyPointsInstructionResult {
  instruction: TransactionBuilder
  newPoints: number
  pointsGifted: number
  newTier: LoyaltyProgramTier
}

export async function giftLoyaltyPointsInstruction(
  context: VerxioContext,
  config: GiftLoyaltyPointsInstructionConfig,
): Promise<GiftLoyaltyPointsInstructionResult> {
  assertValidGiftLoyaltyPointsInstructionConfig(config)

  // Fetch the asset data
  const asset = await fetchAsset(context.umi, config.passAddress)
  if (!asset) {
    throw new Error('Failed to create gift points instruction: Pass not found')
  }

  // Get the collection attribute to verify ownership
  const collectionAttribute = getCollectionAttribute(context, ATTRIBUTE_KEYS.TYPE)
  if (!collectionAttribute) {
    throw new Error('Pass does not belong to a collection')
  }

  // Get the current pass data
  const appDataPlugin = asset.appDatas?.[0]
  if (!appDataPlugin) {
    throw new Error('AppData plugin not found')
  }
  const currentData = appDataPlugin.data || {}
  const currentPoints = currentData.xp || 0

  // Calculate new points
  const newPoints = currentPoints + config.pointsToGift

  // Calculate new tier based on updated points
  const newTier = await calculateNewTier(context, newPoints)

  // Create a minimal data object with only necessary fields
  const dataToWrite = {
    xp: newPoints,
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
    newPoints,
    pointsGifted: config.pointsToGift,
    newTier,
  }
}

// TODO: Replace with zod validation
function assertValidGiftLoyaltyPointsInstructionConfig(config: GiftLoyaltyPointsInstructionConfig) {
  if (!config) {
    throw new Error('assertValidGiftLoyaltyPointsInstructionConfig: Config is undefined')
  }
  if (!config.passAddress) {
    throw new Error('assertValidGiftLoyaltyPointsInstructionConfig: Pass address is undefined')
  }
  if (typeof config.pointsToGift !== 'number' || config.pointsToGift <= 0) {
    throw new Error('assertValidGiftLoyaltyPointsInstructionConfig: Points to gift must be a positive number')
  }
  if (!config.signer) {
    throw new Error('assertValidGiftLoyaltyPointsInstructionConfig: Signer is undefined')
  }
  if (!config.action) {
    throw new Error('assertValidGiftLoyaltyPointsInstructionConfig: Action is undefined')
  }
}
