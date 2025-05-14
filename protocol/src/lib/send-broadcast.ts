import { VerxioContext } from '@schemas/verxio-context'
import { KeypairSigner, PublicKey } from '@metaplex-foundation/umi'
import { fetchCollection } from '@metaplex-foundation/mpl-core'
import { updateProgramData } from './index'

export interface SendBroadcastConfig {
  collectionAddress: PublicKey
  message: string
  sender: PublicKey
  signer: KeypairSigner
}

export interface Broadcast {
  id: string
  content: string
  sender: string
  timestamp: number
  read: boolean
}

export async function sendBroadcast(
  context: VerxioContext,
  config: SendBroadcastConfig,
): Promise<{
  signature: string
  broadcast: Broadcast
}> {
  assertValidSendBroadcastConfig(config)

  try {
    // Fetch the collection data
    const collection = await fetchCollection(context.umi, config.collectionAddress)
    if (!collection) {
      throw new Error('Failed to send broadcast: Collection not found')
    }

    // Get the current broadcast data
    const appDataPlugin = collection.appDatas?.[0]
    console.log('appDataPlugin', appDataPlugin)
    if (!appDataPlugin) {
      throw new Error('AppData plugin not found')
    }

    const currentData = appDataPlugin.data
    const broadcasts = currentData.broadcasts

    // Create new broadcast
    const newBroadcast: Broadcast = {
      id: crypto.randomUUID(),
      content: config.message,
      sender: config.sender.toString(),
      timestamp: Date.now(),
      read: false,
    }

    // Update the collection data with new broadcast
    const result = await updateProgramData(context, config.collectionAddress, config.signer, appDataPlugin, {
      totalBroadcasts: (currentData.totalBroadcasts || 0) + 1,
      broadcasts: [...broadcasts, newBroadcast],
    })

    return {
      signature: result.signature,
      broadcast: newBroadcast,
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error(`Failed to send broadcast: ${error}`)
  }
}

function assertValidSendBroadcastConfig(config: SendBroadcastConfig) {
  if (!config) {
    throw new Error('assertValidSendBroadcastConfig: Config is undefined')
  }
  if (!config.collectionAddress) {
    throw new Error('assertValidSendBroadcastConfig: Collection address is undefined')
  }
  if (!config.message || !config.message.trim()) {
    throw new Error('assertValidSendBroadcastConfig: Message is undefined or empty')
  }
  if (!config.sender) {
    throw new Error('assertValidSendBroadcastConfig: Sender is undefined')
  }
  if (!config.signer) {
    throw new Error('assertValidSendBroadcastConfig: Signer is undefined')
  }
}
