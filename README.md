# Verxio Protocol

On-chain loyalty protocol powered by Metaplex's CORE for creating and managing loyalty programs

## Features

- Create loyalty programs with custom tiers and rewards
- Issue loyalty passes as NFTs
- Track user XP and tier progression
- Support for transferable loyalty passes (with organization approval)
- Built-in support for multiple networks (Solana, Sonic)
- Automatic tier progression based on XP
- Update loyalty program tiers and points per action
- Gift points to users with custom actions
- Comprehensive asset data and customer behaviour tracking
- Flexible authority management for loyalty programs and loyalty pass updates

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
  loyaltyProgramName: "Brew's summer discount",
  metadataUri: 'https://arweave.net/...',
  programAuthority: context.programAuthority,
  updateAuthority: generateSigner(context.umi), // Optional: Provide custom update authority
  metadata: {
    organizationName: 'Coffee Brew', // Required: Name of the host/organization
    brandColor: '#FF5733', // Optional: Brand color for UI customization
  },
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
//   signature: string,         // Transaction signature
//   programAuthority: KeypairSigner // Update authority for the loyalty program
// }
```

### Update Loyalty Program

```typescript
// Update points per action
const result = await updateLoyaltyProgram(context, {
  collectionAddress: publicKey('COLLECTION_ADDRESS'),
  programAuthority: context.programAuthority,
  updateAuthority: programAuthority, // Required: Program authority from Loyalty Program creation
  newPointsPerAction: {
    purchase: 150, // Update existing action
    referral: 200, // Add new action
  },
})

// Update tiers
const result = await updateLoyaltyProgram(context, {
  collectionAddress: publicKey('COLLECTION_ADDRESS'),
  programAuthority: context.programAuthority,
  updateAuthority: programAuthority, // Required: Program authority from Loyalty Program creation
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
  updateAuthority: programAuthority, // Required: Program authority from Loyalty Program creation
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
  updateAuthority: programAuthority, // Required: Program authority of the Loyalty Program
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
  signer: programAuthority, // Required: Program authority of the Loyalty Program
  multiplier: 1, // Optional: Point multiplier (default: 1)
})

console.log(result)
// {
//   points: number,    // New total points
//   signature: string  // Transaction signature
//   newTier: LoyaltyProgramTier // New tier if updated
// }
```

### Revoke Points

```typescript
const result = await revokeLoyaltyPoints(context, {
  passAddress: publicKey('PASS_ADDRESS'),
  pointsToRevoke: 50,
  signer: programAuthority, // Required: Program authority of the Loyalty Program
})

console.log(result)
// {
//   points: number,    // New total points after reduction
//   signature: string  // Transaction signature
//   newTier: LoyaltyProgramTier // New tier if updated
// }
```

### Gift Points

```typescript
const result = await giftLoyaltyPoints(context, {
  passAddress: publicKey('PASS_ADDRESS'),
  pointsToGift: 100,
  signer: updateAuthority, // Required: Program authority of the Loyalty Program
  action: 'bonus', // Reason for gifting points
})

console.log(result)
// {
//   points: number,    // New total points
//   signature: string  // Transaction signature
//   newTier: LoyaltyProgramTier // New tier if updated
// }
```

### Get Asset Data

```typescript
const assetData = await getAssetData(context, publicKey('PASS_ADDRESS'))

console.log(assetData)
// {
//   xp: number,              // Current XP points
//   lastAction: string | null, // Last action performed
//   actionHistory: Array<{   // History of actions
//     type: string,
//     points: number,
//     timestamp: number,
//     newTotal: number
//   }>,
//   currentTier: string,     // Current tier name
//   tierUpdatedAt: number,   // Timestamp of last tier update
//   rewards: string[],       // Available rewards
//   name: string,           // Asset name
//   uri: string,            // Asset metadata URI
//   owner: string,          // Asset owner address
//   pass: string,           // Pass public key
//   metadata: {             // Program metadata
//     organizationName: string,     // Required: Name of the host/organization
//     brandColor?: string   // Optional: Brand color for UI customization
//   },
//   rewardTiers: Array<{    // All available reward tiers
//     name: string,
//     xpRequired: number,
//     rewards: string[]
//   }>
// }
```

### Get Program Details

```typescript
const programDetails = await getProgramDetails(context)

console.log(programDetails)
// {
//   name: string,
//   uri: string,
//   collectionAddress: string,
//   updateAuthority: string,
//   numMinted: number,
//   creator: string,
//   tiers: Array<{
//     name: string,
//     xpRequired: number,
//     rewards: string[]
//   }>,
//   pointsPerAction: Record<string, number>,
//   metadata: {
//     organizationName: string,     // Required: Name of the host/organization
//     brandColor?: string   // Optional: Brand color for UI customization
//   }
// }
```

### Get Wallet Loyalty Passes

```typescript
const passes = await getWalletLoyaltyPasses(context, publicKey('WALLET_ADDRESS'))

console.log(passes)
// Array<{
//   publicKey: string,
//   name: string,
//   uri: string,
//   owner: string
// }>
```

### Get Program Tiers

```typescript
const tiers = await getProgramTiers(context)

console.log(tiers)
// Array<{
//   name: string,
//   xpRequired: number,
//   rewards: string[]
// }>
```

### Get Points Per Action

```typescript
const pointsPerAction = await getPointsPerAction(context)

console.log(pointsPerAction)
// Record<string, number> // Action name to points mapping
```

### Approve Transfer

```typescript
await approveTransfer(context, {
  passAddress: publicKey('PASS_ADDRESS'),
  toAddress: publicKey('NEW_OWNER_ADDRESS'),
})
```

## License

MIT
