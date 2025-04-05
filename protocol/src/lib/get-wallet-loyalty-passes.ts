import { PublicKey as UmiPublicKey } from '@metaplex-foundation/umi'
import { AssetV1, fetchAssetsByOwner } from '@metaplex-foundation/mpl-core'
import { VerxioContext } from '@schemas/verxio-context'

export async function getWalletLoyaltyPasses(context: VerxioContext, walletAddress: UmiPublicKey): Promise<AssetV1[]> {
  try {
    return await fetchAssetsByOwner(context.umi, walletAddress)
  } catch (error) {
    throw new Error(`Failed to fetch wallet loyalty passes: ${error}`)
  }
}
