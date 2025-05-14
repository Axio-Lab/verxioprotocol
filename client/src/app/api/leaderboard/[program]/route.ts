import { NextResponse } from 'next/server'
import { getLeaderboard } from '@/lib/methods/getLeaderboard'
import { Network } from '@/lib/network-context'

export async function GET(request: Request, { params }: { params: Promise<{ program: string }> }) {
  try {
    const { searchParams } = new URL(request.url)
    const network = searchParams.get('network')
    const { program: programAddress } = await params

    if (!network) {
      return NextResponse.json({ error: 'Network is required', code: 'NETWORK_REQUIRED' }, { status: 400 })
    }

    // Get leaderboard data
    const leaderboard = await getLeaderboard(programAddress, network as Network)

    if (!leaderboard) {
      return NextResponse.json({ error: 'Leaderboard not found', code: 'LEADERBOARD_NOT_FOUND' }, { status: 404 })
    }

    return NextResponse.json({ data: leaderboard })
  } catch (error) {
    console.error(`Error getting leaderboard for program ${(await params).program}:`, error)
    return NextResponse.json({ error: 'Error getting leaderboard', code: 'LEADERBOARD_ERROR' }, { status: 500 })
  }
}
