import { VerxioContext } from '@schemas/verxio-context'
import { generateSigner, KeypairSigner, PublicKey, publicKey } from '@metaplex-foundation/umi'
import { create, ExternalPluginAdapterSchema, writeData } from '@metaplex-foundation/mpl-core'
import { ATTRIBUTE_KEYS, PLUGIN_TYPES } from '@lib/constants'
import { toBase58 } from '@utils/to-base58'
import { createFeeInstruction } from '@/utils/fee-structure'
import { generateVoucherMetadata, uploadImage } from './metadata/generate-nft-metadata'

export interface VoucherData {
  type: 'percentage_off' | 'fixed_verxio_credits' | 'free_item' | 'buy_one_get_one' | 'custom_reward'
  value: number
  description: string
  expiryDate: number
  maxUses: number
  currentUses: number
  transferable: boolean
  status: 'active' | 'used' | 'expired' | 'cancelled'
  issuedAt: number
  usedAt?: number
  merchantId: string
  conditions?: VoucherCondition[]
}

export interface VoucherCondition {
  type: 'minimum_purchase' | 'specific_items' | 'time_restriction' | 'user_tier'
  value: any
  operator: 'equals' | 'greater_than' | 'less_than' | 'contains'
}

export interface MintVoucherConfig {
  collectionAddress: PublicKey
  recipient: PublicKey
  voucherName: string
  voucherData: {
    type: 'percentage_off' | 'fixed_verxio_credits' | 'free_item' | 'buy_one_get_one' | 'custom_reward'
    value: number
    description: string
    expiryDate: number
    maxUses: number
    transferable?: boolean // Default: false
    merchantId: string
    conditions?: VoucherCondition[]
  }
  assetSigner?: KeypairSigner
  updateAuthority: KeypairSigner
  // New image and metadata options
  imageBuffer?: Buffer
  imageFilename?: string
  imageContentType?: string
  // Legacy support - if voucherMetadataUri is provided, use it instead of generating
  voucherMetadataUri?: string
}

export async function mintVoucher(
  context: VerxioContext,
  config: MintVoucherConfig,
): Promise<{
  asset: KeypairSigner
  signature: string
  voucherAddress: PublicKey
}> {
  assertValidMintVoucherConfig(config)
  try {
    const asset = config.assetSigner ?? generateSigner(context.umi)

    // Generate metadata URI if not provided
    let metadataUri = config.voucherMetadataUri
    if (!metadataUri) {
      if (!config.imageBuffer || !config.imageFilename) {
        throw new Error('Either voucherMetadataUri or imageBuffer with imageFilename must be provided')
      }

      // Upload image first
      const imageUri = await uploadImage(context, config.imageBuffer, config.imageFilename, config.imageContentType)

      // Generate metadata
      metadataUri = await generateVoucherMetadata(context, {
        voucherName: config.voucherName,
        voucherData: config.voucherData,
        imageUri,
        creator: config.updateAuthority.publicKey,
        mimeType: config.imageContentType,
      })
    }

    const feeInstruction = createFeeInstruction(context.umi, context.umi.identity.publicKey, 'LOYALTY_OPERATIONS')

    // Prepare voucher data with defaults
    const voucherData: VoucherData = {
      type: config.voucherData.type,
      value: config.voucherData.value,
      description: config.voucherData.description,
      expiryDate: config.voucherData.expiryDate,
      maxUses: config.voucherData.maxUses,
      currentUses: 0,
      transferable: config.voucherData.transferable ?? false,
      status: 'active',
      issuedAt: Date.now(),
      merchantId: config.voucherData.merchantId,
      conditions: config.voucherData.conditions || [],
    }

    const txnInstruction = create(context.umi, {
      asset,
      name: config.voucherName,
      uri: metadataUri,
      owner: config.recipient,
      authority: config.updateAuthority,
      collection: {
        publicKey: config.collectionAddress,
      },
      plugins: [
        {
          type: PLUGIN_TYPES.APP_DATA,
          dataAuthority: {
            type: 'Address',
            address: config.updateAuthority.publicKey,
          },
          schema: ExternalPluginAdapterSchema.Json,
        },
        {
          type: PLUGIN_TYPES.ATTRIBUTES,
          attributeList: [
            { key: ATTRIBUTE_KEYS.TYPE, value: 'voucher' },
            { key: 'voucherType', value: config.voucherData.type },
            { key: 'merchantId', value: config.voucherData.merchantId },
            { key: 'transferable', value: voucherData.transferable.toString() },
          ],
        },
        {
          type: PLUGIN_TYPES.FREEZE_DELEGATE,
          authority: {
            type: 'Address',
            address: config.updateAuthority.publicKey,
          },
          frozen: !voucherData.transferable, // Freeze if non-transferable
        },
      ],
    })
      .add(feeInstruction)
      .add(
        writeData(context.umi, {
          key: {
            type: PLUGIN_TYPES.APP_DATA,
            dataAuthority: {
              type: 'Address',
              address: config.updateAuthority.publicKey,
            },
          },
          authority: config.updateAuthority,
          data: new TextEncoder().encode(JSON.stringify(voucherData)),
          asset: publicKey(asset.publicKey),
          collection: config.collectionAddress,
        }),
      )

    const tx = await txnInstruction.sendAndConfirm(context.umi, { confirm: { commitment: 'confirmed' } })

    return {
      asset,
      signature: toBase58(tx.signature),
      voucherAddress: asset.publicKey,
    }
  } catch (error) {
    throw new Error(`Failed to mint voucher: ${error}`)
  }
}

