import { VerxioContext } from '@schemas/verxio-context'
import { PublicKey, KeypairSigner } from '@metaplex-foundation/umi'
import { writeData, fetchAsset, collectionAddress } from '@metaplex-foundation/mpl-core'
import { validateVoucher, ValidateVoucherConfig, VoucherValidationResult } from './validate-voucher'
import { VoucherData } from './mint-voucher'
import { PLUGIN_TYPES } from '@lib/constants'
import { toBase58 } from '@utils/to-base58'
import { createFeeInstruction } from '@/utils/fee-structure'

export interface RedeemVoucherConfig extends ValidateVoucherConfig {
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
    validation: { isValid: false, errors: [], warnings: [] },
    errors: [],
  }

  try {
    // First validate the voucher
    const validation = await validateVoucher(context, config)
    result.validation = validation

    if (!validation.isValid || !validation.voucher) {
      result.errors.push('Voucher validation failed')
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
    const updatedVoucher = updateVoucherForRedemption(validation.voucher, config.redemptionDetails)
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
  redemptionDetails?: RedeemVoucherConfig['redemptionDetails'],
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

// Helper function to get voucher value for display/calculation purposes
export function getVoucherDisplayValue(voucher: VoucherData): string {
  switch (voucher.type) {
    case 'percentage_off':
      return `${voucher.value}% off`
    case 'fixed_verxio_credits':
      return `${voucher.value} Verxio Credits`
    case 'free_item':
      return `Free ${voucher.description}`
    case 'buy_one_get_one':
      return `Buy One Get One Free`
    case 'custom_reward':
      return voucher.description
    default:
      return voucher.description
  }
}

// Helper function to check if voucher can be redeemed multiple times
export function isMultiUseVoucher(voucher: VoucherData): boolean {
  return voucher.maxUses > 1 && voucher.currentUses < voucher.maxUses
}

// Helper function to get remaining uses
export function getRemainingUses(voucher: VoucherData): number {
  return Math.max(0, voucher.maxUses - voucher.currentUses)
}
