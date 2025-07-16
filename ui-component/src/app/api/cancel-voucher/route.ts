import { NextRequest, NextResponse } from 'next/server'
import { initializeVerxio, cancelVoucher } from '@verxioprotocol/core'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { keypairIdentity, publicKey, generateSigner } from '@metaplex-foundation/umi'
import { convertSecretKeyToKeypair } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { voucherAddress, reason } = body

    // Create signer from environment variable
    const secretKey = process.env.SECRET_KEY
    if (!secretKey) {
      return NextResponse.json({ error: 'Secret key not configured' }, { status: 500 })
    }

    const signer = convertSecretKeyToKeypair(secretKey)
    const umi = createUmi('https://api.devnet.solana.com')
    umi.use(keypairIdentity(signer))

    // Initialize Verxio context
    const context = initializeVerxio(umi, publicKey(signer.publicKey.toString()))

    // Prepare config for cancelVoucher
    const config = {
      voucherAddress: publicKey(voucherAddress),
      reason,
      updateAuthority: generateSigner(context.umi),
    }

    // Call the protocol function
    const result = await cancelVoucher(context, config)

    return NextResponse.json({ 
      success: true, 
      result
    })

  } catch (error) {
    console.error('Error canceling voucher:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }, { status: 500 })
  }
} 