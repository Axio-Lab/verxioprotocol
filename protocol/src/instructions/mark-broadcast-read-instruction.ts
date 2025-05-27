import { VerxioContext } from '@schemas/verxio-context'
import { KeypairSigner, PublicKey, TransactionBuilder } from '@metaplex-foundation/umi'
import { fetchCollection, writeCollectionExternalPluginAdapterDataV1 } from '@metaplex-foundation/mpl-core'
import { PLUGIN_TYPES } from '@/lib/constants'
import { createFeeInstruction } from '@utils/fee-structure'

export interface MarkBroadcastReadInstructionConfig {
  collectionAddress: PublicKey
  broadcastId: string
  signer: KeypairSigner
}

export interface MarkBroadcastReadInstructionResult {
  instruction: TransactionBuilder
}

export async function markBroadcastReadInstruction(
  context: VerxioContext,
  config: MarkBroadcastReadInstructionConfig,
): Promise<MarkBroadcastReadInstructionResult> {
  const collection = await fetchCollection(context.umi, config.collectionAddress)
  if (!collection) {
    throw new Error('Failed to create mark broadcast read instruction: Collection not found')
  }

  const appDataPlugin = collection.appDatas?.[0]
  if (!appDataPlugin) {
    throw new Error('AppData plugin not found')
  }

  if (!appDataPlugin.dataAuthority?.address) {
    throw new Error('AppData plugin dataAuthority not found')
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

  // Create a minimal data object with only necessary fields
  const dataToWrite = {
    totalBroadcasts: currentData.totalBroadcasts,
    broadcasts: updatedBroadcasts,
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
  }
}
