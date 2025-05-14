import { VerxioContext } from '@schemas/verxio-context'
import { PublicKey } from '@metaplex-foundation/umi'
import { fetchAsset } from '@metaplex-foundation/mpl-core'

export interface MessageStats {
  total: number
  unread: number
  read: number
}

export interface GetAssetMessagesResult {
  stats: MessageStats
  messages: Message[]
}

export interface Message {
  id: string
  content: string
  sender: string
  timestamp: number
  read: boolean
}

export async function getAssetMessages(
  context: VerxioContext,
  passAddress: PublicKey,
): Promise<GetAssetMessagesResult> {
  try {
    const asset = await fetchAsset(context.umi, passAddress)
    if (!asset) {
      throw new Error('Failed to get messages: Pass not found')
    }

    const appDataPlugin = asset.appDatas?.[0]
    if (!appDataPlugin) {
      throw new Error('AppData plugin not found')
    }

    const currentData = appDataPlugin.data
    const messageHistory = currentData.messageHistory

    // Calculate message statistics
    const stats: MessageStats = {
      total: messageHistory.length,
      unread: messageHistory.filter((msg: Message) => !msg.read).length,
      read: messageHistory.filter((msg: Message) => msg.read).length,
    }

    return {
      stats,
      messages: messageHistory,
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error(`Failed to get messages: ${error}`)
  }
}
