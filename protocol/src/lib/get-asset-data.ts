import { PublicKey as UmiPublicKey } from '@metaplex-foundation/umi'
import { fetchAsset } from '@metaplex-foundation/mpl-core'
import { VerxioContext } from '@schemas/verxio-context'
import { PLUGIN_TYPES } from '@lib/constants'

export interface AssetData {
  xp: number
  lastAction: string | null
  actionHistory: Array<{
    type: string
    points: number
    timestamp: number
    newTotal: number
  }>
  currentTier: string
  tierUpdatedAt: number
  rewards: string[]
  name: string
  uri: string
  owner: string
}

export async function getAssetData(context: VerxioContext, passAddress: UmiPublicKey): Promise<AssetData | null> {
  try {
    const asset = await fetchAsset(context.umi, passAddress)
    const appDataPlugin = asset.appDatas?.find((p: any) => p.type === PLUGIN_TYPES.APP_DATA)

    if (!appDataPlugin || !appDataPlugin.data) {
      return null
    }

    return {
      ...appDataPlugin.data,
      name: asset.name,
      uri: asset.uri,
      owner: asset.owner.toString(),
    }
  } catch (error) {
    // Return null if the asset is not found
    if (error instanceof Error && error.message.includes('not found')) {
      return null
    }
    // For other errors, throw them
    throw new Error(`Failed to fetch asset data: ${error}`)
  }
}
