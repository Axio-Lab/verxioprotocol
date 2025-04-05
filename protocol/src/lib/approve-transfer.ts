import { PublicKey as UmiPublicKey } from '@metaplex-foundation/umi'
import { transferV1 } from '@metaplex-foundation/mpl-core'
import { VerxioContext } from '@schemas/verxio-context'
import { validateCollectionState } from '@utils/validate-collection-state'

export async function approveTransfer(
  context: VerxioContext,
  passAddress: UmiPublicKey,
  toAddress: UmiPublicKey,
): Promise<void> {
  validateCollectionState(context)

  try {
    await transferV1(context.umi, {
      asset: passAddress,
      newOwner: toAddress,
      collection: context.collectionAddress!,
    }).sendAndConfirm(context.umi)
  } catch (error) {
    throw new Error(`Failed to approve transfer: ${error}`)
  }
}
