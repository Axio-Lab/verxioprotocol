'use server'

import prisma from '@/lib/prisma'
import { cache } from 'react'

export const getAssetSigner = cache(async (publicKey: string) => {
  try {
    if (!publicKey) {
      throw new Error('Missing or invalid publicKey')
    }

    const pass = await prisma.loyaltyPass.findFirst({
      where: { publicKey },
    })

    if (!pass) {
      throw new Error('Loyalty pass not found')
    }

    return {
      privateKey: pass.privateKey,
      collection: pass.collection,
    }
  } catch (error) {
    console.error('Error getting asset signer:', error)
    throw new Error('Failed to get asset signer')
  }
})

export const getProgramSigner = cache(async (publicKey: string) => {
  try {
    if (!publicKey) {
      throw new Error('Missing or invalid publicKey')
    }

    const program = await prisma.loyaltyProgram.findFirst({
      where: { publicKey },
    })

    if (!program) {
      throw new Error('Loyalty program not found')
    }

    return {
      privateKey: program.privateKey,
      publicKey: program.publicKey,
    }
  } catch (error) {
    console.error('Error getting program signer:', error)
    throw new Error('Failed to get program signer')
  }
})
