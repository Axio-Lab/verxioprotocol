import { createServerProgram, Network } from './serverProgram'
import { keypairIdentity, PublicKey } from '@metaplex-foundation/umi'
// import { convertSecretKeyToKeypair } from '@/lib/utils'
import { getAssetData, getProgramDetails } from '@verxioprotocol/core'
import { fromWeb3JsKeypair } from '@metaplex-foundation/umi-web3js-adapters'
import { Keypair as Web3JsKeypair } from '@solana/web3.js'

export function createServerContextWithFeePayer(collectionAddress: string, network: Network, feePayer: string) {
  const serverContext = createServerProgram(collectionAddress, collectionAddress, network)
  const signer = fromWeb3JsKeypair(Web3JsKeypair.fromSecretKey(Uint8Array.from(feePayer)))
  serverContext.umi.use(keypairIdentity(signer))

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
