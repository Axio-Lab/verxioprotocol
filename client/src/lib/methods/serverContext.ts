import { createServerProgram, Network } from './serverProgram'
import { createSignerFromKeypair, keypairIdentity, PublicKey } from '@metaplex-foundation/umi'
import { convertSecretKeyToKeypair } from '@/lib/utils'
import { getAssetData, getProgramDetails } from '@verxioprotocol/core'

export function createServerContextWithFeePayer(collectionAddress: string, network: Network, feePayer: string) {
  const serverContext = createServerProgram(collectionAddress, collectionAddress, network)
  const keypairSigner = createSignerFromKeypair(serverContext.umi, convertSecretKeyToKeypair(feePayer))
  serverContext.umi.use(keypairIdentity(keypairSigner))

  return serverContext
}

export function createReadOnlyServerContext(collectionAddress: string, network: Network) {
  const serverContext = createServerProgram(collectionAddress, collectionAddress, network)
  return serverContext
}

export async function getVerxioPass(collectionAddress: string, network: Network, publicKey: PublicKey) {
  const serverContext = createReadOnlyServerContext(collectionAddress, network)
  const assetData = await getAssetData(serverContext, publicKey)
  return assetData
}

export async function getVerxioProgram(collectionAddress: string, network: Network, programAddress: PublicKey) {
  const serverContext = createReadOnlyServerContext(collectionAddress, network)
  serverContext.collectionAddress = programAddress
  const programDetails = await getProgramDetails(serverContext)
  return programDetails
}
