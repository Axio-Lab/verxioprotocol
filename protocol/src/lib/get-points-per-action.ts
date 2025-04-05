import { VerxioContext } from '@schemas/verxio-context'
import { validateCollectionState } from '@utils/validate-collection-state'
import { ATTRIBUTE_KEYS } from './constants'
import { getCollectionAttribute } from './index'

export async function getPointsPerAction(context: VerxioContext): Promise<Record<string, number>> {
  validateCollectionState(context)

  try {
    return (await getCollectionAttribute(context, ATTRIBUTE_KEYS.POINTS_PER_ACTION)) || {}
  } catch (error) {
    throw new Error(`Failed to fetch points per action: ${error}`)
  }
}
