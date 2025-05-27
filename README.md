# Verxio Protocol

On-chain loyalty protocol powered by Metaplex CORE for creating and managing loyalty programs

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
- Direct messaging between program and pass holders with support for program-wide broadcasts
- **Advanced transaction composition with instruction-based functions**

## Installation

```bash
npm install @verxioprotocol/core
# or
yarn add @verxioprotocol/core
# or
pnpm add @verxioprotocol/core
```

## Two Approaches to Using Verxio Protocol

Verxio Protocol provides two complementary approaches for different use cases:

### 1. Direct Functions (Immediate Execution)

Traditional functions that execute transactions immediately - perfect for simple, single-operation use cases.

### 2. Instruction Functions (Advanced Composition)

Instruction-based functions that return `TransactionBuilder` objects for advanced transaction composition, batching, and custom fee handling.

---

## Direct Functions Usage

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

### Send Message

```typescript
const result = await sendMessage(context, {
  passAddress: publicKey('PASS_ADDRESS'),
  message: 'Welcome to our loyalty program!',
  sender: programAuthority.publicKey,
  signer: updateAuthority, // Required: Program authority of the Loyalty Program
})

console.log(result)
// {
//   signature: string,  // Transaction signature
//   message: {
//     id: string,      // Unique message ID
//     content: string, // Message content
//     sender: string,  // Sender's public key
//     timestamp: number, // Message timestamp
//     read: boolean    // Message read status
//   }
// }
```

### Mark Message as Read

```typescript
const result = await markMessageRead(context, {
  passAddress: publicKey('PASS_ADDRESS'),
  messageId: 'MESSAGE_ID',
  signer: updateAuthority, // Required: Program authority of the Loyalty Program
})

console.log(result)
// {
//   signature: string  // Transaction signature
// }
```

### Get Asset Messages

```typescript
const messages = await getAssetMessages(context, publicKey('PASS_ADDRESS'))

console.log(messages)
// {
//   stats: {
//     total: number,   // Total number of messages
//     unread: number,  // Number of unread messages
//     read: number     // Number of read messages
//   },
//   messages: Array<{
//     id: string,      // Message ID
//     content: string, // Message content
//     sender: string,  // Sender's public key
//     timestamp: number, // Message timestamp
//     read: boolean    // Message read status
//   }>
// }
```

### Send Broadcast

```typescript
// Send broadcast to all holders
const result = await sendBroadcast(context, {
  collectionAddress: publicKey('COLLECTION_ADDRESS'),
  message: 'Welcome to our loyalty program!',
  sender: programAuthority.publicKey,
  signer: updateAuthority, // Required: Program authority of the Loyalty Program
})

// Send broadcast to specific holders
const specificResult = await sendBroadcast(context, {
  collectionAddress: publicKey('COLLECTION_ADDRESS'),
  message: 'VIP announcement',
  sender: programAuthority.publicKey,
  signer: updateAuthority,
})

console.log(result)
// {
//   signature: string,  // Transaction signature
//   broadcast: {
//     id: string,      // Unique broadcast ID
//     content: string, // Broadcast content
//     sender: string,  // Sender's public key
//     timestamp: number, // Broadcast timestamp
//     read: boolean,   // Broadcast read status
//     recipients?: {   // Optional recipient information
//       type: 'all' | 'tier' | 'specific',
//       value?: string[] // For 'tier': tier names, For 'specific': holder addresses
//     }
//   }
// }
```

### Mark Broadcast as Read

```typescript
const result = await markBroadcastRead(context, {
  collectionAddress: publicKey('COLLECTION_ADDRESS'),
  broadcastId: 'BROADCAST_ID',
  signer: updateAuthority, // Required: Program authority of the Loyalty Program
})

console.log(result)
// {
//   signature: string  // Transaction signature
// }
```

### Get Program Broadcasts

```typescript
const broadcasts = await getProgramDetails(context)

console.log(broadcasts.broadcasts)
// {
//   broadcasts: Array<{
//     id: string,      // Broadcast ID
//     content: string, // Broadcast content
//     sender: string,  // Sender's public key
//     timestamp: number, // Broadcast timestamp
//     read: boolean,   // Broadcast read status
//     recipients?: {   // Optional recipient information
//       type: 'all' | 'tier' | 'specific',
//       value?: string[] // For 'tier': tier names, For 'specific': holder addresses
//     }
//   }>,
//   totalBroadcasts: number // Total number of broadcasts
// }
```

---

## Instruction Functions Usage (Advanced)

Instruction-based functions provide advanced transaction composition capabilities, allowing you to batch multiple operations, optimize fees, and integrate with existing transaction flows.

### Key Benefits

