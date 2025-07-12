'use server'

import { convertSecretKeyToKeypair } from './utils'

export async function getKeypair() {
  try {
    const keypair = convertSecretKeyToKeypair(process.env.SECRET_KEY as string)
    return {
      keypair,
      success: true
    }
  } catch (error) {
    console.error('Error creating keypair:', error)
    return {
      keypair: null,
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create keypair'
    }
  }
} 