'use server'

import prisma from '@/lib/prisma'
import { createServerProgram, Network } from '@/lib/methods/serverProgram'
import { getAssetData, getProgramDetails as getProgramDetailsCore } from '@verxioprotocol/core'
import { publicKey } from '@metaplex-foundation/umi'
import { getProgramNetwork } from '@/lib/methods/getProgramNetwork'
import { cache } from 'react'

export interface ProgramStats {
  totalPrograms: string
  activePasses: string
  totalMembers: string
  totalPoints: string
}

export interface MemberPass {
  publicKey: string
  name: string
  xp: number
  lastAction: string | null
  actionHistory: Array<{
    type: string
    points: number
    timestamp: number
    newTotal: number
  }>
  currentTier: string
  tierUpdatedAt: number
  rewards: string[]
}

export interface Member {
  address: string
  passes: MemberPass[]
  totalXp: number
}

export interface ProgramMetadata {
  organizationName: string
  brandColor: string
}

export interface ProgramDetails {
  collectionAddress: string
  creator: string
  metadata: ProgramMetadata
  name: string
  numMinted: number
  pointsPerAction: Record<string, number>
  tiers: any[]
  transferAuthority: string
  updateAuthority: string
  uri: string
  network: string
  feeAddress: string
}

export interface ProgramWithDetails {
  details: ProgramDetails
}

export const getProgramStats = cache(async (creator: string, network: string): Promise<ProgramStats> => {
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
          in: programs.map((program) => program.publicKey),
        },
        network: network,
      },
      select: {
        recipient: true,
        publicKey: true,
      },
    })

    // Calculate basic statistics
    const totalPrograms = programs.length
    const activePasses = passes.length
    const uniqueHolders = new Set(passes.map((pass) => pass.recipient)).size

    // Calculate total XP from all passes
    let totalPoints = 0
    const passesWithXP = await Promise.all(
      passes.map(async (pass) => {
        try {
          const context = createServerProgram(creator, pass.publicKey, network as Network)
          const details = await getAssetData(context, publicKey(pass.publicKey))
          return details?.xp || 0
        } catch (error) {
          console.error(`Error fetching XP for pass ${pass.publicKey}:`, error)
          return 0
        }
      }),
    )
    totalPoints = passesWithXP.reduce((sum, xp) => sum + xp, 0)

    // Format total points
    const formatStat = (points: number): string => {
      if (points >= 1000000) {
        const millions = points / 1000000
        return `${millions.toFixed(1)} million`
      } else if (points >= 1000) {
        return points.toLocaleString()
      }
      return points.toString()
    }

    return {
      totalPrograms: formatStat(totalPrograms),
      activePasses: formatStat(activePasses),
      totalMembers: formatStat(uniqueHolders),
      totalPoints: formatStat(totalPoints),
    }
  } catch (error) {
    console.error('Error fetching program stats:', error)
    throw new Error('Failed to fetch program stats')
  }
})

export const getProgramDetails = cache(async (programId: string): Promise<ProgramDetails> => {
  try {
    if (!programId) {
      throw new Error('Program ID is required')
    }

    // Get the program's network from the database
    const network = await getProgramNetwork(programId)
    if (!network) {
      throw new Error('Program not found')
    }

    // Create server context for this program
    const context = createServerProgram(programId, programId, network as Network)

    // Get program details using the context
    const details = await getProgramDetailsCore(context)
    if (!details) {
      throw new Error('Failed to fetch program details')
    }

    // Get fee payer from database
    const program = await prisma.loyaltyProgram.findFirst({
      where: {
        publicKey: programId,
      },
      select: {
        feePayerPublic: true,
      },
    })

    return {
      ...details,
      network: network,
      feeAddress: program?.feePayerPublic || '',
      metadata: {
        ...details.metadata,
        brandColor: details.metadata?.brandColor || '#000000',
      },
    }
  } catch (error) {
    console.error('Error fetching program details:', error)
    throw new Error('Failed to fetch program details')
  }
})

