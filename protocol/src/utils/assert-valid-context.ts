import { VerxioContext } from '@/schemas/verxio-context'

export function assertValidContext(context: VerxioContext): context is VerxioContext {
  if (!context) {
    throw new Error('assertValidContext: Context is undefined')
  }
  if (!context.umi) {
    throw new Error('assertValidContext: UMI is undefined')
  }
  if (!context.programAuthority) {
    throw new Error('assertValidContext: Program authority is undefined')
  }
  return true
}
