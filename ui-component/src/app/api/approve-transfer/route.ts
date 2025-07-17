import { NextRequest, NextResponse } from 'next/server'
import { initializeVerxio, approveTransfer } from '@verxioprotocol/core'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { keypairIdentity, publicKey } from '@metaplex-foundation/umi'
import { convertSecretKeyToKeypair } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { collectionAddress, passAddress, newOwner } = body

    // Create signer from environment variable
    const secretKey = process.env.SECRET_KEY
    if (!secretKey) {
      return NextResponse.json({ error: 'Secret key not configured' }, { status: 500 })
    }

    const keypair = convertSecretKeyToKeypair(secretKey)
    const umi = createUmi('https://api.devnet.solana.com')
    umi.use(keypairIdentity(keypair))

    // Initialize Verxio context
    const context = initializeVerxio(umi, publicKey(keypair.publicKey.toString()))

    // Call the protocol function with correct arguments
    await approveTransfer(context, publicKey(passAddress), publicKey(newOwner))

    return NextResponse.json({
      success: true,
      message: 'Transfer approved successfully',
    })
  } catch (error) {
    console.error('Error approving transfer:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 },
    )
  }
}
