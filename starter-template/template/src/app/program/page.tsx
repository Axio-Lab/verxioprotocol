'use client'

import CreateLoyaltyProgramForm from '@/components/verxio/CreateLoyaltyProgramForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { VerxioContext, initializeVerxio } from '@verxioprotocol/core'
import { KeypairSigner } from '@metaplex-foundation/umi'
import { useWallet } from '@solana/wallet-adapter-react'
import { useEffect, useState } from 'react'
import { getKeypair } from '@/lib/actions'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { createSignerFromWalletAdapter } from '@metaplex-foundation/umi-signer-wallet-adapters'
import { signerIdentity, createSignerFromKeypair } from '@metaplex-foundation/umi'

interface CreateLoyaltyProgramResult {
  collection: KeypairSigner
  signature: string
  updateAuthority?: KeypairSigner
}

export default function ProgramPage() {
  const { wallet, connected } = useWallet()
  const [context, setContext] = useState<VerxioContext | null>(null)
  const [signer, setSigner] = useState<KeypairSigner | null>(null)

  useEffect(() => {
    async function initializeContext() {
      if (!wallet?.adapter) return

      try {
        const result = await getKeypair()
        if (!result.success || !result.keypair) {
          console.error('Failed to get keypair:', result.error)
          return
        }

        const umi = createUmi('https://api.devnet.solana.com')
        const newSigner = createSignerFromKeypair(umi, result.keypair)

        // Set up wallet signer
        const walletSigner = createSignerFromWalletAdapter(wallet.adapter)
        umi.use(signerIdentity(walletSigner))
        
        const newContext = initializeVerxio(umi, newSigner.publicKey)
        setContext(newContext)
        setSigner(newSigner)
      } catch (error) {
        console.error('Error initializing context:', error)
      }
    }

    initializeContext()
  }, [wallet])

  const handleSuccess = (result: CreateLoyaltyProgramResult) => {
    console.log('Program created:', result)
  }

  if (!connected) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Create Loyalty Program</h1>
          <Link href="/">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-gray-400">Please connect your wallet to continue</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!context || !signer) {
    return null
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Create Loyalty Program</h1>
        <Link href="/">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Program Details</CardTitle>
          <CardDescription>
            Create a new loyalty program for your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateLoyaltyProgramForm
            context={context}
            signer={signer}
            onSuccess={handleSuccess}
            onError={(error: Error) => console.error('Error creating program:', error)}
          />
        </CardContent>
      </Card>
    </div>
  )
} 