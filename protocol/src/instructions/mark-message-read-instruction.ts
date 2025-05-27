import { VerxioContext } from '@schemas/verxio-context'
import { KeypairSigner, PublicKey, TransactionBuilder } from '@metaplex-foundation/umi'
import { fetchAsset, writeData } from '@metaplex-foundation/mpl-core'
import { PLUGIN_TYPES } from '@/lib/constants'
import { createFeeInstruction } from '@utils/fee-structure'

export interface MarkMessageReadInstructionConfig {
  passAddress: PublicKey
  messageId: string
  signer: KeypairSigner
}

export interface MarkMessageReadInstructionResult {
  instruction: TransactionBuilder
}

export async function markMessageReadInstruction(
  context: VerxioContext,
  config: MarkMessageReadInstructionConfig,
): Promise<MarkMessageReadInstructionResult> {
  const asset = await fetchAsset(context.umi, config.passAddress)
  if (!asset) {
    throw new Error('Failed to create mark message read instruction: Pass not found')
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

  // Create a minimal data object with only necessary fields
  const dataToWrite = {
    xp: currentData.xp || 0,
    lastAction: 'mark_message_read',
    currentTier: currentData.currentTier || 'Grind',
    tierUpdatedAt: currentData.tierUpdatedAt || Date.now(),
    actionHistory: currentData.actionHistory || [],
    messageHistory: updatedMessageHistory,
    rewards: currentData.rewards || [],
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
  }
}
