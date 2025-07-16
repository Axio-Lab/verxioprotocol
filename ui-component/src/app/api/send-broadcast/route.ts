import { NextRequest, NextResponse } from 'next/server'
import { initializeVerxio, sendBroadcast } from '@verxioprotocol/core'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { keypairIdentity, publicKey, createSignerFromKeypair } from '@metaplex-foundation/umi'
import { convertSecretKeyToKeypair } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { collectionAddress, message } = body

    // Create signer from environment variable
    const secretKey = process.env.SECRET_KEY
    if (!secretKey) {
      return NextResponse.json({ error: 'Secret key not configured' }, { status: 500 })
    }

    const keypair = convertSecretKeyToKeypair(secretKey)
    const umi = createUmi('https://api.devnet.solana.com')
    umi.use(keypairIdentity(keypair))

    // Create proper signer from keypair
    const signer = createSignerFromKeypair(umi, keypair)

    // Initialize Verxio context
    const context = initializeVerxio(umi, publicKey(keypair.publicKey.toString()))

    // Prepare config for sendBroadcast
    const broadcastData = {
      collectionAddress: publicKey(collectionAddress),
      message,
      sender: context.programAuthority,
      signer,
    }

    // Call the protocol function
    const result = await sendBroadcast(context, broadcastData)

    return NextResponse.json({ 
      success: true, 
      result,
      signature: result.signature
    })

  } catch (error) {
    console.error('Error sending broadcast:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }, { status: 500 })
  }
} 