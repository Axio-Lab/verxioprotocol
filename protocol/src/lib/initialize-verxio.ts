import { PublicKey as UmiPublicKey, Umi } from '@metaplex-foundation/umi'
import { VerxioContext } from '@schemas/verxio-context'

export function initializeVerxio(umi: Umi, programAuthority: UmiPublicKey): VerxioContext {
  return {
    umi,
    programAuthority,
  }
}
