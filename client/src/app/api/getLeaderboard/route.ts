import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createServerProgram, Network } from '@/lib/methods/serverProgram'
import { getAssetData } from '@verxioprotocol/core'
import { publicKey } from '@metaplex-foundation/umi'

interface LeaderboardMember {
  address: string
  totalXp: number
  lastAction: string | null
  rank: number
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const creator = searchParams.get('creator')
    const network = searchParams.get('network')

    if (!creator) {
      return NextResponse.json({ error: 'Creator address is required' }, { status: 400 })
    }

    if (!network) {
      return NextResponse.json({ error: 'Network is required' }, { status: 400 })
    }

    // Get all programs created by the user
    const programs = await prisma.loyaltyProgram.findMany({
      where: {
        creator: creator,
        network: network,
      },
      select: {
        publicKey: true,
      },
    })

    // Get all passes associated with these programs
    const passes = await prisma.loyaltyPass.findMany({
      where: {
        collection: {
          in: programs.map((program: { publicKey: string }) => program.publicKey),
        },
        network: network,
      },
      select: {
        recipient: true,
        publicKey: true,
      },
    })

    // Group passes by recipient and calculate total XP
    const members: LeaderboardMember[] = await Promise.all(
      Object.entries(
        passes.reduce(
          (acc, pass) => {
            if (!acc[pass.recipient]) {
              acc[pass.recipient] = []
            }
            acc[pass.recipient].push(pass)
            return acc
          },
          {} as Record<string, typeof passes>,
        ),
      ).map(async ([address, memberPasses]) => {
        let totalXp = 0
        let lastAction: string | null = null

        // Get XP and last action for each pass
        for (const pass of memberPasses) {
          try {
            const context = createServerProgram(creator, pass.publicKey, network as Network)
            const details = await getAssetData(context, publicKey(pass.publicKey))
            if (details) {
              totalXp += details.xp
              if (details.lastAction && (!lastAction || details.lastAction > lastAction)) {
                lastAction = details.lastAction
              }
            }
          } catch (error) {
            console.error(`Error fetching details for pass ${pass.publicKey}:`, error)
          }
        }

        return {
          address,
          totalXp,
          lastAction,
          rank: 0, // Will be set after sorting
        }
      }),
    )

    // Sort members by total XP in descending order
    const sortedMembers = members.sort((a, b) => b.totalXp - a.totalXp)

    // Assign ranks
    sortedMembers.forEach((member, index) => {
      member.rank = index + 1
    })

    return NextResponse.json(sortedMembers)
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 })
  }
}
