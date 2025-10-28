import { generateSigner, KeypairSigner, PublicKey, publicKey, TransactionBuilder } from '@metaplex-foundation/umi'
import { create, ExternalPluginAdapterSchema, writeData } from '@metaplex-foundation/mpl-core'
import { ATTRIBUTE_KEYS, PLUGIN_TYPES } from '@/lib/constants'
import { VerxioContext } from '@schemas/verxio-context'
import { createFeeInstruction } from '@utils/fee-structure'
import { generateVoucherMetadata, uploadImage } from '../lib/metadata/generate-nft-metadata'
import { VoucherData, VoucherCondition } from '../lib/mint-voucher'

export interface MintVoucherInstructionConfig {
  collectionAddress: PublicKey
  recipient: PublicKey
  voucherName: string
  voucherData: {
    type: string // Flexible voucher type defined by merchant
    value: number
    description: string
    expiryDate: number
    maxUses: number
    transferable?: boolean // Default: false
    merchantId: string
    conditions?: VoucherCondition[]
    xpReward?: number // XP points to award when voucher is redeemed
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

export interface MintVoucherInstructionResult {
  instruction: TransactionBuilder
  asset: KeypairSigner
  voucherAddress: PublicKey
}

export async function mintVoucherInstruction(
  context: VerxioContext,
  config: MintVoucherInstructionConfig,
): Promise<MintVoucherInstructionResult> {
  assertValidMintVoucherInstructionConfig(config)

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
    redemptionHistory: [],
    xpReward: config.voucherData.xpReward,
  }

  // Create the base instruction
  let instruction = create(context.umi, {
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
          ...(config.voucherData.xpReward !== undefined
            ? [{ key: ATTRIBUTE_KEYS.XP, value: config.voucherData.xpReward.toString() }]
            : []),
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

  const feeInstruction = createFeeInstruction(context.umi, context.umi.identity.publicKey, 'LOYALTY_OPERATIONS')
  instruction = instruction.add(feeInstruction)

  // Add voucher data initialization
  instruction = instruction.add(
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

  return {
    instruction,
    asset,
    voucherAddress: asset.publicKey,
  }
}

// TODO: Replace with zod validation
function assertValidMintVoucherInstructionConfig(config: MintVoucherInstructionConfig) {
  if (!config) {
    throw new Error('assertValidMintVoucherInstructionConfig: Config is undefined')
  }
  if (!config.collectionAddress || !config.collectionAddress.toString().trim()) {
    throw new Error('assertValidMintVoucherInstructionConfig: Collection address is undefined')
  }
  if (!config.recipient || !config.recipient.toString().trim()) {
    throw new Error('assertValidMintVoucherInstructionConfig: Recipient is undefined')
  }
  if (!config.voucherName || !config.voucherName.trim()) {
    throw new Error('assertValidMintVoucherInstructionConfig: Voucher name is undefined')
  }

  // Validate metadata URI if provided, or ensure image data is provided
  if (config.voucherMetadataUri) {
    if (!config.voucherMetadataUri.trim()) {
      throw new Error('assertValidMintVoucherInstructionConfig: Voucher metadata URI is empty')
    }
    if (!config.voucherMetadataUri.startsWith('https://') && !config.voucherMetadataUri.startsWith('http://')) {
      throw new Error('assertValidMintVoucherInstructionConfig: Voucher metadata URI is not a valid URL')
    }
  } else {
    // If no voucherMetadataUri, require image data
    if (!config.imageBuffer) {
      throw new Error(
        'assertValidMintVoucherInstructionConfig: Image buffer is required when voucherMetadataUri is not provided',
      )
    }
    if (!config.imageFilename || !config.imageFilename.trim()) {
      throw new Error(
        'assertValidMintVoucherInstructionConfig: Image filename is required when voucherMetadataUri is not provided',
      )
    }
  }

  if (!config.voucherData) {
    throw new Error('assertValidMintVoucherInstructionConfig: Voucher data is undefined')
  }
  if (!config.voucherData.type) {
    throw new Error('assertValidMintVoucherInstructionConfig: Voucher type is undefined')
  }
  if (config.voucherData.value === undefined || config.voucherData.value < 0) {
    throw new Error('assertValidMintVoucherInstructionConfig: Voucher value must be a non-negative number')
  }
  if (!config.voucherData.description || !config.voucherData.description.trim()) {
    throw new Error('assertValidMintVoucherInstructionConfig: Voucher description is undefined')
  }
  if (!config.voucherData.expiryDate || config.voucherData.expiryDate <= Date.now()) {
    throw new Error('assertValidMintVoucherInstructionConfig: Voucher expiry date must be in the future')
  }
  if (!config.voucherData.maxUses || config.voucherData.maxUses <= 0) {
    throw new Error('assertValidMintVoucherInstructionConfig: Voucher max uses must be greater than 0')
  }
  if (!config.voucherData.merchantId || !config.voucherData.merchantId.trim()) {
    throw new Error('assertValidMintVoucherInstructionConfig: Merchant ID is undefined')
  }
  if (!config.updateAuthority) {
    throw new Error('assertValidMintVoucherInstructionConfig: Update authority is undefined')
  }
}
