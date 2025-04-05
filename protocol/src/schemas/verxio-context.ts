import { PublicKey as UmiPublicKey, Umi } from '@metaplex-foundation/umi'

export interface VerxioContext {
  umi: Umi
  programAuthority: UmiPublicKey
  collectionAddress?: UmiPublicKey
}
