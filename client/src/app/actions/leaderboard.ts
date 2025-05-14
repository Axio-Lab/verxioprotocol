'use server'

import prisma from '@/lib/prisma'
import { createServerProgram, Network } from '@/lib/methods/serverProgram'
import { getAssetData } from '@verxioprotocol/core'
import { publicKey } from '@metaplex-foundation/umi'
import { unstable_cache as cache } from 'next/cache'

export interface LeaderboardMember {
  address: string
  totalXp: number
  lastAction: string | null
  rank: number
}

export const getLeaderboard = cache(async (creator: string, network: string): Promise<LeaderboardMember[]> => {
  try {
    if (!creator) {
      throw new Error('Creator address is required')
    }

    if (!network) {
      throw new Error('Network is required')
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
          (acc: Record<string, typeof passes>, pass: { recipient: string; publicKey: string }) => {
            if (!acc[pass.recipient]) {
              acc[pass.recipient] = []
            }
            acc[pass.recipient].push(pass)
            return acc
          },
          {} as Record<string, typeof passes>,
        ),
      ).map(async ([address, memberPasses]: [string, typeof passes]) => {
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

    return sortedMembers
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    throw new Error('Failed to fetch leaderboard')
  }
})
