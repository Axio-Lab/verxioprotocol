import { VerxioContext } from '@schemas/verxio-context'
import { KeypairSigner, PublicKey } from '@metaplex-foundation/umi'
import { fetchAsset } from '@metaplex-foundation/mpl-core'
import { updatePassData } from './index'

export interface SendMessageConfig {
  passAddress: PublicKey
  message: string
  sender: PublicKey
  signer: KeypairSigner
}

export interface Message {
  id: string
  content: string
  sender: string
  timestamp: number
  read: boolean
}

export async function sendMessage(
  context: VerxioContext,
  config: SendMessageConfig,
): Promise<{
  signature: string
  message: Message
}> {
  assertValidSendMessageConfig(config)

  try {
    // Fetch the asset data
    const asset = await fetchAsset(context.umi, config.passAddress)
    if (!asset) {
      throw new Error('Failed to send message: Pass not found')
    }

    // Get the current pass data
    const appDataPlugin = asset.appDatas?.[0]
    if (!appDataPlugin) {
      throw new Error('AppData plugin not found')
    }

    const currentData = appDataPlugin.data || {}
    const messageHistory = currentData.messageHistory || []

    // Create new message
    const newMessage: Message = {
      id: crypto.randomUUID(),
      content: config.message,
      sender: config.sender.toString(),
      timestamp: Date.now(),
      read: false,
    }

    // Update the pass data with new message
    const result = await updatePassData(context, config.passAddress, config.signer, appDataPlugin, {
      xp: currentData.xp,
      action: 'message',
      points: 0,
      currentData: {
        ...currentData,
        messageHistory: [...messageHistory, newMessage],
      },
      newTier: {
        name: currentData.currentTier,
        rewards: currentData.rewards,
      },
    })

    return {
      signature: result.signature,
      message: newMessage,
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error(`Failed to send message: ${error}`)
  }
}

function assertValidSendMessageConfig(config: SendMessageConfig) {
  if (!config) {
    throw new Error('assertValidSendMessageConfig: Config is undefined')
  }
  if (!config.passAddress) {
    throw new Error('assertValidSendMessageConfig: Pass address is undefined')
  }
  if (!config.message || !config.message.trim()) {
    throw new Error('assertValidSendMessageConfig: Message is undefined or empty')
  }
  if (!config.sender) {
    throw new Error('assertValidSendMessageConfig: Sender is undefined')
  }
  if (!config.signer) {
    throw new Error('assertValidSendMessageConfig: Signer is undefined')
  }
}
