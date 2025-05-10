import { NextResponse } from 'next/server'
import { getVerxioPass } from '@/lib/methods/serverContext'
import { Network } from '@/lib/network-context'
import { publicKey } from '@metaplex-foundation/umi'
import { createImageLoyaltyPass } from '@/lib/methods/createImageLoyaltyPass'

export async function GET(request: Request, { params }: { params: Promise<{ pass: string }> }) {
  try {
    const { searchParams } = new URL(request.url)
    const network = searchParams.get('network')
    const { pass: passAddress } = await params

    if (!network) {
      return NextResponse.json({ error: 'Network is required', code: 'NETWORK_REQUIRED' }, { status: 400 })
    }

    // Get pass data using read-only context
    const passData = await getVerxioPass(passAddress, network as Network, publicKey(passAddress))

    if (!passData) {
      return NextResponse.json({ error: 'Pass not found', code: 'PASS_NOT_FOUND' }, { status: 404 })
    }

    // Generate the image
    const image = await createImageLoyaltyPass(passData)

    if (!image) {
      return NextResponse.json({ error: 'Failed to generate image', code: 'IMAGE_GENERATION_ERROR' }, { status: 500 })
    }

    // Return the image with appropriate headers
    return new NextResponse(image, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-store, no-cache, must-revalidate, private, max-age=0, s-maxage=0, proxy-revalidate',
      },
    })
  } catch (error) {
    console.error(`Error generating loyalty pass image for address ${(await params).pass}:`, error)
    return NextResponse.json(
      { error: 'Error generating loyalty pass image', code: 'LOYALTY_PASS_IMAGE_ERROR' },
      { status: 500 },
    )
  }
}
