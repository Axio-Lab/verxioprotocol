import { VerxioContext } from '@schemas/verxio-context'
import { KeypairSigner, PublicKey, TransactionBuilder } from '@metaplex-foundation/umi'
import { fetchCollection, writeCollectionExternalPluginAdapterDataV1 } from '@metaplex-foundation/mpl-core'
import { PLUGIN_TYPES } from '@/lib/constants'
import { createFeeInstruction } from '@utils/fee-structure'

export interface SendBroadcastInstructionConfig {
  collectionAddress: PublicKey
  message: string
  sender: PublicKey
  signer: KeypairSigner
}

export interface BroadcastMessage {
  id: string
  content: string
  sender: string
  timestamp: number
  read: boolean
}

export interface SendBroadcastInstructionResult {
  instruction: TransactionBuilder
  broadcast: BroadcastMessage
}

export async function sendBroadcastInstruction(
  context: VerxioContext,
  config: SendBroadcastInstructionConfig,
): Promise<SendBroadcastInstructionResult> {
  assertValidSendBroadcastInstructionConfig(config)

  // Fetch the collection data
  const collection = await fetchCollection(context.umi, config.collectionAddress)
  if (!collection) {
    throw new Error('Failed to create broadcast instruction: Collection not found')
  }

  // Get the current broadcast data
  const appDataPlugin = collection.appDatas?.[0]
  if (!appDataPlugin) {
    throw new Error('AppData plugin not found')
  }

  if (!appDataPlugin.dataAuthority?.address) {
    throw new Error('AppData plugin dataAuthority not found')
  }

  const currentData = appDataPlugin.data
  const broadcasts = currentData.broadcasts

  // Create new broadcast
  const newBroadcast: BroadcastMessage = {
    id: crypto.randomUUID(),
    content: config.message,
    sender: config.sender.toString(),
    timestamp: Date.now(),
    read: false,
  }

  // Create a minimal data object with only necessary fields
  const dataToWrite = {
    totalBroadcasts: (currentData.totalBroadcasts || 0) + 1,
    broadcasts: [...broadcasts, newBroadcast],
  }

  // Encode the data more efficiently
  const encodedData = new TextEncoder().encode(JSON.stringify(dataToWrite))

  // Create the base instruction
  let instruction = writeCollectionExternalPluginAdapterDataV1(context.umi, {
    collection: config.collectionAddress,
    authority: config.signer,
    key: {
      __kind: PLUGIN_TYPES.APP_DATA,
      fields: [
        {
          __kind: 'Address',
          address: appDataPlugin.dataAuthority.address,
        },
      ],
    },
    data: encodedData,
  })

  const feeInstruction = createFeeInstruction(context.umi, context.umi.identity.publicKey, 'VERXIO_INTERACTION')
  instruction = instruction.add(feeInstruction)

  return {
    instruction,
    broadcast: newBroadcast,
  }
}

function assertValidSendBroadcastInstructionConfig(config: SendBroadcastInstructionConfig) {
  if (!config) {
    throw new Error('assertValidSendBroadcastInstructionConfig: Config is undefined')
  }
  if (!config.collectionAddress) {
    throw new Error('assertValidSendBroadcastInstructionConfig: Collection address is undefined')
  }
  if (!config.message || !config.message.trim()) {
    throw new Error('assertValidSendBroadcastInstructionConfig: Message is undefined or empty')
  }
  if (!config.sender) {
    throw new Error('assertValidSendBroadcastInstructionConfig: Sender is undefined')
  }
  if (!config.signer) {
    throw new Error('assertValidSendBroadcastInstructionConfig: Signer is undefined')
  }
}
