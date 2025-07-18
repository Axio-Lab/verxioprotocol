import { NextResponse } from 'next/server'
import { getVerxioProgram } from '@/lib/methods/serverContext'
import { Network } from '@/lib/network-context'
import { publicKey } from '@metaplex-foundation/umi'

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

    return NextResponse.json({ data: programData })
  } catch (error) {
    console.error(`Error getting program for address ${(await params).program}:`, error)
    return NextResponse.json({ error: 'Error getting program', code: 'PROGRAM_ERROR' }, { status: 500 })
  }
}
