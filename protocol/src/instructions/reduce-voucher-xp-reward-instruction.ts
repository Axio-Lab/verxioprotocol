import { VerxioContext } from '@schemas/verxio-context'
import { KeypairSigner, PublicKey, TransactionBuilder } from '@metaplex-foundation/umi'
import { writeData, fetchAsset, collectionAddress } from '@metaplex-foundation/mpl-core'
import { VoucherData } from '../lib/mint-voucher'
import { ATTRIBUTE_KEYS, PLUGIN_TYPES } from '@/lib/constants'
import { createFeeInstruction } from '@utils/fee-structure'

export interface ReduceVoucherXpRewardInstructionConfig {
  voucherAddress: PublicKey
  updateAuthority: KeypairSigner
  xpToReduce: number // Amount of XP to reduce from the voucher
  reason?: string // Optional reason for the reduction
}

export interface ReduceVoucherXpRewardInstructionResult {
  instruction: TransactionBuilder
  updatedVoucher: VoucherData
  previousXpReward: number
  newXpReward: number
}

export async function reduceVoucherXpRewardInstruction(
  context: VerxioContext,
  config: ReduceVoucherXpRewardInstructionConfig,
): Promise<ReduceVoucherXpRewardInstructionResult> {
  assertValidReduceVoucherXpRewardInstructionConfig(config)

  // Fetch the voucher asset
  const asset = await fetchAsset(context.umi, config.voucherAddress)
  const voucherCollectionAddress = collectionAddress(asset)

  // Extract voucher data from AppData
  const appData = (asset as any).appDatas?.[0]
  if (!appData || !appData.data) {
    throw new Error('Voucher data not found')
  }

  const voucherData: VoucherData = appData.data

  // Check if voucher has XP reward
  if (!voucherData.xpReward || voucherData.xpReward <= 0) {
    throw new Error('Voucher does not have any XP reward to reduce')
  }

  // Check if voucher is cancelled
  if (voucherData.status === 'cancelled') {
    throw new Error('Cannot reduce XP reward of a cancelled voucher')
  }

  // Validate reduction amount
  if (config.xpToReduce > voucherData.xpReward) {
    throw new Error(`Cannot reduce ${config.xpToReduce} XP. Voucher only has ${voucherData.xpReward} XP reward remaining`)
  }

  // Store previous XP reward
  const previousXpReward = voucherData.xpReward

  // Calculate new XP reward
  const newXpReward = Math.max(0, voucherData.xpReward - config.xpToReduce)

  // Update voucher data
  const updatedVoucher: VoucherData = {
    ...voucherData,
    xpReward: newXpReward,
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
    previousXpReward,
    newXpReward,
  }
}

// TODO: Replace with zod validation
function assertValidReduceVoucherXpRewardInstructionConfig(config: ReduceVoucherXpRewardInstructionConfig) {
  if (!config) {
    throw new Error('assertValidReduceVoucherXpRewardInstructionConfig: Config is undefined')
  }
  if (!config.voucherAddress) {
    throw new Error('assertValidReduceVoucherXpRewardInstructionConfig: Voucher address is undefined')
  }
  if (!config.updateAuthority) {
    throw new Error('assertValidReduceVoucherXpRewardInstructionConfig: Update authority is undefined')
  }
  if (!config.xpToReduce || config.xpToReduce <= 0) {
    throw new Error('assertValidReduceVoucherXpRewardInstructionConfig: XP to reduce must be greater than 0')
  }
}

