import { VerxioContext } from '@schemas/verxio-context'
import { PublicKey, KeypairSigner } from '@metaplex-foundation/umi'
import { writeData, fetchAsset, collectionAddress } from '@metaplex-foundation/mpl-core'
import { VoucherData } from './mint-voucher'
import { PLUGIN_TYPES } from '@lib/constants'
import { toBase58 } from '@utils/to-base58'
import { createFeeInstruction } from '@/utils/fee-structure'

export interface CancelVoucherConfig {
  voucherAddress: PublicKey
  updateAuthority: KeypairSigner
  reason?: string
}

export interface CancelVoucherResult {
  success: boolean
  signature?: string
  updatedVoucher?: VoucherData
  errors: string[]
}

export async function cancelVoucher(context: VerxioContext, config: CancelVoucherConfig): Promise<CancelVoucherResult> {
  const result: CancelVoucherResult = {
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

    // Check if voucher is already cancelled
    if (voucherData.status === 'cancelled') {
      result.errors.push('Voucher is already cancelled')
      return result
    }

    // Check if voucher is already fully used
    if (voucherData.status === 'used') {
      result.errors.push('Cannot cancel a fully used voucher')
      return result
    }

    // Update voucher data
    const updatedVoucher: VoucherData = {
      ...voucherData,
      status: 'cancelled',
      usedAt: Date.now(),
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
    result.errors.push(`Failed to cancel voucher: ${error}`)
    return result
  }
}

// TODO: Replace with zod validation
function assertValidCancelVoucherConfig(config: CancelVoucherConfig) {
  if (!config) {
    throw new Error('assertValidCancelVoucherConfig: Config is undefined')
  }
  if (!config.voucherAddress) {
    throw new Error('assertValidCancelVoucherConfig: Voucher address is undefined')
  }
  if (!config.updateAuthority) {
    throw new Error('assertValidCancelVoucherConfig: Update authority is undefined')
  }
}
