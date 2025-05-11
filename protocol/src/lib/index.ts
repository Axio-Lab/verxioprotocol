import { KeypairSigner, PublicKey as UmiPublicKey } from '@metaplex-foundation/umi'
import { fetchCollection, writeData } from '@metaplex-foundation/mpl-core'
import { toBase58 } from '@utils/to-base58'
import { ATTRIBUTE_KEYS, DEFAULT_TIER, PLUGIN_TYPES } from './constants'
import { validateCollectionState } from '@utils/validate-collection-state'
import { VerxioContext } from '@schemas/verxio-context'
import { LoyaltyProgramTier } from '@schemas/loyalty-program-tier'
import { createFeeInstruction } from '@/utils/fee-structure'

export async function getCollectionAttribute(context: VerxioContext, attributeKey: string): Promise<any> {
  validateCollectionState(context)
  const collection = await fetchCollection(context.umi, context.collectionAddress!)
  const attribute = collection.attributes?.attributeList.find((attr) => attr.key === attributeKey)?.value
  return attribute ? JSON.parse(attribute) : null
}

export async function calculateNewTier(context: VerxioContext, xp: number): Promise<LoyaltyProgramTier> {
  const tiers = (await getCollectionAttribute(context, ATTRIBUTE_KEYS.TIERS)) || []
  return tiers.reduce((acc: any, tier: any) => {
    if (xp >= tier.xpRequired && (!acc || tier.xpRequired > acc.xpRequired)) {
      return tier
    }
    return acc
  }, DEFAULT_TIER)
}

export async function updatePassData(
  context: VerxioContext,
  passAddress: UmiPublicKey,
  signer: KeypairSigner,
  appDataPlugin: any,
  updates: {
    xp: number
    action: string
    points: number
    currentData: any
    newTier: any
    messageHistory?: any[]
  },
): Promise<{ points: number; signature: string }> {
  const feeInstruction = createFeeInstruction(context.umi, context.umi.identity.publicKey, 'VERXIO_INTERACTION')

  // Create a minimal data object with only necessary fields
  const dataToWrite = {
    xp: updates.xp,
    lastAction: updates.action,
    currentTier: updates.newTier.name,
    tierUpdatedAt:
      updates.newTier.name !== updates.currentData.currentTier ? Date.now() : updates.currentData.tierUpdatedAt,
    actionHistory: updates.currentData.actionHistory || [],
    messageHistory: updates.messageHistory || updates.currentData.messageHistory || [],
    rewards: updates.newTier.rewards || [],
  }

  // Encode the data more efficiently
  const encodedData = new TextEncoder().encode(JSON.stringify(dataToWrite))

  const txnInstruction = writeData(context.umi, {
    key: {
      type: PLUGIN_TYPES.APP_DATA,
      dataAuthority: appDataPlugin.dataAuthority,
    },
    authority: signer,
    data: encodedData,
    asset: passAddress,
    collection: context.collectionAddress!,
  }).add(feeInstruction)

  const tx = await txnInstruction.sendAndConfirm(context.umi, { confirm: { commitment: 'confirmed' } })

  return {
    points: updates.xp,
    signature: toBase58(tx.signature),
  }
}
