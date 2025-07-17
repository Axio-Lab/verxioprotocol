import { VerxioContext } from '@schemas/verxio-context'
import { PublicKey } from '@metaplex-foundation/umi'
import { fetchAsset } from '@metaplex-foundation/mpl-core'
import { VoucherData } from './mint-voucher'

export interface ValidateVoucherConfig {
  voucherAddress: PublicKey
}

export interface VoucherValidationResult {
  voucher?: VoucherData
  errors: string[]
}

export async function validateVoucher(
  context: VerxioContext,
  config: ValidateVoucherConfig,
): Promise<VoucherValidationResult> {
  const result: VoucherValidationResult = {
    errors: [],
  }

  try {
    // Fetch the voucher asset
    const asset = await fetchAsset(context.umi, config.voucherAddress)

    // Extract voucher data from AppData (new structure)
    const appData = (asset as any).appDatas?.[0]
    if (!appData || !appData.data) {
      result.errors.push('Voucher data not found')
      return result
    }

    const voucherData: VoucherData = appData.data
    result.voucher = voucherData
    return result
  } catch (error) {
    result.errors.push(`Failed to fetch voucher: ${error}`)
    return result
  }
}
