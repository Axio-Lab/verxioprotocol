import { VerxioContext } from '@schemas/verxio-context'
import { PublicKey } from '@metaplex-foundation/umi'
import { fetchAssetsByOwner } from '@metaplex-foundation/mpl-core'
import { VoucherData } from './mint-voucher'
import { ATTRIBUTE_KEYS } from '@lib/constants'

export interface GetUserVouchersConfig {
  userAddress: PublicKey
  collectionAddress?: PublicKey
  merchantId?: string
  status?: 'active' | 'used' | 'expired' | 'cancelled'
  voucherType?: 'percentage_off' | 'fixed_verxio_credits' | 'free_item' | 'buy_one_get_one' | 'custom_reward'
  limit?: number
  offset?: number
}

export interface UserVoucherInfo {
  voucherAddress: PublicKey
  voucherData: VoucherData
  collectionAddress: PublicKey
  name: string
  uri: string
  isExpired: boolean
  canRedeem: boolean
  remainingUses: number
  timeUntilExpiry: number
}

export interface GetUserVouchersResult {
  vouchers: UserVoucherInfo[]
  totalCount: number
  hasMore: boolean
  summary: {
    activeVouchers: number
    expiredVouchers: number
    usedVouchers: number
    cancelledVouchers: number
    totalValue: number
    byType: Record<string, number>
    byMerchant: Record<string, number>
  }
}

export async function getUserVouchers(
  context: VerxioContext,
  config: GetUserVouchersConfig,
): Promise<GetUserVouchersResult> {
  try {
    // Fetch all assets owned by the user
    const assets = await fetchAssetsByOwner(context.umi, config.userAddress)

    // Filter for voucher assets
    const voucherAssets = assets.filter((asset) => {
      const attributes = (asset as any).attributes
      if (!attributes || !attributes.attributeList) return false

      const typeAttribute = attributes.attributeList.find((attr: any) => attr.key === ATTRIBUTE_KEYS.TYPE)
      return typeAttribute && typeAttribute.value === 'voucher'
    })

    // Process voucher assets
    const vouchers: UserVoucherInfo[] = []
    const summary = {
      activeVouchers: 0,
      expiredVouchers: 0,
      usedVouchers: 0,
      cancelledVouchers: 0,
      totalValue: 0,
      byType: {} as Record<string, number>,
      byMerchant: {} as Record<string, number>,
    }

    for (const asset of voucherAssets) {
      try {
        const appData = (asset as any).appDatas?.[0]
        if (!appData || !appData.data) continue

        const voucherData: VoucherData = appData.data
        const now = Date.now()
        const isExpired = voucherData.expiryDate <= now
        const canRedeem = voucherData.status === 'active' && !isExpired && voucherData.currentUses < voucherData.maxUses
        const remainingUses = Math.max(0, voucherData.maxUses - voucherData.currentUses)
        const timeUntilExpiry = Math.max(0, voucherData.expiryDate - now)

        // Apply filters
        if (config.collectionAddress && (asset as any).collection !== config.collectionAddress) continue
        if (config.merchantId && voucherData.merchantId !== config.merchantId) continue
        if (config.status && voucherData.status !== config.status) continue
        if (config.voucherType && voucherData.type !== config.voucherType) continue

        const voucherInfo: UserVoucherInfo = {
          voucherAddress: (asset as any).publicKey,
          voucherData,
          collectionAddress: (asset as any).collection,
          name: (asset as any).name,
          uri: (asset as any).uri,
          isExpired,
          canRedeem,
          remainingUses,
          timeUntilExpiry,
        }

        vouchers.push(voucherInfo)

        // Update summary
        switch (voucherData.status) {
          case 'active':
            if (isExpired) {
              summary.expiredVouchers++
            } else {
              summary.activeVouchers++
            }
            break
          case 'used':
            summary.usedVouchers++
            break
          case 'cancelled':
            summary.cancelledVouchers++
            break
          case 'expired':
            summary.expiredVouchers++
            break
        }

        summary.totalValue += voucherData.value
        summary.byType[voucherData.type] = (summary.byType[voucherData.type] || 0) + 1
        summary.byMerchant[voucherData.merchantId] = (summary.byMerchant[voucherData.merchantId] || 0) + 1
      } catch (error) {
        console.warn('Error processing voucher asset:', error)
        continue
      }
    }

    // Sort vouchers by expiry date (soonest first)
    vouchers.sort((a, b) => {
      if (a.voucherData.status === 'active' && b.voucherData.status !== 'active') return -1
      if (a.voucherData.status !== 'active' && b.voucherData.status === 'active') return 1
      return a.voucherData.expiryDate - b.voucherData.expiryDate
    })

    // Apply pagination
    const offset = config.offset || 0
    const limit = config.limit || 50
    const paginatedVouchers = vouchers.slice(offset, offset + limit)

    return {
      vouchers: paginatedVouchers,
      totalCount: vouchers.length,
      hasMore: offset + limit < vouchers.length,
      summary,
    }
  } catch (error) {
    throw new Error(`Failed to get user vouchers: ${error}`)
  }
}

// Helper function to get vouchers expiring soon
export async function getExpiringVouchers(
  context: VerxioContext,
  config: GetUserVouchersConfig & { expiryWarningDays?: number },
): Promise<UserVoucherInfo[]> {
  const result = await getUserVouchers(context, config)
  const warningDays = config.expiryWarningDays || 7
  const warningTime = warningDays * 24 * 60 * 60 * 1000

  return result.vouchers.filter(
    (voucher) =>
      voucher.voucherData.status === 'active' && voucher.timeUntilExpiry > 0 && voucher.timeUntilExpiry <= warningTime,
  )
}

// Helper function to get redeemable vouchers
export async function getRedeemableVouchers(
  context: VerxioContext,
  config: GetUserVouchersConfig,
): Promise<UserVoucherInfo[]> {
  const result = await getUserVouchers(context, config)
  return result.vouchers.filter((voucher) => voucher.canRedeem)
}
