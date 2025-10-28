import { LoyaltyProgramTier } from '@schemas/loyalty-program-tier'

export const DEFAULT_TIER: LoyaltyProgramTier = {
  name: 'Grind',
  rewards: ['nothing for you!'],
  xpRequired: 0,
}

export const DEFAULT_VOUCHER_TIERS: LoyaltyProgramTier[] = [
  { name: 'Grind', xpRequired: 0, rewards: [] },
  { name: 'Bronze', xpRequired: 500, rewards: [] },
  { name: 'Silver', xpRequired: 1000, rewards: [] },
  { name: 'Gold', xpRequired: 2000, rewards: [] },
]

export const DEFAULT_BROADCAST_DATA = {
  totalBroadcasts: 0,
  broadcasts: [],
}

export const DEFAULT_VOUCHER_COLLECTION_DATA = {
  totalVouchersIssued: 0,
  totalVouchersRedeemed: 0,
  totalValueRedeemed: 0,
  voucherStats: [],
}

export const DEFAULT_PASS_DATA = {
  xp: 0,
  lastAction: null,
  actionHistory: [],
  messageHistory: [],
  currentTier: DEFAULT_TIER.name,
  tierUpdatedAt: Date.now(),
  rewards: DEFAULT_TIER.rewards,
}

export const PLUGIN_TYPES = {
  ATTRIBUTES: 'Attributes',
  APP_DATA: 'AppData',
  PERMANENT_TRANSFER_DELEGATE: 'PermanentTransferDelegate',
  UPDATE_DELEGATE: 'UpdateDelegate',
  FREEZE_DELEGATE: 'FreezeDelegate',
} as const

export const ATTRIBUTE_KEYS = {
  PROGRAM_TYPE: 'programType',
  TIERS: 'tiers',
  POINTS_PER_ACTION: 'pointsPerAction',
  CREATOR: 'creator',
  TYPE: 'type',
  XP: 'xp',
  METADATA: 'metadata',
  // Voucher-specific keys
  VOUCHER_TYPES: 'voucherTypes',
  MERCHANT_ID: 'merchantId',
} as const
