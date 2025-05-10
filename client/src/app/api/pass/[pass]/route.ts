import { NextResponse } from 'next/server'
import { getVerxioPass } from '@/lib/methods/serverContext'
import { Network } from '@/lib/network-context'
import { publicKey } from '@metaplex-foundation/umi'

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

    return NextResponse.json({ data: passData })
  } catch (error) {
    console.error(`Error getting loyalty pass for address ${(await params).pass}:`, error)
    return NextResponse.json({ error: 'Error getting loyalty pass', code: 'LOYALTY_PASS_ERROR' }, { status: 500 })
  }
}