- **Composability**: Combine multiple Verxio operations in a single transaction
- **Flexibility**: Add custom instructions before/after Verxio operations
- **Gas Optimization**: Batch operations to save on transaction fees
- **Integration**: Easier integration with existing transaction flows

### Protocol Fees

Verxio Protocol includes built-in static fees for protocol operations:

- **CREATE_LOYALTY_PROGRAM**: 0.002 SOL - Creating new loyalty programs
- **LOYALTY_OPERATIONS**: 0.001 SOL - Pass issuance and program updates
- **VERXIO_INTERACTION**: 0.0004 SOL - Points management and messaging

All instruction functions include these fees by default.

### Basic Instruction Usage

```typescript
import { createLoyaltyProgramInstruction } from '@verxioprotocol/core'

// Create instruction (doesn't execute)
const { instruction, collection, updateAuthority } = createLoyaltyProgramInstruction(context, config)

// Execute when ready
const result = await instruction.sendAndConfirm(context.umi)
```

### Composing Multiple Operations

```typescript
import {
  createLoyaltyProgramInstruction,
  issueLoyaltyPassInstruction,
  awardLoyaltyPointsInstruction,
} from '@verxioprotocol/core'

// Create individual instructions
const { instruction: createProgram, collection } = createLoyaltyProgramInstruction(context, programConfig)
const { instruction: issuePass } = issueLoyaltyPassInstruction(context, passConfig)
const { instruction: awardPoints } = await awardLoyaltyPointsInstruction(context, pointsConfig)

// Combine into single transaction
const combinedTx = createProgram.add(issuePass).add(awardPoints).add(customInstruction) // Your own instruction

// Execute with custom settings
const result = await combinedTx.sendAndConfirm(context.umi, {
  confirm: { commitment: 'finalized' },
  send: { skipPreflight: true },
})
```

### Available Instruction Functions

#### Core Loyalty Program Operations

- `createLoyaltyProgramInstruction` - Create a new loyalty program
- `updateLoyaltyProgramInstruction` - Update existing loyalty program
- `issueLoyaltyPassInstruction` - Issue loyalty passes to users

#### Points Management

- `awardLoyaltyPointsInstruction` - Award points for actions
- `revokeLoyaltyPointsInstruction` - Revoke points from users
- `giftLoyaltyPointsInstruction` - Gift points to users

#### Messaging & Communication

- `sendBroadcastInstruction` - Send broadcasts to all pass holders
- `sendAssetMessageInstruction` - Send messages to specific pass holders
- `markBroadcastReadInstruction` - Mark broadcasts as read
- `markMessageReadInstruction` - Mark messages as read

#### Asset Management

- `approveTransferInstruction` - Approve asset transfers

### Migration from Direct Functions

#### Before (Direct Functions)

```typescript
import { createLoyaltyProgram } from '@verxioprotocol/core'

// Executes immediately
const result = await createLoyaltyProgram(context, config)
console.log('Transaction signature:', result.signature)
```

#### After (Instruction Functions)

```typescript
import { createLoyaltyProgramInstruction } from '@verxioprotocol/core'

// Returns instruction builder
const { instruction, collection } = createLoyaltyProgramInstruction(context, config)

// Execute when ready
const tx = await instruction.sendAndConfirm(context.umi)
console.log('Transaction signature:', toBase58(tx.signature))
```

### Error Handling

All instruction functions perform the same validation as their direct counterparts but throw errors during instruction creation rather than execution:

```typescript
try {
  const { instruction } = await awardLoyaltyPointsInstruction(context, config)
  const result = await instruction.sendAndConfirm(context.umi)
} catch (error) {
  if (error.message.includes('Pass not found')) {
    // Handle pass not found during instruction creation
  } else {
    // Handle transaction execution errors
  }
}
```

### Best Practices

1. **Batch Related Operations**: Combine related operations in single transactions
2. **Validate Early**: Instruction functions validate inputs immediately
3. **Error Handling**: Separate instruction creation errors from execution errors
4. **Gas Optimization**: Use `sendAndConfirm` options for priority fees and commitment levels

### Fee Structure Details

| Operation Type         | Fee Amount | When Applied                   |
| ---------------------- | ---------- | ------------------------------ |
| CREATE_LOYALTY_PROGRAM | 0.002 SOL  | Creating new loyalty programs  |
| LOYALTY_OPERATIONS     | 0.001 SOL  | Pass issuance, program updates |
| VERXIO_INTERACTION     | 0.0004 SOL | Points management, messaging   |

### Read-Only Functions

The following functions are available for querying data (no instruction versions needed):

- `getCollectionAttribute`
- `calculateNewTier`
- `getProgramDetails`
- `getAssetData`
- `getAssetMessages`
- `getProgramTiers`
- `getWalletLoyaltyPasses`
- `getPointsPerAction`

## License

MIT
