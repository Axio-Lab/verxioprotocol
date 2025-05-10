import { NextResponse } from 'next/server'
import { getLeaderboard } from '@/lib/methods/getLeaderboard'
import { Network } from '@/lib/network-context'
import { createImageLeaderboard } from '@/lib/methods/createImageLeaderboard'

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

    // Get custom images from query params
    const backgroundImage = searchParams.get('backgroundImage') || undefined
    const headerImage = searchParams.get('headerImage') || undefined
    const defaultAvatar = searchParams.get('defaultAvatar') || undefined

    // Generate leaderboard image
    const image = await createImageLeaderboard({
      collectionName: leaderboard.programName,
      totalMinted: leaderboard.totalMinted,
      totalMembers: leaderboard.totalMembers,
      members: leaderboard.members,
      backgroundImage,
      headerImage,
      defaultAvatar,
    })

    if (!image) {
      return NextResponse.json(
        { error: 'Failed to generate leaderboard image', code: 'IMAGE_GENERATION_FAILED' },
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
    console.error(`Error generating leaderboard image for program ${(await params).program}:`, error)
    return NextResponse.json(
      { error: 'Error generating leaderboard image', code: 'LEADERBOARD_IMAGE_ERROR' },
      { status: 500 },
    )
  }
}
