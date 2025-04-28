'use server'

import prisma from '@/lib/prisma'
import { CreateRaffleData, RaffleFilter } from '@/types/raffle'
import { cache } from 'react'

export const getRaffles = cache(async (filter: RaffleFilter) => {
  try {
    const { status, programId, creator } = filter

    const raffles = await prisma.raffle.findMany({
      where: {
        ...(status && { status }),
        ...(programId && { programAddress: programId }),
        ...(creator && { creator }),
      },
      include: {
        winners: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Get eligible participants count for each raffle
    const rafflesWithParticipants = await Promise.all(
      raffles.map(async (raffle) => {
        const passes = await prisma.loyaltyPass.findMany({
          where: {
            collection: raffle.programAddress,
            ...(raffle.minTier ? { tier: { gte: raffle.minTier } } : {}),
          },
        })
        return {
          ...raffle,
          eligibleParticipants: passes.length,
        }
      }),
    )

    return rafflesWithParticipants
  } catch (error) {
    console.error('Error fetching raffles:', error)
    throw new Error('Failed to fetch raffles')
  }
})

export const getRaffleById = cache(async (id: string) => {
  try {
    const raffle = await prisma.raffle.findUnique({
      where: { id },
      include: {
        winners: true,
      },
    })

    if (!raffle) {
      throw new Error('Raffle not found')
    }

    return raffle
  } catch (error) {
    console.error('Error fetching raffle:', error)
    throw new Error('Failed to fetch raffle')
  }
})

export const createRaffle = cache(async (data: CreateRaffleData) => {
  try {
    // Validate dates
    const now = new Date()
    if (new Date(data.startDate) < now) {
      throw new Error('Start date must be in the future')
    }
    if (new Date(data.endDate) <= new Date(data.startDate)) {
      throw new Error('End date must be after start date')
    }
    if (new Date(data.drawDate) <= new Date(data.endDate)) {
      throw new Error('Draw date must be after end date')
    }

    const raffle = await prisma.raffle.create({
      data: {
        name: data.name,
        description: data.description,
        prizeType: data.prizeType,
        prizeDetails: data.prizeDetails as any,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        drawDate: new Date(data.drawDate),
        status: data.status || 'UPCOMING',
        entryCost: data.entryCost,
        minTier: data.minTier,
        numWinners: data.numWinners,
        programAddress: data.programAddress,
        creator: data.creator || '',
      },
    })

    return raffle
  } catch (error) {
    console.error('Error creating raffle:', error)
    throw new Error('Failed to create raffle')
  }
})
