import { VerxioContext } from '@schemas/verxio-context'
import { validateCollectionState } from '@utils/validate-collection-state'
import { fetchCollection } from '@metaplex-foundation/mpl-core'
import { ATTRIBUTE_KEYS } from './constants'

export async function getProgramDetails(context: VerxioContext): Promise<{
  name: string
  uri: string
  collectionAddress: string
  updateAuthority: string
  numMinted: number
  transferAuthority: string
  creator: string
}> {
  validateCollectionState(context)

  try {
    const collection = await fetchCollection(context.umi, context.collectionAddress!)
    return {
      name: collection.name,
      uri: collection.uri,
      collectionAddress: collection.publicKey,
      updateAuthority: collection.updateAuthority,
      numMinted: collection.numMinted,
      transferAuthority: collection.permanentTransferDelegate?.authority.address?.toString()!,
      creator: collection.attributes?.attributeList.find((attr) => attr.key === ATTRIBUTE_KEYS.CREATOR)?.value!,
    }
  } catch (error) {
    throw new Error(`Failed to fetch program details: ${error}`)
  }
}
