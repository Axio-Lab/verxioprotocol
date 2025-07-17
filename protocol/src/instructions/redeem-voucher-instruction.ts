import { VerxioContext } from '@schemas/verxio-context'
import { KeypairSigner, TransactionBuilder } from '@metaplex-foundation/umi'
import { writeData, fetchAsset, collectionAddress } from '@metaplex-foundation/mpl-core'
import { validateVoucher, ValidateVoucherConfig, VoucherValidationResult } from '../lib/validate-voucher'
import { VoucherData } from '../lib/mint-voucher'
import { PLUGIN_TYPES } from '@/lib/constants'
import { createFeeInstruction } from '@utils/fee-structure'

export interface RedeemVoucherInstructionConfig extends ValidateVoucherConfig {
  merchantId: string
  updateAuthority: KeypairSigner
  redemptionAmount?: number // For percentage_off and fixed_verxio_credits
  redemptionDetails?: {
    transactionId?: string
    items?: string[]
    totalAmount?: number
    discountApplied?: number
    creditsUsed?: number
  }
}

export interface RedeemVoucherInstructionResult {
  instruction: TransactionBuilder
  validation: VoucherValidationResult
  redemptionValue: number
  updatedVoucher: VoucherData
}

export async function redeemVoucherInstruction(
  context: VerxioContext,
  config: RedeemVoucherInstructionConfig,
): Promise<RedeemVoucherInstructionResult> {
  assertValidRedeemVoucherInstructionConfig(config)

  // First validate the voucher
  const validation = await validateVoucher(context, config)
  if (validation.errors.length > 0 || !validation.voucher) {
    throw new Error('Voucher validation failed')
  }

  // Validate merchant ID
  if (validation.voucher.merchantId !== config.merchantId) {
    throw new Error(`Voucher can only be redeemed by merchant: ${validation.voucher.merchantId}`)
  }

  // Fetch the voucher asset to get collection info
  const asset = await fetchAsset(context.umi, config.voucherAddress)
  const voucherCollectionAddress = collectionAddress(asset)

  // Calculate redemption value
  const redemptionValue = calculateRedemptionValue(validation.voucher, config.redemptionAmount)

  // Update voucher data
  const updatedVoucher = updateVoucherForRedemption(validation.voucher, config.redemptionDetails)

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
    validation,
    redemptionValue,
    updatedVoucher,
  }
}

function calculateRedemptionValue(voucher: VoucherData, redemptionAmount?: number): number {
  switch (voucher.type) {
    case 'percentage_off':
      if (!redemptionAmount) {
        throw new Error('Redemption amount required for percentage_off voucher')
      }
      return (redemptionAmount * voucher.value) / 100

    case 'fixed_verxio_credits':
      return voucher.value

    case 'free_item':
      return voucher.value // Could represent item value or just 1 for quantity

    case 'buy_one_get_one':
      return voucher.value // Could represent value of free item

    case 'custom_reward':
      return voucher.value // Custom value as defined

    default:
      return 0
  }
}

function updateVoucherForRedemption(
  voucher: VoucherData,
  redemptionDetails?: RedeemVoucherInstructionConfig['redemptionDetails'],
): VoucherData {
  const updatedVoucher: VoucherData = {
    ...voucher,
    currentUses: voucher.currentUses + 1,
    usedAt: Date.now(),
  }

  // If this was the last use, mark as used
  if (updatedVoucher.currentUses >= updatedVoucher.maxUses) {
    updatedVoucher.status = 'used'
  }

  // Add redemption details if provided
  if (redemptionDetails) {
    // You could extend VoucherData to include redemption history
    // For now, we'll just update the basic fields
  }

  return updatedVoucher
}

// TODO: Replace with zod validation
function assertValidRedeemVoucherInstructionConfig(config: RedeemVoucherInstructionConfig) {
  if (!config) {
    throw new Error('assertValidRedeemVoucherInstructionConfig: Config is undefined')
  }
  if (!config.voucherAddress) {
    throw new Error('assertValidRedeemVoucherInstructionConfig: Voucher address is undefined')
  }
  if (!config.merchantId || !config.merchantId.trim()) {
    throw new Error('assertValidRedeemVoucherInstructionConfig: Merchant ID is undefined')
  }
  if (!config.updateAuthority) {
    throw new Error('assertValidRedeemVoucherInstructionConfig: Update authority is undefined')
  }
}
