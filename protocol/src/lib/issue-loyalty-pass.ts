import { VerxioContext } from '@schemas/verxio-context'
import { generateSigner, KeypairSigner, PublicKey, publicKey } from '@metaplex-foundation/umi'
import { create, ExternalPluginAdapterSchema, writeData } from '@metaplex-foundation/mpl-core'
import { ATTRIBUTE_KEYS, DEFAULT_PASS_DATA, PLUGIN_TYPES } from '@lib/constants'
import { toBase58 } from '@utils/to-base58'

export interface IssueLoyaltyPassConfig {
  collectionAddress: PublicKey
  recipient: PublicKey
  passName: string
  passMetadataUri: string
  assetSigner?: KeypairSigner
}

export async function issueLoyaltyPass(
  context: VerxioContext,
  config: IssueLoyaltyPassConfig,
): Promise<{
  asset: KeypairSigner
  signature: string
}> {
  assertValidIssueLoyaltyPassConfig(config)
  try {
    const asset = config.assetSigner ?? generateSigner(context.umi)
    const tx = await create(context.umi, {
      asset,
      name: config.passName,
      uri: config.passMetadataUri,
      owner: config.recipient,
      collection: {
        publicKey: config.collectionAddress,
      },
      plugins: [
        {
          type: PLUGIN_TYPES.APP_DATA,
          dataAuthority: {
            type: 'Address',
            address: asset.publicKey,
          },
          schema: ExternalPluginAdapterSchema.Json,
        },
        {
          type: PLUGIN_TYPES.ATTRIBUTES,
          attributeList: [{ key: ATTRIBUTE_KEYS.TYPE, value: `${config.passName} loyalty pass` }],
        },
      ],
    }).sendAndConfirm(context.umi)

    await writeData(context.umi, {
      key: {
        type: PLUGIN_TYPES.APP_DATA,
        dataAuthority: {
          type: 'Address',
          address: asset.publicKey,
        },
      },
      authority: asset,
      data: new TextEncoder().encode(JSON.stringify(DEFAULT_PASS_DATA)),
      asset: publicKey(asset.publicKey),
      collection: config.collectionAddress,
    }).sendAndConfirm(context.umi)

    return {
      asset,
      signature: toBase58(tx.signature),
    }
  } catch (error) {
    throw new Error(`Failed to issue loyalty pass: ${error}`)
  }
}

// TODO: Replace with zod validation
function assertValidIssueLoyaltyPassConfig(config: IssueLoyaltyPassConfig) {
  if (!config) {
    throw new Error('assertValidIssueLoyaltyPassConfig: Config is undefined')
  }
  if (!config.collectionAddress || !config.collectionAddress.trim() || !config.collectionAddress.trim().length) {
    throw new Error('assertValidIssueLoyaltyPassConfig: Collection address is undefined')
  }
  if (!config.recipient || !config.recipient.trim() || !config.recipient.trim().length) {
    throw new Error('assertValidIssueLoyaltyPassConfig: Recipient is undefined')
  }
  if (!config.passName || !config.passName.trim() || !config.passName.trim().length) {
    throw new Error('assertValidIssueLoyaltyPassConfig: Pass name is undefined')
  }
  if (!config.passMetadataUri || !config.passMetadataUri.trim() || !config.passMetadataUri.trim().length) {
    throw new Error('assertValidIssueLoyaltyPassConfig: Pass metadata URI is undefined')
  }
  if (!config.passMetadataUri.startsWith('https://') && !config.passMetadataUri.startsWith('http://')) {
    throw new Error('assertValidIssueLoyaltyPassConfig: Pass metadata URI is not a valid URL')
  }
}
