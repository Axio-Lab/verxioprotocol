import { Keypair, publicKey, createSignerFromKeypair, keypairIdentity } from '@metaplex-foundation/umi'
import { fromWeb3JsKeypair } from '@metaplex-foundation/umi-web3js-adapters'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { Keypair as Web3JsKeypair } from '@solana/web3.js'
import { VerxioContext } from '@/schemas/verxio-context'
import { FIXTURE_FEE_PAYER } from '../fixtures/fee-payer'

export function getTestContext(config: { endpoint?: string } = {}): {
  context: VerxioContext
  feePayer: Keypair
} {
  const endpoint = config.endpoint ?? 'http://localhost:8899'
  const feePayerSolana = Web3JsKeypair.fromSecretKey(Uint8Array.from(FIXTURE_FEE_PAYER))
  const feePayer = fromWeb3JsKeypair(Web3JsKeypair.fromSecretKey(Uint8Array.from(FIXTURE_FEE_PAYER)))
  const programAuthority = publicKey(feePayerSolana.publicKey.toBase58())
  const umi = createUmi(endpoint, 'confirmed')

  return { context: { umi, programAuthority }, feePayer }
}

export function createContextWithFeePayer(baseContext: VerxioContext, feePayer: Keypair): VerxioContext {
  const newContext = { ...baseContext }
  newContext.umi.use(keypairIdentity(feePayer))
  return newContext
}