// TODO: Replace with zod validation
function assertValidMintVoucherConfig(config: MintVoucherConfig) {
  if (!config) {
    throw new Error('assertValidMintVoucherConfig: Config is undefined')
  }
  if (!config.collectionAddress) {
    throw new Error('assertValidMintVoucherConfig: Collection address is undefined')
  }
  if (!config.recipient) {
    throw new Error('assertValidMintVoucherConfig: Recipient is undefined')
  }
  if (!config.voucherName || !config.voucherName.trim() || !config.voucherName.trim().length) {
    throw new Error('assertValidMintVoucherConfig: Voucher name is undefined')
  }
  if (!config.updateAuthority) {
    throw new Error('assertValidMintVoucherConfig: Update authority is undefined')
  }
  if (!config.voucherData) {
    throw new Error('assertValidMintVoucherConfig: Voucher data is undefined')
  }
  if (!config.voucherData.type) {
    throw new Error('assertValidMintVoucherConfig: Voucher type is undefined')
  }
  if (typeof config.voucherData.value !== 'number' || config.voucherData.value < 0) {
    throw new Error('assertValidMintVoucherConfig: Voucher value must be a non-negative number')
  }
  if (!config.voucherData.description || !config.voucherData.description.trim()) {
    throw new Error('assertValidMintVoucherConfig: Voucher description is undefined')
  }
  if (typeof config.voucherData.expiryDate !== 'number' || config.voucherData.expiryDate <= Date.now()) {
    throw new Error('assertValidMintVoucherConfig: Voucher expiry date must be in the future')
  }
  if (typeof config.voucherData.maxUses !== 'number' || config.voucherData.maxUses <= 0) {
    throw new Error('assertValidMintVoucherConfig: Voucher max uses must be a positive number')
  }
  if (!config.voucherData.merchantId || !config.voucherData.merchantId.trim()) {
    throw new Error('assertValidMintVoucherConfig: Merchant ID is undefined')
  }

  // Validate metadata URI if provided, or ensure image data is provided
  if (config.voucherMetadataUri) {
    if (!config.voucherMetadataUri.trim() || !config.voucherMetadataUri.trim().length) {
      throw new Error('assertValidMintVoucherConfig: Voucher metadata URI is empty')
    }
    if (!config.voucherMetadataUri.startsWith('https://') && !config.voucherMetadataUri.startsWith('http://')) {
      throw new Error('assertValidMintVoucherConfig: Voucher metadata URI is not a valid URL')
    }
  } else {
    // If no voucherMetadataUri, require image data
    if (!config.imageBuffer) {
      throw new Error('assertValidMintVoucherConfig: Image buffer is required when voucherMetadataUri is not provided')
    }
    if (!config.imageFilename || !config.imageFilename.trim()) {
      throw new Error(
        'assertValidMintVoucherConfig: Image filename is required when voucherMetadataUri is not provided',
      )
    }
  }
}
