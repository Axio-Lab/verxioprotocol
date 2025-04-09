import { awardLoyaltyPoints, revokeLoyaltyPoints } from '@verxioprotocol/core'
import { VerxioContext } from '@verxioprotocol/core'
import { publicKey } from '@metaplex-foundation/umi'

export interface AwardPointsParams {
  passAddress: string
  action: string
  signer: any // KeypairSigner from issueLoyaltyPass
  multiplier?: number // Optional: Point multiplier (default: 1)
}

export interface RevokePointsParams {
  passAddress: string
  pointsToRevoke: number
  signer: any // KeypairSigner from issueLoyaltyPass
}

export interface PointsResult {
  points: number // New total points
  signature: string // Transaction signature
}

export const awardPoints = async (context: VerxioContext, params: AwardPointsParams): Promise<PointsResult> => {
  try {
    const result = await awardLoyaltyPoints(context, {
      passAddress: publicKey(params.passAddress),
      action: params.action,
      signer: params.signer,
      multiplier: params.multiplier || 1,
    })

    return result
  } catch (error) {
    console.error('Error awarding loyalty points:', error)
    throw error
  }
}

export const revokePoints = async (context: VerxioContext, params: RevokePointsParams): Promise<PointsResult> => {
  try {
    const result = await revokeLoyaltyPoints(context, {
      passAddress: publicKey(params.passAddress),
      pointsToRevoke: params.pointsToRevoke,
      signer: params.signer,
    })

    return result
  } catch (error) {
    console.error('Error revoking loyalty points:', error)
    throw error
  }
}
