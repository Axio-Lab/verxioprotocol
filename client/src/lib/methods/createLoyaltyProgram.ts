import { createLoyaltyProgram } from '@verxioprotocol/core'
import { initializeVerxioProgram } from './initializeProgram'

export interface Tier {
  name: string
  xpRequired: number
  rewards: string[]
}

export interface CreateLoyaltyProgramParams {
  organizationName: string
  metadataUri: string
  tiers: Tier[]
  pointsPerAction: Record<string, number>
}

export const createNewLoyaltyProgram = async (params: CreateLoyaltyProgramParams) => {
  const context = initializeVerxioProgram()

  if (!context) {
    throw new Error('Failed to initialize Verxio program')
  }

  try {
    const result = await createLoyaltyProgram(context, {
      ...params,
      programAuthority: context.programAuthority,
    })

    return result
  } catch (error) {
    console.error('Error creating loyalty program:', error)
    throw error
  }
}
