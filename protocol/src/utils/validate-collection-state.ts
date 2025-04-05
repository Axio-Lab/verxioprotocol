import { VerxioContext } from '@/schemas/verxio-context'

export function validateCollectionState(context: VerxioContext) {
  if (!context.collectionAddress) {
    throw new Error('Collection not initialized')
  }
}
