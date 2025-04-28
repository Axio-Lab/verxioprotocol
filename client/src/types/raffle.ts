export type PrizeType = 'TOKEN' | 'MERCH' | 'NFT' | 'OTHER'

// USDC Token Supported
// 'MERCH' | 'NFT' | 'OTHER' --Coming Soon

export type RaffleStatus = 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'

export interface PrizeDetails {
  token?: {
    amount: number
    mint: string
  }
  merch?: {
    description: string
    shippingInfo: string
  }
  nft?: {
    collection: string
    name: string
  }
  other?: {
    description: string
  }
}

export interface Raffle {
  id: string
  name: string
  description: string
  prizeType: PrizeType
  prizeDetails: PrizeDetails
  startDate: Date
  endDate: Date
  drawDate: Date
  status: RaffleStatus
  entryCost?: number
  minTier?: string
  numWinners: number
  programAddress: string
  creator: string
  createdAt: Date
  updatedAt: Date
  eligibleParticipants?: number
  winners?: RaffleWinner[]
}

export interface RaffleWinner {
  id: string
  raffleId: string
  passPublicKey: string
  position: number
  claimed: boolean
  claimedAt?: Date
}

export interface CreateRaffleData {
  name: string
  description: string
  prizeType: PrizeType
  prizeDetails: Record<string, any>
  programAddress: string
  startDate: Date
  endDate: Date
  drawDate: Date
  entryCost?: number | null
  minTier?: string | null
  numWinners: number
  status?: RaffleStatus
  creator?: string
}

export interface RaffleFilter {
  status?: RaffleStatus
  programId?: string
  creator?: string
}
