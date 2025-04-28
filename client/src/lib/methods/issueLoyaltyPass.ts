import { issueLoyaltyPass } from '@verxioprotocol/core'
import { VerxioContext } from '@verxioprotocol/core'
import { publicKey } from '@metaplex-foundation/umi'

export interface IssueLoyaltyPassParams {
  collectionAddress: string
  recipient: string
  passName: string
  passMetadataUri: string
  assetSigner: any // Required: Provide a signer for the pass
  updateAuthority: any // Required: Provide an update authority for the pass
}

export interface IssueLoyaltyPassResult {
  asset: any // Pass signer
  signature: string // Transaction signature
}

export const issueNewLoyaltyPass = async (
  context: VerxioContext,
  params: IssueLoyaltyPassParams,
): Promise<IssueLoyaltyPassResult> => {
  try {
    const result = await issueLoyaltyPass(context, {
      collectionAddress: publicKey(params.collectionAddress),
      recipient: publicKey(params.recipient),
      passName: params.passName,
      passMetadataUri: params.passMetadataUri,
      assetSigner: params.assetSigner,
      updateAuthority: params.updateAuthority,
    })

    return result
  } catch (error) {
    console.error('Error issuing loyalty pass:', error)
    throw error
  }
}
