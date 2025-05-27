import { PublicKey as UmiPublicKey, TransactionBuilder } from '@metaplex-foundation/umi'
import { transferV1 } from '@metaplex-foundation/mpl-core'
import { VerxioContext } from '@schemas/verxio-context'
import { validateCollectionState } from '@utils/validate-collection-state'
import { createFeeInstruction } from '@utils/fee-structure'

export interface ApproveTransferInstructionConfig {
  passAddress: UmiPublicKey
  toAddress: UmiPublicKey
}

export interface ApproveTransferInstructionResult {
  instruction: TransactionBuilder
}

export function approveTransferInstruction(
  context: VerxioContext,
  config: ApproveTransferInstructionConfig,
): ApproveTransferInstructionResult {
  validateCollectionState(context)

  // Create the base instruction
  let instruction = transferV1(context.umi, {
    asset: config.passAddress,
    newOwner: config.toAddress,
    collection: context.collectionAddress!,
  })

  const feeInstruction = createFeeInstruction(context.umi, context.umi.identity.publicKey, 'VERXIO_INTERACTION')
  instruction = instruction.add(feeInstruction)

  return {
    instruction,
  }
}
