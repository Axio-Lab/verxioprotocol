import { NextRequest, NextResponse } from 'next/server'
import { initializeVerxio, createVoucherCollection } from '@verxioprotocol/core'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { irysUploader } from '@metaplex-foundation/umi-uploader-irys'
import { keypairIdentity, publicKey } from '@metaplex-foundation/umi'
import { convertSecretKeyToKeypair } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      voucherCollectionName, 
      metadataUri, 
      imageBuffer, 
      imageFilename, 
      imageContentType, 
      description, 
      metadata 
    } = body

    // Create signer from environment variable
    const secretKey = process.env.SECRET_KEY
    if (!secretKey) {
      return NextResponse.json({ error: 'Secret key not configured' }, { status: 500 })
    }

    const signer = convertSecretKeyToKeypair(secretKey)
    const umi = createUmi('https://api.devnet.solana.com')
    umi.use(keypairIdentity(signer))
    // Create UMI instance with Irys uploader
    umi.use(irysUploader())

    // Initialize Verxio context
    const context = initializeVerxio(umi, publicKey(signer.publicKey.toString()))

    // Prepare config for createVoucherCollection
    const config: any = {
      voucherCollectionName,
      programAuthority: context.programAuthority,
      updateAuthority: signer,
      metadata: {
        merchantName: metadata.merchantName,
        merchantAddress: metadata.merchantAddress,
        voucherTypes: metadata.voucherTypes,
      },
      description: `Voucher collection for ${metadata.merchantName}`,
    }

    // Handle image upload or use metadata URI
    if (metadataUri) {
      config.metadataUri = metadataUri
    } else if (imageBuffer && imageFilename && imageContentType) {
      // Convert base64 buffer back to Buffer
      const buffer = Buffer.from(imageBuffer, 'base64')
      config.imageBuffer = buffer
      config.imageFilename = imageFilename
      config.imageContentType = imageContentType
    } else {
      return NextResponse.json({ error: 'Either metadata URI or image file must be provided' }, { status: 400 })
    }

    // Call the protocol function
    const result = await createVoucherCollection(context, config)

    return NextResponse.json({ 
      success: true, 
      result,
      signature: result.signature,
      collection: {
        publicKey: result.collection.publicKey,
      }
    })

  } catch (error) {
    console.error('Error creating voucher collection:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }, { status: 500 })
  }
} 