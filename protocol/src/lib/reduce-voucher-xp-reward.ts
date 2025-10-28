import { VerxioContext } from '@schemas/verxio-context'
import { PublicKey, KeypairSigner } from '@metaplex-foundation/umi'
import { writeData, fetchAsset, collectionAddress } from '@metaplex-foundation/mpl-core'
import { VoucherData } from './mint-voucher'
import { PLUGIN_TYPES } from '@lib/constants'
import { toBase58 } from '@utils/to-base58'
import { createFeeInstruction } from '@/utils/fee-structure'

export interface ReduceVoucherXpRewardConfig {
  voucherAddress: PublicKey
  updateAuthority: KeypairSigner
  xpToReduce: number // Amount of XP to reduce from the voucher
  reason?: string // Optional reason for the reduction
}

export interface ReduceVoucherXpRewardResult {
  success: boolean
  signature?: string
  updatedVoucher?: VoucherData
  previousXpReward?: number
  newXpReward?: number
  errors: string[]
}

export async function reduceVoucherXpReward(
  context: VerxioContext,
  config: ReduceVoucherXpRewardConfig,
): Promise<ReduceVoucherXpRewardResult> {
  const result: ReduceVoucherXpRewardResult = {
    success: false,
    errors: [],
  }

  try {
    // Validate config
    if (config.xpToReduce <= 0) {
      result.errors.push('XP to reduce must be greater than 0')
      return result
    }

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

    // Check if voucher has XP reward
    if (!voucherData.xpReward || voucherData.xpReward <= 0) {
      result.errors.push('Voucher does not have any XP reward to reduce')
      return result
    }

    // Check if voucher is cancelled
    if (voucherData.status === 'cancelled') {
      result.errors.push('Cannot reduce XP reward of a cancelled voucher')
      return result
    }

    // Validate reduction amount
    if (config.xpToReduce > voucherData.xpReward) {
      result.errors.push(`Cannot reduce ${config.xpToReduce} XP. Voucher only has ${voucherData.xpReward} XP reward remaining`)
      return result
    }

    // Store previous XP reward
    result.previousXpReward = voucherData.xpReward

    // Calculate new XP reward
    const newXpReward = Math.max(0, voucherData.xpReward - config.xpToReduce)
    result.newXpReward = newXpReward

    // Update voucher data
    const updatedVoucher: VoucherData = {
      ...voucherData,
      xpReward: newXpReward,
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
    result.errors.push(`Failed to reduce voucher XP reward: ${error}`)
    return result
  }
}

// TODO: Replace with zod validation
function assertValidReduceVoucherXpRewardConfig(config: ReduceVoucherXpRewardConfig) {
  if (!config) {
    throw new Error('assertValidReduceVoucherXpRewardConfig: Config is undefined')
  }
  if (!config.voucherAddress) {
    throw new Error('assertValidReduceVoucherXpRewardConfig: Voucher address is undefined')
  }
  if (!config.updateAuthority) {
    throw new Error('assertValidReduceVoucherXpRewardConfig: Update authority is undefined')
  }
  if (!config.xpToReduce || config.xpToReduce <= 0) {
    throw new Error('assertValidReduceVoucherXpRewardConfig: XP to reduce must be greater than 0')
  }
}

