import { createServerProgram, Network } from './serverProgram'
import { createSignerFromKeypair, keypairIdentity } from '@metaplex-foundation/umi'
import { convertSecretKeyToKeypair } from '@/lib/utils'

export function createServerContextWithFeePayer(collectionAddress: string, network: Network, feePayer: string) {
  const serverContext = createServerProgram(collectionAddress, collectionAddress, network)

  const keypairSigner = createSignerFromKeypair(serverContext.umi, convertSecretKeyToKeypair(feePayer))
  serverContext.umi.use(keypairIdentity(keypairSigner))

  return serverContext
}
