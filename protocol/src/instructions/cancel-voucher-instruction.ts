import { VerxioContext } from '@schemas/verxio-context'
import { KeypairSigner, PublicKey, TransactionBuilder } from '@metaplex-foundation/umi'
import { writeData, fetchAsset, collectionAddress } from '@metaplex-foundation/mpl-core'
import { VoucherData } from '../lib/mint-voucher'
import { PLUGIN_TYPES } from '@/lib/constants'
import { createFeeInstruction } from '@utils/fee-structure'

export interface CancelVoucherInstructionConfig {
  voucherAddress: PublicKey
  updateAuthority: KeypairSigner
  reason?: string
}

export interface CancelVoucherInstructionResult {
  instruction: TransactionBuilder
  updatedVoucher: VoucherData
}

export async function cancelVoucherInstruction(
  context: VerxioContext,
  config: CancelVoucherInstructionConfig,
): Promise<CancelVoucherInstructionResult> {
  assertValidCancelVoucherInstructionConfig(config)

  // Fetch the voucher asset
  const asset = await fetchAsset(context.umi, config.voucherAddress)
  const voucherCollectionAddress = collectionAddress(asset)

  // Extract voucher data from AppData
  const appData = (asset as any).appDatas?.[0]
  if (!appData || !appData.data) {
    throw new Error('Voucher data not found')
  }

  const voucherData: VoucherData = appData.data

  // Check if voucher is already cancelled
  if (voucherData.status === 'cancelled') {
    throw new Error('Voucher is already cancelled')
  }

  // Check if voucher is already fully used
  if (voucherData.status === 'used') {
    throw new Error('Cannot cancel a fully used voucher')
  }

  // Update voucher data
  const updatedVoucher: VoucherData = {
    ...voucherData,
    status: 'cancelled',
    usedAt: Date.now(),
  }

  // Create the base instruction
  let instruction = writeData(context.umi, {
    key: {
      type: PLUGIN_TYPES.APP_DATA,
      dataAuthority: {
        type: 'Address',
        address: config.updateAuthority.publicKey,
      },
    },
    authority: config.updateAuthority,
    data: new TextEncoder().encode(JSON.stringify(updatedVoucher)),
    asset: config.voucherAddress,
    collection: voucherCollectionAddress,
  })

  const feeInstruction = createFeeInstruction(context.umi, context.umi.identity.publicKey, 'LOYALTY_OPERATIONS')
  instruction = instruction.add(feeInstruction)

  return {
    instruction,
    updatedVoucher,
  }
}

// TODO: Replace with zod validation
function assertValidCancelVoucherInstructionConfig(config: CancelVoucherInstructionConfig) {
  if (!config) {
    throw new Error('assertValidCancelVoucherInstructionConfig: Config is undefined')
  }
  if (!config.voucherAddress) {
    throw new Error('assertValidCancelVoucherInstructionConfig: Voucher address is undefined')
  }
  if (!config.updateAuthority) {
    throw new Error('assertValidCancelVoucherInstructionConfig: Update authority is undefined')
  }
}
