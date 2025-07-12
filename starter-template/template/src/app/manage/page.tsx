'use client'

import IssueLoyaltyPassForm from '@/components/verxio/IssueLoyaltyPassForm'
import GetAssetDataForm from '@/components/verxio/GetAssetDataForm'
import GetProgramDetailsForm from '@/components/verxio/GetProgramDetailsForm'
import GiftLoyaltyPointsForm from '@/components/verxio/GiftLoyaltyPointsForm'
import RevokeLoyaltyPointsForm from '@/components/verxio/RevokeLoyaltyPointsForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { VerxioContext, initializeVerxio } from '@verxioprotocol/core'
import { KeypairSigner } from '@metaplex-foundation/umi'
import { useWallet } from '@solana/wallet-adapter-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useEffect, useState } from 'react'
import { getKeypair } from '@/lib/actions'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { createSignerFromWalletAdapter } from '@metaplex-foundation/umi-signer-wallet-adapters'
import { signerIdentity, createSignerFromKeypair } from '@metaplex-foundation/umi'

export default function PointsPage() {
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

  if (!connected) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Loyalty Management</h1>
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
        <h1 className="text-3xl font-bold">Loyalty Management</h1>
        <Link href="/">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>

      <Tabs defaultValue="issue-pass" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="issue-pass">Issue Pass</TabsTrigger>
          <TabsTrigger value="gift-points">Gift Points</TabsTrigger>
          <TabsTrigger value="revoke-points">Revoke Points</TabsTrigger>
          <TabsTrigger value="asset-data">Asset Data</TabsTrigger>
          <TabsTrigger value="program-details">Program Details</TabsTrigger>
        </TabsList>

        <TabsContent value="issue-pass">
          <Card>
            <CardHeader>
              <CardTitle>Issue Loyalty Pass</CardTitle>
              <CardDescription>Create a new loyalty pass for a member</CardDescription>
            </CardHeader>
            <CardContent>
              <IssueLoyaltyPassForm
                context={context}
                signer={signer}
                onSuccess={(result) => {
                  console.log('Pass issued:', result)
                }}
                onError={(error) => console.error('Error issuing pass:', error)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gift-points">
          <Card>
            <CardHeader>
              <CardTitle>Gift Points</CardTitle>
              <CardDescription>Award points to existing members</CardDescription>
            </CardHeader>
            <CardContent>
              <GiftLoyaltyPointsForm
                context={context}
                signer={signer}
                onSuccess={(result) => {
                  console.log('Points gifted:', result)
                }}
                onError={(error) => console.error('Error gifting points:', error)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revoke-points">
          <Card>
            <CardHeader>
              <CardTitle>Revoke Points</CardTitle>
              <CardDescription>Remove points from a member</CardDescription>
            </CardHeader>
            <CardContent>
              <RevokeLoyaltyPointsForm
                context={context}
                signer={signer}
                onSuccess={(result) => {
                  console.log('Points revoked:', result)
                }}
                onError={(error) => console.error('Error revoking points:', error)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="asset-data">
          <Card>
            <CardHeader>
              <CardTitle>Get Asset Data</CardTitle>
              <CardDescription>View details of a loyalty pass</CardDescription>
            </CardHeader>
            <CardContent>
              <GetAssetDataForm
                context={context}
                onSuccess={(result) => {
                  console.log('Asset data:', result)
                }}
                onError={(error) => console.error('Error fetching asset data:', error)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="program-details">
          <Card>
            <CardHeader>
              <CardTitle>Program Details</CardTitle>
              <CardDescription>View your loyalty program details</CardDescription>
            </CardHeader>
            <CardContent>
              <GetProgramDetailsForm
                context={context}
                onSuccess={(result) => {
                  console.log('Program details:', result)
                }}
                onError={(error) => console.error('Error fetching program details:', error)}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 