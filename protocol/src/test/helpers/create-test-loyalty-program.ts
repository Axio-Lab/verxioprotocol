import { VerxioContext } from '@/schemas/verxio-context'
import { createLoyaltyProgram, CreateLoyaltyProgramConfig } from '@/lib/create-loyalty-program'
import { KeypairSigner, PublicKey, publicKey } from '@metaplex-foundation/umi'

// Creates an empty config object for CreateLoyaltyProgramConfig.
// This is useful for testing the cases in the config validation.
export function createTestLoyaltyProgramConfigEmpty(
  config: Partial<CreateLoyaltyProgramConfig> = {},
): CreateLoyaltyProgramConfig {
  return {
    metadataUri: '',
    organizationName: '',
    programAuthority: publicKey('11111111111111111111111111111111'),
    pointsPerAction: {},
    tiers: [],
    ...config,
  }
}

// Generates a default config object for CreateLoyaltyProgramConfig with option to override the config.
export function createTestLoyaltyProgramConfig(
  config: Partial<CreateLoyaltyProgramConfig> & { programAuthority: PublicKey },
): CreateLoyaltyProgramConfig {
  return {
    organizationName: 'Test Loyalty Program',
    metadataUri: 'https://arweave.net/123abc',
    tiers: [
      { name: 'Grind', xpRequired: 0, rewards: ['nothing for you!'] },
      { name: 'Bronze', xpRequired: 500, rewards: ['2% cashback'] },
      { name: 'Silver', xpRequired: 1000, rewards: ['5% cashback'] },
      { name: 'Gold', xpRequired: 2000, rewards: ['10% cashback'] },
    ],
    pointsPerAction: { swap: 600, refer: 1000, stake: 2000 },
    ...config,
  }
}

// Create a new loyalty program with a generated collection signer an default config.
export async function createTestLoyaltyProgram(
  context: VerxioContext,
): Promise<{ collection: KeypairSigner; signature: string }> {
  return await createLoyaltyProgram(
    context,
    createTestLoyaltyProgramConfig({ programAuthority: context.programAuthority }),
  )
}
