import { VerxioContext } from '@schemas/verxio-context'
import { KeypairSigner, PublicKey, TransactionBuilder } from '@metaplex-foundation/umi'
import { writeData, fetchAsset, collectionAddress } from '@metaplex-foundation/mpl-core'
import { VoucherData } from '../lib/mint-voucher'
import { PLUGIN_TYPES } from '@/lib/constants'
import { createFeeInstruction } from '@utils/fee-structure'

export interface ExtendVoucherExpiryInstructionConfig {
  voucherAddress: PublicKey
  updateAuthority: KeypairSigner
  newExpiryDate: number
}

export interface ExtendVoucherExpiryInstructionResult {
  instruction: TransactionBuilder
  updatedVoucher: VoucherData
  previousExpiryDate: number
}

export async function extendVoucherExpiryInstruction(
  context: VerxioContext,
  config: ExtendVoucherExpiryInstructionConfig,
): Promise<ExtendVoucherExpiryInstructionResult> {
  assertValidExtendVoucherExpiryInstructionConfig(config)

  // Fetch the voucher asset
  const asset = await fetchAsset(context.umi, config.voucherAddress)
  const voucherCollectionAddress = collectionAddress(asset)

  // Extract voucher data from AppData
  const appData = (asset as any).appDatas?.[0]
  if (!appData || !appData.data) {
    throw new Error('Voucher data not found')
  }

  const voucherData: VoucherData = appData.data

  // Check if voucher is cancelled
  if (voucherData.status === 'cancelled') {
    throw new Error('Cannot extend expiry of a cancelled voucher')
  }

  // Check if voucher is already fully used
  if (voucherData.status === 'used') {
    throw new Error('Cannot extend expiry of a fully used voucher')
  }

  // Validate new expiry date
  if (config.newExpiryDate <= Date.now()) {
    throw new Error('New expiry date must be in the future')
  }

  if (config.newExpiryDate <= voucherData.expiryDate) {
    throw new Error('New expiry date must be later than current expiry date')
  }

  // Store previous expiry date
  const previousExpiryDate = voucherData.expiryDate

  // Update voucher data
  const updatedVoucher: VoucherData = {
    ...voucherData,
    expiryDate: config.newExpiryDate,
    // If voucher was expired, reactivate it
    status: voucherData.status === 'expired' ? 'active' : voucherData.status,
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
    previousExpiryDate,
  }
}

// TODO: Replace with zod validation
function assertValidExtendVoucherExpiryInstructionConfig(config: ExtendVoucherExpiryInstructionConfig) {
  if (!config) {
    throw new Error('assertValidExtendVoucherExpiryInstructionConfig: Config is undefined')
  }
  if (!config.voucherAddress) {
    throw new Error('assertValidExtendVoucherExpiryInstructionConfig: Voucher address is undefined')
  }
  if (!config.updateAuthority) {
    throw new Error('assertValidExtendVoucherExpiryInstructionConfig: Update authority is undefined')
  }
  if (!config.newExpiryDate || config.newExpiryDate <= 0) {
    throw new Error('assertValidExtendVoucherExpiryInstructionConfig: New expiry date must be a positive number')
  }
}
