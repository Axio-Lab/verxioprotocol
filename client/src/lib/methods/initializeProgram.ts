import { initializeVerxio } from '@verxioprotocol/core'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { publicKey } from '@metaplex-foundation/umi'
import { walletAdapterIdentity } from '@metaplex-foundation/umi-signer-wallet-adapters'
import { useWallet } from '@solana/wallet-adapter-react'
import { toast } from 'sonner'

export const initializeVerxioProgram = () => {
  const wallet = useWallet()
  const DEVNET_RPC_URL = 'https://api.devnet.solana.com'
  const MAINNET_RPC_URL = 'https://api.mainnet-beta.solana.com'
  const umi = createUmi(DEVNET_RPC_URL)

  if (!wallet.publicKey) {
    toast.error('Please connect your wallet first')
    return null
  }

  // Initialize program with wallet as authority
  const context = initializeVerxio(umi, publicKey(wallet.publicKey.toString()))

  // Set Signer
  context.umi.use(walletAdapterIdentity(wallet))

  return context
}
