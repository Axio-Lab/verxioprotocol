import { VerxioContext } from '@schemas/verxio-context'
import { KeypairSigner, PublicKey } from '@metaplex-foundation/umi'
import { fetchAsset } from '@metaplex-foundation/mpl-core'
import { updatePassData } from './index'

export interface MarkMessageReadConfig {
  passAddress: PublicKey
  messageId: string
  signer: KeypairSigner
}

export async function markMessageRead(
  context: VerxioContext,
  config: MarkMessageReadConfig,
): Promise<{ signature: string }> {
  try {
    const asset = await fetchAsset(context.umi, config.passAddress)
    if (!asset) {
      throw new Error('Failed to mark message as read: Pass not found')
    }

    const appDataPlugin = asset.appDatas?.[0]
    if (!appDataPlugin) {
      throw new Error('AppData plugin not found')
    }

    const currentData = appDataPlugin.data
    const messageHistory = currentData.messageHistory

    // Check if message exists
    const messageExists = messageHistory.some((msg: any) => msg.id === config.messageId)
    if (!messageExists) {
      throw new Error('Message not found')
    }

    // Find and update the message
    const updatedMessageHistory = messageHistory.map((msg: any) => {
      if (msg.id === config.messageId) {
        return { ...msg, read: true }
      }
      return msg
    })

    // Update the pass data
    const result = await updatePassData(context, config.passAddress, config.signer, appDataPlugin, {
      ...currentData,
      xp: currentData.xp,
      action: 'mark_message_read',
      points: 0,
      currentData: {
        ...currentData,
        messageHistory: updatedMessageHistory,
      },
      newTier: {
        name: currentData.currentTier,
        rewards: currentData.rewards,
      },
    })

    return {
      signature: result.signature,
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error(`Failed to mark message as read: ${error}`)
  }
}
