import { NextResponse } from 'next/server'
import { getVerxioProgram } from '@/lib/methods/serverContext'
import { Network } from '@/lib/network-context'
import { publicKey } from '@metaplex-foundation/umi'
import { createImageLoyaltyProgram } from '@/lib/methods/createImageLoyaltyProgram'

export async function GET(request: Request, { params }: { params: Promise<{ program: string }> }) {
  try {
    const { searchParams } = new URL(request.url)
    const network = searchParams.get('network')
    const { program: programAddress } = await params

    if (!network) {
      return NextResponse.json({ error: 'Network is required', code: 'NETWORK_REQUIRED' }, { status: 400 })
    }

    // Get program data using read-only context
    const programData = await getVerxioProgram(
      programAddress, // collectionAddress
      network as Network,
      publicKey(programAddress), // programAddress
    )

    if (!programData) {
      return NextResponse.json({ error: 'Program not found', code: 'PROGRAM_NOT_FOUND' }, { status: 404 })
    }

    // Generate program image
    const image = await createImageLoyaltyProgram(programData)

    if (!image) {
      return NextResponse.json(
        { error: 'Failed to generate program image', code: 'IMAGE_GENERATION_FAILED' },
        { status: 500 },
      )
    }

    // Return image with appropriate headers
    return new NextResponse(image, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-store, no-cache, must-revalidate, private, max-age=0, s-maxage=0, proxy-revalidate',
      },
    })
  } catch (error) {
    console.error(`Error generating program image for address ${(await params).program}:`, error)
    return NextResponse.json({ error: 'Error generating program image', code: 'PROGRAM_IMAGE_ERROR' }, { status: 500 })
  }
}
