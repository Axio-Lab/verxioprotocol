import { VerxioContext } from '@schemas/verxio-context'
import { KeypairSigner, PublicKey } from '@metaplex-foundation/umi'
import { fetchCollection } from '@metaplex-foundation/mpl-core'
import { updateProgramData } from './index'

export interface MarkBroadcastReadConfig {
  collectionAddress: PublicKey
  broadcastId: string
  signer: KeypairSigner
}

export async function markBroadcastRead(
  context: VerxioContext,
  config: MarkBroadcastReadConfig,
): Promise<{ signature: string }> {
  try {
    const collection = await fetchCollection(context.umi, config.collectionAddress)
    if (!collection) {
      throw new Error('Failed to mark broadcast as read: Collection not found')
    }

    const appDataPlugin = collection.appDatas?.[0]
    if (!appDataPlugin) {
      throw new Error('AppData plugin not found')
    }

    const currentData = appDataPlugin.data
    const broadcasts = currentData.broadcasts

    // Check if broadcast exists
    const broadcastExists = broadcasts.some((broadcast: any) => broadcast.id === config.broadcastId)
    if (!broadcastExists) {
      throw new Error('Broadcast not found')
    }

    // Find and update the broadcast
    const updatedBroadcasts = broadcasts.map((broadcast: any) => {
      if (broadcast.id === config.broadcastId) {
        return { ...broadcast, read: true }
      }
      return broadcast
    })

    // Update the collection data
    const result = await updateProgramData(context, config.collectionAddress, config.signer, appDataPlugin, {
      totalBroadcasts: currentData.totalBroadcasts,
      broadcasts: updatedBroadcasts,
    })

    return {
      signature: result.signature,
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error(`Failed to mark broadcast as read: ${error}`)
  }
}
