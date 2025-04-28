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
    loyaltyProgramName: '',
    programAuthority: publicKey('11111111111111111111111111111111'),
    pointsPerAction: {},
    tiers: [],
    metadata: {
      organizationName: 'Test Host',
    },
    ...config,
  }
}

// Generates a default config object for CreateLoyaltyProgramConfig with option to override the config.
export function createTestLoyaltyProgramConfig(
  config: Partial<CreateLoyaltyProgramConfig> & { programAuthority: PublicKey },
): CreateLoyaltyProgramConfig {
  return {
    loyaltyProgramName: 'Test Loyalty Program',
    metadataUri: 'https://arweave.net/123abc',
    tiers: [
      { name: 'Grind', xpRequired: 0, rewards: ['nothing for you!'] },
      { name: 'Bronze', xpRequired: 500, rewards: ['2% cashback'] },
      { name: 'Silver', xpRequired: 1000, rewards: ['5% cashback'] },
      { name: 'Gold', xpRequired: 2000, rewards: ['10% cashback'] },
    ],
    pointsPerAction: { swap: 600, refer: 1000, stake: 2000 },
    metadata: {
      organizationName: 'Test Host',
      brandColor: '#9d4edd',
    },
    ...config,
  }
}

// Create a new loyalty program with a generated collection signer an default config.
export async function createTestLoyaltyProgram(
  context: VerxioContext,
): Promise<{ collection: KeypairSigner; signature: string; updateAuthority?: KeypairSigner }> {
  return await createLoyaltyProgram(
    context,
    createTestLoyaltyProgramConfig({ programAuthority: context.programAuthority }),
  )
}
