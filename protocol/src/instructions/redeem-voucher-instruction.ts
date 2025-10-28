import { VerxioContext } from '@schemas/verxio-context'
import { KeypairSigner, TransactionBuilder } from '@metaplex-foundation/umi'
import { writeData, fetchAsset, collectionAddress } from '@metaplex-foundation/mpl-core'
import { validateVoucher, ValidateVoucherConfig, VoucherValidationResult } from '../lib/validate-voucher'
import { VoucherData, VoucherRedemptionRecord } from '../lib/mint-voucher'
import { PLUGIN_TYPES } from '@/lib/constants'
import { createFeeInstruction } from '@utils/fee-structure'

export interface RedeemVoucherInstructionConfig extends ValidateVoucherConfig {
  merchantId: string
  updateAuthority: KeypairSigner
  redemptionAmount?: number // Required for voucher types that need it (e.g., percentage-based vouchers)
  redemptionDetails?: {
    transactionId?: string
    items?: string[]
    totalAmount?: number
    discountApplied?: number
    creditsUsed?: number
    redemptionMessage?: string
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
  const updatedVoucher = updateVoucherForRedemption(validation.voucher, redemptionValue, config.redemptionDetails)

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
  // Handle common voucher type patterns for backward compatibility
  const type = voucher.type.toLowerCase()

  // Percentage-based vouchers (e.g., 'percentage_off', 'percent_discount', 'pct_off')
  if (type.includes('percentage') || type.includes('percent') || type.includes('pct')) {
    if (!redemptionAmount) {
      throw new Error(`Redemption amount required for percentage-based voucher type: ${voucher.type}`)
    }
    return (redemptionAmount * voucher.value) / 100
  }

  // Fixed credits/amount vouchers (e.g., 'fixed_verxio_credits', 'fixed_credits', 'fixed_amount')
  if (type.includes('fixed') && (type.includes('credit') || type.includes('amount'))) {
    return voucher.value
  }

  // For all other voucher types, return the voucher value
  // Merchants can handle custom logic in their application layer
  return voucher.value
}

function updateVoucherForRedemption(
  voucher: VoucherData,
  redemptionValue: number,
  redemptionDetails?: RedeemVoucherInstructionConfig['redemptionDetails'],
): VoucherData {
  const updatedVoucher: VoucherData = {
    ...voucher,
    currentUses: voucher.currentUses + 1,
    usedAt: Date.now(),
  }

  // For multi-use vouchers with fixed value types, value typically represents the amount per redemption
  // The value stays the same (same amount per use), so we don't reduce it
  // Merchants define the semantics of the value field based on their voucher type

  // If this was the last use, mark as used
  if (updatedVoucher.currentUses >= updatedVoucher.maxUses) {
    updatedVoucher.status = 'used'
  }

  // Add redemption record to history
  const redemptionRecord: VoucherRedemptionRecord = {
    timestamp: Date.now(),
    redemptionValue: redemptionValue,
    transactionId: redemptionDetails?.transactionId,
    items: redemptionDetails?.items,
    totalAmount: redemptionDetails?.totalAmount,
    discountApplied: redemptionDetails?.discountApplied,
    creditsUsed: redemptionDetails?.creditsUsed,
    redemptionMessage: redemptionDetails?.redemptionMessage,
  }

  // Initialize redemptionHistory if it doesn't exist
  if (!updatedVoucher.redemptionHistory) {
    updatedVoucher.redemptionHistory = []
  }

  updatedVoucher.redemptionHistory.push(redemptionRecord)

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
