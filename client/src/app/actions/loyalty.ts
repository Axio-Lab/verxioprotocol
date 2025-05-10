'use server'

import prisma from '@/lib/prisma'
import { createServerProgram, Network } from '@/lib/methods/serverProgram'
import { getAssetData } from '@verxioprotocol/core'
import { publicKey } from '@metaplex-foundation/umi'
import { getProgramNetwork } from '@/lib/methods/getProgramNetwork'
import { getImageFromMetadata } from '@/lib/getImageFromMetadata'
import { cache } from 'react'

export interface PassWithImage {
  details: {
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
    name: string
    uri: string
    owner: string
    pass: string
    metadata: {
      organizationName: string
      brandColor?: string
      [key: string]: any
    }
    rewardTiers: Array<{
      name: string
      xpRequired: number
      rewards: string[]
    }>
  }
  bannerImage?: string
}

export const getLoyaltyPasses = cache(async (recipient: string, network: string): Promise<PassWithImage[]> => {
  try {
    if (!recipient) {
      throw new Error('Recipient address is required')
    }

    if (!network) {
      throw new Error('Network is required')
    }

    // First, get passes from database
    const dbPasses = await prisma.loyaltyPass.findMany({
      where: {
        recipient: recipient,
        network: network as Network,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Then fetch asset data and images for each pass
    const passesWithDetails = await Promise.all(
      dbPasses.map(async (pass: { recipient: string; publicKey: string }) => {
        try {
          // Create server context for this pass
          const context = createServerProgram(pass.recipient, pass.publicKey, network as Network)
          const details = await getAssetData(context, publicKey(pass.publicKey))

          if (!details) {
            return null
          }

          // Fetch image if URI exists
          let bannerImage: string | undefined
          if (details.uri) {
            bannerImage = await getImageFromMetadata(details.uri)
          }

          const passWithImage: PassWithImage = {
            details: {
              xp: details.xp,
              lastAction: details.lastAction,
              actionHistory: details.actionHistory,
              currentTier: details.currentTier,
              tierUpdatedAt: details.tierUpdatedAt,
              rewards: details.rewards,
              name: details.name,
              uri: details.uri,
              owner: details.owner,
              pass: pass.publicKey,
              metadata: details.metadata,
              rewardTiers: details.rewardTiers,
            },
            bannerImage,
          }
          return passWithImage
        } catch (error) {
          console.error(`Error fetching details for pass ${pass.publicKey}:`, error)
          return null
        }
      }),
    )

    // Filter out null values and return valid passes
    return passesWithDetails.filter((pass: PassWithImage | null): pass is PassWithImage => pass !== null)
  } catch (error) {
    console.error('Error fetching loyalty passes:', error)
    throw new Error('Failed to fetch loyalty passes')
  }
})

export const getPassDetails = cache(async (passId: string) => {
  try {
    if (!passId) {
      throw new Error('Pass ID is required')
    }

    // Get the pass details from our database
    const pass = await prisma.loyaltyPass.findFirst({
      where: {
        publicKey: passId,
      },
    })

    if (!pass) {
      throw new Error('Pass not found')
    }

    // Get the program's network from the database
    const network = await getProgramNetwork(pass.collection)
    if (!network) {
      throw new Error('Program not found')
    }

    // Create server context for this program
    const context = createServerProgram(
      pass.collection, // Using collection as both authority and collection address
      pass.collection,
      network as Network,
    )

    // Get pass details using the context
    const details = await getAssetData(context, publicKey(passId))

    if (!details) {
      throw new Error('Failed to fetch pass details')
    }

    // Fetch image if URI exists
    let bannerImage: string | undefined
    if (details.uri) {
      bannerImage = await getImageFromMetadata(details.uri)
    }

    return {
      ...details,
      network,
      bannerImage,
    }
  } catch (error) {
    console.error('Error fetching pass details:', error)
    throw new Error('Failed to fetch pass details')
  }
})

export const storeLoyaltyPass = cache(
  async (data: {
    collection: string
    recipient: string
    publicKey: string
    privateKey: string
    signature: string
    network: string
  }) => {
    try {
      const { collection, recipient, publicKey, privateKey, signature, network } = data

      const pass = await prisma.loyaltyPass.create({
        data: {
          collection,
          recipient,
          publicKey,
          privateKey,
          signature,
          network,
        },
      })

      return pass
    } catch (error) {
      console.error('Error storing loyalty pass:', error)
      throw new Error('Failed to store loyalty pass')
    }
  },
)

export const getPassCollection = cache(async (passAddress: string) => {
  try {
    if (!passAddress) {
      throw new Error('Pass address is required')
    }

    const pass = await prisma.loyaltyPass.findFirst({
      where: {
        publicKey: passAddress,
      },
      select: {
        collection: true,
      },
    })

    if (!pass) {
      throw new Error('Pass not found')
    }

    return pass.collection
  } catch (error) {
    console.error('Error getting pass collection:', error)
    throw new Error('Failed to get pass collection')
  }
})
