import { VerxioContext } from '@schemas/verxio-context'
import { KeypairSigner, PublicKey } from '@metaplex-foundation/umi'
import { fetchAsset } from '@metaplex-foundation/mpl-core'
import { getCollectionAttribute, calculateNewTier, updatePassData } from './index'
import { ATTRIBUTE_KEYS } from './constants'
import { LoyaltyProgramTier } from '@schemas/loyalty-program-tier'

export interface RevokeLoyaltyPointsConfig {
  passAddress: PublicKey
  pointsToRevoke: number
  signer: KeypairSigner
}

export async function revokeLoyaltyPoints(
  context: VerxioContext,
  config: RevokeLoyaltyPointsConfig,
): Promise<{
  points: number
  signature: string
  newTier: LoyaltyProgramTier
}> {
  assertValidRevokeLoyaltyPointsConfig(config)
  try {
    // Fetch the asset data
    let asset
    try {
      asset = await fetchAsset(context.umi, config.passAddress)
    } catch (error) {
      throw new Error('Failed to revoke points: Pass not found')
    }
    if (!asset) {
      throw new Error('Failed to revoke points: Pass not found')
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

    // Calculate new points (ensure we don't go below 0)
    const newPoints = Math.max(0, currentPoints - config.pointsToRevoke)

    // Calculate new tier based on updated points
    const newTier = await calculateNewTier(context, newPoints)

    // Update the pass data on-chain
    try {
      const result = await updatePassData(context, config.passAddress, config.signer, appDataPlugin, {
        xp: newPoints,
        action: 'revoke',
        points: -config.pointsToRevoke,
        currentData,
        newTier,
      })

      return {
        points: newPoints,
        signature: result.signature,
        newTier,
      }
    } catch (error: any) {
      console.error('Error in updatePassData:', error)
      if (error.message?.includes('Invalid Authority')) {
        throw new Error('Failed to revoke points: Signer is not the pass owner')
      }
      throw error
    }
  } catch (error) {
    // If it's already an Error object, rethrow it
    if (error instanceof Error) {
      throw error
    }
    // Otherwise wrap it in a new Error
    throw new Error(`Failed to revoke points: ${error}`)
  }
}

// TODO: Replace with zod validation
function assertValidRevokeLoyaltyPointsConfig(config: RevokeLoyaltyPointsConfig) {
  if (!config) {
    throw new Error('assertValidRevokeLoyaltyPointsConfig: Config is undefined')
  }
  if (!config.passAddress) {
    throw new Error('assertValidRevokeLoyaltyPointsConfig: Pass address is undefined')
  }
  if (typeof config.pointsToRevoke !== 'number' || config.pointsToRevoke <= 0) {
    throw new Error('assertValidRevokeLoyaltyPointsConfig: Points to revoke must be a positive number')
  }
  if (!config.signer) {
    throw new Error('assertValidRevokeLoyaltyPointsConfig: Signer is undefined')
  }
}
