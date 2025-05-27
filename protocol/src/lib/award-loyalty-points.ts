import { KeypairSigner, PublicKey as UmiPublicKey } from '@metaplex-foundation/umi'
import { fetchAsset } from '@metaplex-foundation/mpl-core'
import { VerxioContext } from '@schemas/verxio-context'
import { ATTRIBUTE_KEYS } from '@lib/constants'
import { getCollectionAttribute, calculateNewTier, updatePassData } from './index'

export interface AwardLoyaltyPointsConfig {
  passAddress: UmiPublicKey
  action: string
  signer: KeypairSigner
  multiplier?: number
}

export async function awardLoyaltyPoints(
  context: VerxioContext,
  config: AwardLoyaltyPointsConfig,
): Promise<{ points: number; signature: string }> {
  try {
    let asset
    try {
      asset = await fetchAsset(context.umi, config.passAddress)
      console.log('asset', asset)
    } catch (error) {
      throw new Error('Failed to award points: Pass not found')
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

    try {
      const result = await updatePassData(context, config.passAddress, config.signer, appDataPlugin, {
        xp: newXp,
        action: config.action,
        points: pointsToAward,
        currentData,
        newTier,
      })

      return {
        points: newXp,
        signature: result.signature,
      }
    } catch (error: any) {
      if (error.message?.includes('Invalid Authority')) {
        throw new Error('Failed to award points: Signer is not the pass owner')
      }
      throw error
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error(`Failed to award points: ${error}`)
  }
}
