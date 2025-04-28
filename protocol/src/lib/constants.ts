import { LoyaltyProgramTier } from '@schemas/loyalty-program-tier'

export const DEFAULT_TIER: LoyaltyProgramTier = {
  name: 'Grind',
  rewards: ['nothing for you!'],
  xpRequired: 0,
}

export const DEFAULT_PASS_DATA = {
  xp: 0,
  lastAction: null,
  actionHistory: [],
  currentTier: DEFAULT_TIER.name,
  tierUpdatedAt: Date.now(),
  rewards: DEFAULT_TIER.rewards,
}

export const PLUGIN_TYPES = {
  ATTRIBUTES: 'Attributes',
  APP_DATA: 'AppData',
  PERMANENT_TRANSFER_DELEGATE: 'PermanentTransferDelegate',
  UPDATE_DELEGATE: 'UpdateDelegate',
} as const

export const ATTRIBUTE_KEYS = {
  PROGRAM_TYPE: 'programType',
  TIERS: 'tiers',
  POINTS_PER_ACTION: 'pointsPerAction',
  CREATOR: 'creator',
  TYPE: 'type',
  XP: 'xp',
  METADATA: 'metadata',
} as const
