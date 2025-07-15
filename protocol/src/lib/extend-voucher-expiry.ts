import { VerxioContext } from '@schemas/verxio-context'
import { PublicKey, KeypairSigner } from '@metaplex-foundation/umi'
import { writeData, fetchAsset, collectionAddress } from '@metaplex-foundation/mpl-core'
import { VoucherData } from './mint-voucher'
import { PLUGIN_TYPES } from '@lib/constants'
import { toBase58 } from '@utils/to-base58'
import { createFeeInstruction } from '@/utils/fee-structure'

export interface ExtendVoucherExpiryConfig {
  voucherAddress: PublicKey
  updateAuthority: KeypairSigner
  newExpiryDate: number
}

export interface ExtendVoucherExpiryResult {
  success: boolean
  signature?: string
  updatedVoucher?: VoucherData
  previousExpiryDate?: number
  errors: string[]
}

export async function extendVoucherExpiry(
  context: VerxioContext,
  config: ExtendVoucherExpiryConfig,
): Promise<ExtendVoucherExpiryResult> {
  assertValidExtendVoucherExpiryConfig(config)

  const result: ExtendVoucherExpiryResult = {
    success: false,
    errors: [],
  }

  try {
    // Fetch the voucher asset
    const asset = await fetchAsset(context.umi, config.voucherAddress)
    const voucherCollectionAddress = collectionAddress(asset)

    // Extract voucher data from AppData
    const appData = (asset as any).appDatas?.[0]
    if (!appData || !appData.data) {
      result.errors.push('Voucher data not found')
      return result
    }

    const voucherData: VoucherData = appData.data

    // Check if voucher is cancelled
    if (voucherData.status === 'cancelled') {
      result.errors.push('Cannot extend expiry of a cancelled voucher')
      return result
    }

    // Check if voucher is already fully used
    if (voucherData.status === 'used') {
      result.errors.push('Cannot extend expiry of a fully used voucher')
      return result
    }

    // Validate new expiry date
    if (config.newExpiryDate <= Date.now()) {
      result.errors.push('New expiry date must be in the future')
      return result
    }

    if (config.newExpiryDate <= voucherData.expiryDate) {
      result.errors.push('New expiry date must be later than current expiry date')
      return result
    }

    // Store previous expiry date
    result.previousExpiryDate = voucherData.expiryDate

    // Update voucher data
    const updatedVoucher: VoucherData = {
      ...voucherData,
      expiryDate: config.newExpiryDate,
      // If voucher was expired, reactivate it
      status: voucherData.status === 'expired' ? 'active' : voucherData.status,
    }

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
    result.errors.push(`Failed to extend voucher expiry: ${error}`)
    return result
  }
}

// Helper function to calculate time remaining
export function getTimeRemainingUntilExpiry(voucher: VoucherData): {
  isExpired: boolean
  timeRemaining: number
  daysRemaining: number
  hoursRemaining: number
  minutesRemaining: number
} {
  const now = Date.now()
  const timeRemaining = voucher.expiryDate - now
  const isExpired = timeRemaining <= 0

  if (isExpired) {
    return {
      isExpired: true,
      timeRemaining: 0,
      daysRemaining: 0,
      hoursRemaining: 0,
      minutesRemaining: 0,
    }
  }

  const daysRemaining = Math.floor(timeRemaining / (24 * 60 * 60 * 1000))
  const hoursRemaining = Math.floor((timeRemaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
  const minutesRemaining = Math.floor((timeRemaining % (60 * 60 * 1000)) / (60 * 1000))

  return {
    isExpired: false,
    timeRemaining,
    daysRemaining,
    hoursRemaining,
    minutesRemaining,
  }
}

// Helper function to check if voucher needs extension (expires within X days)
export function shouldExtendVoucher(voucher: VoucherData, warningDays: number = 7): boolean {
  const { daysRemaining } = getTimeRemainingUntilExpiry(voucher)
  return daysRemaining <= warningDays && daysRemaining > 0
}

// TODO: Replace with zod validation
function assertValidExtendVoucherExpiryConfig(config: ExtendVoucherExpiryConfig) {
  if (!config) {
    throw new Error('assertValidExtendVoucherExpiryConfig: Config is undefined')
  }
  if (!config.voucherAddress) {
    throw new Error('assertValidExtendVoucherExpiryConfig: Voucher address is undefined')
  }
  if (!config.updateAuthority) {
    throw new Error('assertValidExtendVoucherExpiryConfig: Update authority is undefined')
  }
  if (!config.newExpiryDate || config.newExpiryDate <= 0) {
    throw new Error('assertValidExtendVoucherExpiryConfig: New expiry date must be a positive number')
  }
}