export const getPrograms = cache(async (creator: string, network: string): Promise<ProgramWithDetails[]> => {
  try {
    if (!creator) {
      throw new Error('Creator address is required')
    }

    if (!network) {
      throw new Error('Network is required')
    }

    // First, get programs from database
    const dbPrograms = await prisma.loyaltyProgram.findMany({
      where: {
        creator: creator,
        network: network,
      },
      select: {
        publicKey: true,
        feePayerPublic: true,
        creator: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Then fetch program details for each program
    const programsWithDetails = await Promise.all(
      dbPrograms.map(async (program) => {
        try {
          const context = createServerProgram(program.creator, program.publicKey, network as Network)
          const details = await getProgramDetailsCore(context)

          if (!details) {
            throw new Error('Failed to fetch program details')
          }

          const programDetails: ProgramDetails = {
            name: details.name || '',
            uri: details.uri || '',
            collectionAddress: program.publicKey,
            updateAuthority: details.updateAuthority || program.creator,
            numMinted: details.numMinted || 0,
            transferAuthority: details.transferAuthority || program.creator,
            creator: program.creator,
            tiers: details.tiers || [],
            pointsPerAction: details.pointsPerAction || {},
            metadata: {
              organizationName: details.metadata?.organizationName || '',
              brandColor: details.metadata?.brandColor || '#000000',
            },
            network: network,
            feeAddress: program.feePayerPublic || '',
          }

          return { details: programDetails }
        } catch (error) {
          console.error(`Error fetching details for program ${program.publicKey}:`, error)
          throw new Error('Failed to fetch program details')
        }
      }),
    )

    return programsWithDetails
  } catch (error) {
    console.error('Error fetching programs:', error)
    throw new Error('Failed to fetch programs')
  }
})

export const getProgramMembers = cache(async (creator: string, network: string): Promise<Member[]> => {
  try {
    if (!creator) {
      throw new Error('Creator address is required')
    }

    if (!network) {
      throw new Error('Valid network is required')
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
          in: programs.map((program) => program.publicKey),
        },
        network: network,
      },
      select: {
        recipient: true,
        publicKey: true,
      },
    })

    // Group passes by recipient
    const passesByRecipient = passes.reduce(
      (acc, pass) => {
        if (!acc[pass.recipient]) {
          acc[pass.recipient] = []
        }
        acc[pass.recipient].push(pass)
        return acc
      },
      {} as Record<string, typeof passes>,
    )

    // Get detailed pass information for each member
    const members: Member[] = await Promise.all(
      Object.entries(passesByRecipient).map(async ([address, memberPasses]) => {
        const passesWithDetails = await Promise.all(
          memberPasses.map(async (pass) => {
            try {
              const context = createServerProgram(creator, pass.publicKey, network as Network)
              const details = await getAssetData(context, publicKey(pass.publicKey))
              if (!details) return null

              return {
                publicKey: pass.publicKey,
                name: details.name,
                xp: details.xp,
                actionHistory: details.actionHistory,
                currentTier: details.currentTier,
              }
            } catch (error) {
              console.error(`Error fetching details for pass ${pass.publicKey}:`, error)
              return null
            }
          }),
        )

        const validPasses = passesWithDetails.filter((pass): pass is MemberPass => pass !== null)
        const totalXp = validPasses.reduce((sum, pass) => sum + pass.xp, 0)

        return {
          address,
          passes: validPasses,
          totalXp,
        }
      }),
    )

    // Sort members by total XP
    return members.sort((a, b) => b.totalXp - a.totalXp)
  } catch (error) {
    console.error('Error fetching program members:', error)
    throw new Error('Failed to fetch program members')
  }
})

export const storeLoyaltyProgram = cache(
  async (data: {
    creator: string
    publicKey: string
    privateKey: string
    signature: string
    network: string
    feePayerPrivate: string
    feePayerPublic: string
  }) => {
    try {
      const { creator, publicKey, privateKey, signature, network, feePayerPrivate, feePayerPublic } = data

      const program = await prisma.loyaltyProgram.create({
        data: {
          creator,
          publicKey,
          privateKey,
          signature,
          network,
          feePayerPrivate,
          feePayerPublic,
        },
      })

      return program
    } catch (error) {
      console.error('Error storing loyalty program:', error)
      throw new Error('Failed to store loyalty program')
    }
  },
)

export const getFeePayerAccount = cache(async (programAddress: string): Promise<string> => {
  try {
    if (!programAddress) {
      throw new Error('Program address is required')
    }

    const program = await prisma.loyaltyProgram.findFirst({
      where: {
        publicKey: programAddress,
      },
      select: {
        feePayerPrivate: true,
      },
    })

    if (!program) {
      throw new Error('Program not found')
    }

    return program.feePayerPrivate
  } catch (error) {
    console.error('Error getting fee payer account:', error)
    throw new Error('Failed to get fee payer account')
  }
})
