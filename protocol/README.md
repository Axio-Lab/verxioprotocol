# Verxio Protocol

Reward Protocol for creating and managing loyalty programs on Solana and SVM.

## Features

- Create loyalty programs with custom tiers and rewards
- Issue loyalty passes as NFTs
- Track user XP and tier progression
- Support for transferable loyalty passes (with organization approval)
- Built-in support for multiple networks (Solana, Sonic)
- Automatic tier progression based on XP
- Update loyalty program tiers and points per action

## Installation

```bash
npm install @verxioprotocol/core
# or
yarn add @verxioprotocol/core
# or
pnpm add @verxioprotocol/core
```

## Usage

### Initialize Protocol

```typescript
import { initializeVerxio } from '@verxioprotocol/core'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { publicKey } from '@metaplex-foundation/umi'

// Create UMI instance (Solana & SVM supported)
const umi = createUmi('RPC_URL')

// Initialize program
const context = initializeVerxio(
  umi,
  publicKey('PROGRAM_AUTHORITY'), // Program authority public key
)

// Set Signer
context.umi.use(keypairIdentity('FEE_PAYER'))
```

### Create Loyalty Program

```typescript
const result = await createLoyaltyProgram(context, {
  organizationName: 'Coffee Rewards',
  metadataUri: 'https://arweave.net/...',
  programAuthority: context.programAuthority,
  tiers: [
    {
      name: 'Bronze',
      xpRequired: 500,
      rewards: ['2% cashback'],
    },
    {
      name: 'Silver',
      xpRequired: 1000,
      rewards: ['5% cashback'],
    },
  ],
  pointsPerAction: {
    purchase: 100,
    review: 50,
  },
})

console.log(result)
// {
//   collection: KeypairSigner,  // Collection signer
//   signature: string          // Transaction signature
// }
```

### Update Loyalty Program

```typescript
// Update points per action
const result = await updateLoyaltyProgram(context, {
  collectionAddress: publicKey('COLLECTION_ADDRESS'),
  programAuthority: context.programAuthority,
  newPointsPerAction: {
    purchase: 150, // Update existing action
    referral: 200, // Add new action
  },
})

// Update tiers
const result = await updateLoyaltyProgram(context, {
  collectionAddress: publicKey('COLLECTION_ADDRESS'),
  programAuthority: context.programAuthority,
  newTiers: [
    { name: 'Grind', xpRequired: 0, rewards: ['nothing for you!'] }, // Grind tier must exist
    { name: 'Bronze', xpRequired: 400, rewards: ['free item'] }, // Update existing tier
    { name: 'Silver', xpRequired: 1000, rewards: ['5% cashback'] },
    { name: 'Gold', xpRequired: 2000, rewards: ['10% cashback'] },
    { name: 'Platinum', xpRequired: 5000, rewards: ['20% cashback'] }, // Add new tier
  ],
})

// Update both tiers and points per action
const result = await updateLoyaltyProgram(context, {
  collectionAddress: publicKey('COLLECTION_ADDRESS'),
  programAuthority: context.programAuthority,
  newTiers: [
    { name: 'Grind', xpRequired: 0, rewards: ['nothing for you!'] },
    { name: 'Bronze', xpRequired: 400, rewards: ['free item'] },
    { name: 'Silver', xpRequired: 1000, rewards: ['5% cashback'] },
    { name: 'Gold', xpRequired: 2000, rewards: ['10% cashback'] },
  ],
  newPointsPerAction: {
    purchase: 150,
    referral: 200,
  },
})

console.log(result)
// {
//   signature: string  // Transaction signature
// }
```

### Issue Loyalty Pass

```typescript
const result = await issueLoyaltyPass(context, {
  collectionAddress: context.collectionAddress,
  recipient: publicKey('RECIPIENT_ADDRESS'),
  passName: 'Coffee Rewards Pass',
  passMetadataUri: 'https://arweave.net/...',
  assetSigner: generateSigner(context.umi), // Optional: Provide a signer for the pass
})

console.log(result)
// {
//   asset: KeypairSigner,  // Pass signer
//   signature: string      // Transaction signature
// }
```

### Award Points

```typescript
const result = await awardLoyaltyPoints(context, {
  passAddress: publicKey('PASS_ADDRESS'),
  action: 'purchase',
  signer: passSigner, // KeypairSigner from issueLoyaltyPass
  multiplier: 1, // Optional: Point multiplier (default: 1)
})

console.log(result)
// {
//   points: number,    // New total points
//   signature: string  // Transaction signature
// }
```

### Revoke Points

```typescript
const result = await revokeLoyaltyPoints(context, {
  passAddress: publicKey('PASS_ADDRESS'),
  pointsToRevoke: 50,
  signer: passSigner, // KeypairSigner from issueLoyaltyPass
})

console.log(result)
// {
//   points: number,    // New total points after reduction
//   signature: string  // Transaction signature
// }
```

### Get Pass Data

```typescript
const data = await getAssetData(context, passAddress)

console.log(data)
// {
//   xp: number,
//   lastAction: string | null,
//   actionHistory: Array<{
//     type: string,
//     points: number,
//     timestamp: number,
//     newTotal: number
//   }>,
//   currentTier: string,
//   tierUpdatedAt: number,
//   rewards: string[]
// }
```

### Get Program Details

```typescript
const details = await getProgramDetails(context)

console.log(details)
// {
//   name: string,
//   uri: string,
//   collectionAddress: string,
//   updateAuthority: string,
//   numMinted: number,
//   transferAuthority: string,
//   creator: string
// }
```

### Transfer Pass

```typescript
await approveTransfer(
  context,
  passAddress, // UMI PublicKey of the pass
  toAddress, // UMI PublicKey of the new owner
)
```

### Query Methods

```typescript
// Get all loyalty passes owned by a wallet
const passes = await getWalletLoyaltyPasses(
  context,
  walletAddress, // UMI PublicKey of the wallet
)

// Get program's points per action
const pointsPerAction = await getPointsPerAction(context)
// Returns: Record<string, number>

// Get program's tiers
const tiers = await getProgramTiers(context)
// Returns: Array<{
//   name: string,
//   xpRequired: number,
//   rewards: string[]
// }>
```

## Context Management

The `VerxioContext` interface defines the loyalty program's context:

```typescript
interface VerxioContext {
  umi: Umi
  programAuthority: PublicKey
  collectionAddress?: PublicKey
}
```

## License

MIT
