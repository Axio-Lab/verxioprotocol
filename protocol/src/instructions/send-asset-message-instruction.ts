import { VerxioContext } from '@schemas/verxio-context'
import { KeypairSigner, PublicKey, TransactionBuilder } from '@metaplex-foundation/umi'
import { fetchAsset, writeData } from '@metaplex-foundation/mpl-core'
import { PLUGIN_TYPES } from '@/lib/constants'
import { createFeeInstruction } from '@utils/fee-structure'

export interface SendAssetMessageInstructionConfig {
  passAddress: PublicKey
  message: string
  sender: PublicKey
  signer: KeypairSigner
}

export interface AssetMessage {
  id: string
  content: string
  sender: string
  timestamp: number
  read: boolean
}

export interface SendAssetMessageInstructionResult {
  instruction: TransactionBuilder
  message: AssetMessage
}

export async function sendAssetMessageInstruction(
  context: VerxioContext,
  config: SendAssetMessageInstructionConfig,
): Promise<SendAssetMessageInstructionResult> {
  assertValidSendAssetMessageInstructionConfig(config)

  // Fetch the asset data
  const asset = await fetchAsset(context.umi, config.passAddress)
  if (!asset) {
    throw new Error('Failed to create message instruction: Pass not found')
  }

  // Get the current pass data
  const appDataPlugin = asset.appDatas?.[0]
  if (!appDataPlugin) {
    throw new Error('AppData plugin not found')
  }

  const currentData = appDataPlugin.data || {}
  const messageHistory = currentData.messageHistory || []

  // Create new message
  const newMessage: AssetMessage = {
    id: crypto.randomUUID(),
    content: config.message,
    sender: config.sender.toString(),
    timestamp: Date.now(),
    read: false,
  }

  // Create a minimal data object with only necessary fields
  const dataToWrite = {
    xp: currentData.xp || 0,
    lastAction: 'message',
    currentTier: currentData.currentTier || 'Grind',
    tierUpdatedAt: currentData.tierUpdatedAt || Date.now(),
    actionHistory: currentData.actionHistory || [],
    messageHistory: [...messageHistory, newMessage],
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
    message: newMessage,
  }
}

function assertValidSendAssetMessageInstructionConfig(config: SendAssetMessageInstructionConfig) {
  if (!config) {
    throw new Error('assertValidSendAssetMessageInstructionConfig: Config is undefined')
  }
  if (!config.passAddress) {
    throw new Error('assertValidSendAssetMessageInstructionConfig: Pass address is undefined')
  }
  if (!config.message || !config.message.trim()) {
    throw new Error('assertValidSendAssetMessageInstructionConfig: Message is undefined or empty')
  }
  if (!config.sender) {
    throw new Error('assertValidSendAssetMessageInstructionConfig: Sender is undefined')
  }
  if (!config.signer) {
    throw new Error('assertValidSendAssetMessageInstructionConfig: Signer is undefined')
  }
}
