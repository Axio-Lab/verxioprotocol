import { VerxioContext } from '@schemas/verxio-context'
import { KeypairSigner } from '@metaplex-foundation/umi'
import { writeData, fetchAsset, collectionAddress } from '@metaplex-foundation/mpl-core'
import { validateVoucher, ValidateVoucherConfig, VoucherValidationResult } from './validate-voucher'
import { VoucherData, VoucherRedemptionRecord } from './mint-voucher'
import { PLUGIN_TYPES } from '@lib/constants'
import { toBase58 } from '@utils/to-base58'
import { createFeeInstruction } from '@/utils/fee-structure'

export interface RedeemVoucherConfig extends ValidateVoucherConfig {
  updateAuthority: KeypairSigner
  merchantId: string
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

export interface VoucherRedemptionResult {
  success: boolean
  signature?: string
  validation: VoucherValidationResult
  redemptionValue?: number
  updatedVoucher?: VoucherData
  errors: string[]
}

export async function redeemVoucher(
  context: VerxioContext,
  config: RedeemVoucherConfig,
): Promise<VoucherRedemptionResult> {
  const result: VoucherRedemptionResult = {
    success: false,
    validation: { errors: [] },
    errors: [],
  }

  try {
    // First validate the voucher
    const validation = await validateVoucher(context, { voucherAddress: config.voucherAddress })
    result.validation = validation

    if (!validation.voucher) {
      result.errors.push('Voucher validation failed')
      return result
    }

    // Enforce merchantId match
    if (validation.voucher.merchantId !== config.merchantId) {
      result.errors.push('Voucher is not valid for merchant ' + config.merchantId)
      return result
    }

    // Fetch the voucher asset to get collection info
    const asset = await fetchAsset(context.umi, config.voucherAddress)
    const voucherCollectionAddress = collectionAddress(asset)
    console.log('Collection address:', voucherCollectionAddress)

    // Calculate redemption value
    const redemptionValue = calculateRedemptionValue(validation.voucher, config.redemptionAmount)
    result.redemptionValue = redemptionValue

    // Update voucher data
    const updatedVoucher = updateVoucherForRedemption(validation.voucher, redemptionValue, config.redemptionDetails)
    result.updatedVoucher = updatedVoucher

    // Create fee instruction
    const feeInstruction = createFeeInstruction(context.umi, context.umi.identity.publicKey, 'LOYALTY_OPERATIONS')

    // Update the voucher asset with new data
    const updateInstruction = writeData(context.umi, {
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

    const tx = await updateInstruction
      .add(feeInstruction)
      .sendAndConfirm(context.umi, { confirm: { commitment: 'confirmed' } })

    result.success = true
    result.signature = toBase58(tx.signature)

    return result
  } catch (error) {
    result.errors.push(`Failed to redeem voucher: ${error}`)
    return result
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
    // For fixed credits, value represents credits per redemption
    return voucher.value
  }

  // For all other voucher types, return the voucher value
  // Merchants can handle custom logic in their application layer
  return voucher.value
}

function updateVoucherForRedemption(
  voucher: VoucherData,
  redemptionValue: number,
  redemptionDetails?: RedeemVoucherConfig['redemptionDetails'],
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

// Helper function to get voucher value for display/calculation purposes
export function getVoucherDisplayValue(voucher: VoucherData): string {
  const type = voucher.type.toLowerCase()

  // Handle common patterns for backward compatibility
  if (type.includes('percentage') || type.includes('percent') || type.includes('pct')) {
    return `${voucher.value}% off`
  }

  if (type.includes('fixed') && type.includes('credit')) {
    return `${voucher.value} Verxio Credits`
  }

  if (type.includes('free')) {
    return `Free ${voucher.description}`
  }

  if (type.includes('buy_one_get_one') || type.includes('bogo')) {
    return `Buy One Get One Free`
  }

  // For custom types, return description or formatted value
  return voucher.description || `${voucher.value}`
}

// Helper function to check if voucher can be redeemed multiple times
export function isMultiUseVoucher(voucher: VoucherData): boolean {
  return voucher.maxUses > 1 && voucher.currentUses < voucher.maxUses
}

// Helper function to get remaining uses
export function getRemainingUses(voucher: VoucherData): number {
  return Math.max(0, voucher.maxUses - voucher.currentUses)
}
