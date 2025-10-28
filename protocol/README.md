# Verxio Protocol

On-chain loyalty infrastructure for creating and managing loyalty programs on solana and SVM.

## Features

### Core Loyalty System

- **Create loyalty programs** with custom tiers and rewards
- **Issue loyalty passes as NFTs** with automatic metadata generation or custom metadata
- **Track user XP and tier progression** with automatic tier updates
- **Support for transferable loyalty passes** (with organization approval)
- **Built-in support for multiple networks** (Solana, Sonic)
- **Automatic tier progression** based on XP accumulation
- **Update loyalty program tiers and points per action** dynamically
- **Gift points to users** with custom actions and reasons
- **Comprehensive asset data and customer behavior tracking**
- **Flexible authority management** for loyalty programs and loyalty pass updates

### Communication & Messaging

- **Direct messaging** between program and pass holders
- **Program-wide broadcasts** with targeted delivery options
- **Message read status tracking** and analytics
- **Rich message metadata** with timestamps and sender information

### Advanced Transaction Composition

- **Instruction-based functions** for advanced transaction batching
- **Custom fee handling** and gas optimization
- **Transaction composition** with multiple operations
- **Built-in protocol fees** with transparent cost structure

### Complete Voucher Management System

- **Create, mint, validate, and redeem vouchers** with full lifecycle management
- **Voucher Collections** - Organize vouchers by merchant and type with tier support
- **Flexible Voucher Types** - Merchants define their own voucher types (e.g., 'percentage_off', 'free_coffee', 'birthday_discount')
- **XP Rewards Integration** - Vouchers can award loyalty points on redemption
- **Tier-Based Rewards** - Voucher collections support tier systems for XP-based reward structures
- **Voucher Analytics** - Track redemption rates, usage patterns, and performance metrics
- **User Voucher Management** - Get user vouchers with filtering and sorting
- **Merchant Voucher Operations** - Bulk operations and merchant-specific analytics
- **Voucher Validation** - Comprehensive validation with expiry and usage tracking
- **Voucher Redemption** - Multi-type voucher redemption with value calculation and message tracking
- **Voucher Expiry Management** - Extend or cancel vouchers with reason tracking and messages
- **XP Reward Management** - Reduce voucher XP rewards when customers cash out rewards
- **Merchant Identification** - Flexible merchant ID system for off-chain integration

### Flexible Voucher Types & XP Rewards

- **Merchant-Defined Types** - Merchants can create any voucher type (e.g., 'free_coffee', 'birthday_discount', 'wholesale_price')
- **Automatic Pattern Detection** - Common patterns like percentage discounts and fixed credits are automatically detected
- **XP Rewards** - Vouchers can award loyalty points (XP) when redeemed, integrated with voucher collection tiers
- **Voucher Tiers** - Collections support tier systems similar to loyalty programs for XP-based rewards
- **Cancellation & Redemption Messages** - Full message tracking for user display and audit trails

### Advanced Features

- **Irys Integration** - Automatic NFT image and metadata uploads
- **Comprehensive Test Suite** - Full coverage with 100+ test cases
- **Robust Error Handling** - Detailed validation and error messages
- **Type Safety** - Full TypeScript support with comprehensive types
- **Performance Optimized** - Efficient blockchain operations and data structures

## Installation

```bash
npm install @verxioprotocol/core
# or
yarn add @verxioprotocol/core
# or
pnpm add @verxioprotocol/core
```

## Quick Start

### Initialize Protocol

```typescript
import { initializeVerxio } from '@verxioprotocol/core'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { publicKey, keypairIdentity } from '@metaplex-foundation/umi'

// Create UMI instance (Solana & SVM supported)
const umi = createUmi('RPC_URL')

// Add Irys uploader for metadata/image uploads (Optional)
umi.use(irysUploader())

// Initialize program
const context = initializeVerxio(
  umi,
  publicKey('PROGRAM_AUTHORITY'), // Program authority public key
)

// Set Signer
context.umi.use(keypairIdentity('FEE_PAYER'))
```

### Create Your First Loyalty Program

```typescript
import { createLoyaltyProgram } from '@verxioprotocol/core'

const result = await createLoyaltyProgram(context, {
  loyaltyProgramName: 'Coffee Brew Rewards',
  metadataUri: 'https://arweave.net/...',
  programAuthority: context.programAuthority,
  metadata: {
    organizationName: 'Coffee Brew', // Required
    brandColor: '#FF5733', // Optional: for UI customization
  },
  tiers: [
    { name: 'Bronze', xpRequired: 500, rewards: ['2% cashback'] },
    { name: 'Silver', xpRequired: 1000, rewards: ['5% cashback'] },
    { name: 'Gold', xpRequired: 2000, rewards: ['10% cashback'] },
  ],
  pointsPerAction: {
    purchase: 100,
    review: 50,
    referral: 200,
  },
})

console.log('Loyalty Program Created:', result.collection.publicKey)
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

You can either:

- **Provide a pre-uploaded metadata URI** (no image upload needed), or
- **Provide an image buffer and filename** to auto-upload the image and generate metadata.

#### 1. Using a pre-uploaded metadata URI

```typescript
const result = await createLoyaltyProgram(context, {
  loyaltyProgramName: 'Coffee Brew Rewards',
  metadataUri: 'https://arweave.net/...', // Already uploaded metadata
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

#### 2. Uploading an image and generating metadata

```typescript
const fs = require('fs')
const imageBuffer = fs.readFileSync('logo.png')
const result = await createLoyaltyProgram(context, {
  loyaltyProgramName: 'Coffee Brew Rewards',
  imageBuffer, // Buffer of your image
  imageFilename: 'logo.png',
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
// The protocol will upload the image, generate metadata, and use the resulting URI
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

You can either:

- **Provide a pre-uploaded metadata URI** (no image upload needed), or
- **Provide an image buffer and filename** to auto-upload the image and generate metadata.

#### 1. Using a pre-uploaded metadata URI

```typescript
const result = await issueLoyaltyPass(context, {
  collectionAddress: context.collectionAddress,
  recipient: publicKey('RECIPIENT_ADDRESS'),
  passName: 'Coffee Rewards Pass',
  passMetadataUri: 'https://arweave.net/...', // Already uploaded metadata
  assetSigner: generateSigner(context.umi), // Optional: Provide a signer for the pass
  updateAuthority: programAuthority, // Required: Program authority of the Loyalty Program
  organizationName: 'Coffee Brew',
})

console.log(result)
// {
//   asset: KeypairSigner,  // Pass signer
//   signature: string      // Transaction signature
// }
```

#### 2. Uploading an image and generating metadata

```typescript
const imageBuffer = fs.readFileSync('pass.png')
const result = await issueLoyaltyPass(context, {
  collectionAddress: context.collectionAddress,
  recipient: publicKey('RECIPIENT_ADDRESS'),
  passName: 'Coffee Rewards Pass',
  imageBuffer, // Buffer of your image
  imageFilename: 'pass.png',
  updateAuthority: programAuthority, // Required: Program authority of the Loyalty Program
  organizationName: 'Coffee Brew',
})
// The protocol will upload the image, generate metadata, and use the resulting URI
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

## Voucher Management System

Verxio Protocol includes a comprehensive voucher management system for creating, distributing, and redeeming digital vouchers with full lifecycle management.

### Create Voucher Collection

Voucher collections can include tier systems for XP-based rewards, similar to loyalty programs. You can use default tiers or define custom tier names and XP thresholds.

You can either:

- **Provide a pre-uploaded metadata URI** (no image upload needed), or
- **Provide an image buffer and filename** to auto-upload the image and generate metadata.

#### 1. Using a pre-uploaded metadata URI

```typescript
const result = await createVoucherCollection(context, {
  voucherCollectionName: 'Summer Sale Vouchers',
  metadataUri: 'https://arweave.net/...', // Already uploaded metadata
  programAuthority: context.programAuthority,
  updateAuthority: generateSigner(context.umi),
  metadata: {
    merchantName: 'Coffee Brew',
    merchantAddress: 'coffee_brew_001',
    voucherTypes: ['discount', 'free_item', 'credits'], // Types this collection supports
  },
  // Optional: Define custom tiers for XP rewards
  tiers: [
    { name: 'Bronze', xpRequired: 500, rewards: ['2% cashback'] },
    { name: 'Silver', xpRequired: 1000, rewards: ['5% cashback'] },
    { name: 'Gold', xpRequired: 2000, rewards: ['10% cashback'] },
  ],
})

console.log(result)
// {
//   collection: KeypairSigner,  // Collection signer
//   signature: string,         // Transaction signature
//   updateAuthority: KeypairSigner // Update authority for the collection
// }
```

#### 2. Uploading an image and generating metadata

```typescript
const imageBuffer = fs.readFileSync('voucher-collection.png')
const result = await createVoucherCollection(context, {
  voucherCollectionName: 'Summer Sale Vouchers',
  imageBuffer, // Buffer of your image
  imageFilename: 'voucher-collection.png',
  programAuthority: context.programAuthority,
  updateAuthority: generateSigner(context.umi),
  metadata: {
    merchantName: 'Coffee Brew',
    merchantAddress: 'coffee_brew_001',
    voucherTypes: ['discount', 'free_item', 'credits'],
  },
  // Optional: Custom tier names with default thresholds
  tiers: [{ name: 'Member' }, { name: 'VIP' }, { name: 'Elite' }],
})
// The protocol will upload the image, generate metadata, and use the resulting URI
```

### Mint Voucher

You can either:

- **Provide a pre-uploaded metadata URI** (no image upload needed), or
- **Provide an image buffer and filename** to auto-upload the image and generate metadata.

#### 1. Using a pre-uploaded metadata URI

```typescript
const result = await mintVoucher(context, {
  collectionAddress: publicKey('COLLECTION_ADDRESS'),
  voucherName: 'Summer Sale Voucher',
  voucherMetadataUri: 'https://arweave.net/...', // Already uploaded metadata
  voucherData: {
    type: 'percentage_off', // Flexible type: can be any string (e.g., 'free_coffee', 'birthday_discount')
    value: 15, // 15% off
    maxUses: 1,
    expiryDate: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days from now
    conditions: [{ type: 'minimum_purchase', value: 50, operator: 'greater_than' }],
    description: '15% off your next purchase',
    merchantId: 'coffee_brew_merchant_001', // String identifier for the merchant
    xpReward: 50, // Optional: XP points to award when voucher is redeemed
  },
  recipient: publicKey('RECIPIENT_ADDRESS'),
  updateAuthority: generateSigner(context.umi),
})

console.log(result)
// {
//   asset: KeypairSigner,  // Voucher signer
//   signature: string,    // Transaction signature
//   voucherAddress: PublicKey // Voucher public key
// }
```

#### 2. Uploading an image and generating metadata

```typescript
const imageBuffer = fs.readFileSync('voucher.png')
const result = await mintVoucher(context, {
  collectionAddress: publicKey('COLLECTION_ADDRESS'),
  voucherName: 'Summer Sale Voucher',
  imageBuffer, // Buffer of your image
  imageFilename: 'voucher.png',
  voucherData: {
    type: 'percentage_off', // Flexible type: can be any string (e.g., 'free_coffee', 'birthday_discount')
    value: 15, // 15% off
    maxUses: 1,
    expiryDate: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days from now
    conditions: [{ type: 'minimum_purchase', value: 50, operator: 'greater_than' }],
    description: '15% off your next purchase',
    merchantId: 'coffee_brew_merchant_001', // String identifier for the merchant
    xpReward: 50, // Optional: XP points to award when voucher is redeemed
  },
  recipient: publicKey('RECIPIENT_ADDRESS'),
  updateAuthority: generateSigner(context.umi),
})
// The protocol will upload the image, generate metadata, and use the resulting URI
```

### Validate Voucher

```typescript
const validation = await validateVoucher(context, {
  voucherAddress: publicKey('VOUCHER_ADDRESS'),
})

console.log(validation)
// {
//   isValid: boolean,
//   errors: string[],
//   warnings: string[],
//   voucherData: {
//     type: string,
//     value: number,
//     currentUses: number,
//     maxUses: number,
//     expiryDate: number,
//     conditions: string[],
//     description: string,
//     merchantId: string
//   },
//   redemptionValue: number
// }
```

### Redeem Voucher

The `redeemVoucher` function performs comprehensive validation and redemption of vouchers. It enforces merchant ID matching, validates expiry dates, usage limits, and conditions, then records the redemption in the voucher's history.

```typescript
const result = await redeemVoucher(context, {
  voucherAddress: publicKey('VOUCHER_ADDRESS'),
  merchantId: 'coffee_brew_merchant_001', // String identifier for the merchant
  updateAuthority: generateSigner(context.umi), // Authority that can update the voucher
  redemptionAmount: 100, // Purchase amount for percentage-based vouchers
  redemptionDetails: {
    transactionId: 'tx_123',
    items: ['Coffee', 'Pastry'],
    totalAmount: 100,
    discountApplied: 25,
    redemptionMessage: 'Thank you for your purchase!', // Optional: Message shown to user
  },
})

console.log(result)
// {
//   success: boolean,
//   signature: string,
//   validation: {
//     errors: string[], // Validation errors if any
//     voucher: VoucherData // Voucher data after validation
//   },
//   redemptionValue: number, // Calculated redemption value
//   updatedVoucher: VoucherData // Voucher data after redemption (includes redemptionHistory with message)
// }
```

### Get User Vouchers

```typescript
const vouchers = await getUserVouchers(context, {
  userAddress: publicKey('USER_ADDRESS'),
  collectionAddress: publicKey('COLLECTION_ADDRESS'), // Optional: filter by collection
  merchantId: 'coffee_brew_001', // Optional: filter by merchant
  status: 'active', // Optional: 'active' | 'used' | 'expired' | 'cancelled'
  voucherType: 'percentage_off', // Optional: filter by voucher type (any merchant-defined type)
  limit: 10, // Optional: limit results
  offset: 0, // Optional: pagination offset
})

console.log(vouchers)
// {
//   vouchers: Array<{
//     voucherAddress: PublicKey,
//     voucherData: VoucherData, // Full voucher data including type, value, xpReward, etc.
//     collectionAddress: PublicKey,
//     name: string,
//     uri: string,
//     isExpired: boolean,
//     canRedeem: boolean,
//     remainingUses: number,
//     timeUntilExpiry: number
//   }>,
//   totalCount: number,
//   hasMore: boolean,
//   summary: {
//     activeVouchers: number,
//     expiredVouchers: number,
//     usedVouchers: number,
//     cancelledVouchers: number,
//     totalValue: number,
//     byType: Record<string, number>, // Count by voucher type
//     byMerchant: Record<string, number>
//   }
// }
```

### Extend Voucher Expiry

```typescript
const result = await extendVoucherExpiry(context, {
  voucherAddress: publicKey('VOUCHER_ADDRESS'),
  newExpiryDate: Date.now() + 60 * 24 * 60 * 60 * 1000, // 60 days from now
  reason: 'Customer request',
  signer: generateSigner(context.umi),
})

console.log(result)
// {
//   signature: string,
//   newExpiryDate: number
// }
```

### Cancel Voucher

```typescript
const result = await cancelVoucher(context, {
  voucherAddress: publicKey('VOUCHER_ADDRESS'),
  updateAuthority: generateSigner(context.umi),
  reason: 'Customer refund', // Cancellation reason (stored in cancellationMessage)
})

console.log(result)
// {
//   success: boolean,
//   signature: string,
//   updatedVoucher: VoucherData // Includes cancellationMessage
// }
```

### Merchant Identification

In the voucher system, merchants are identified using a `merchantId` string rather than a blockchain address. This provides flexibility for:

- **Off-chain Integration**: Merchants can use their existing business identifiers
- **Multi-chain Support**: Same merchant can operate across different networks
- **Privacy**: Merchant identity can be managed separately from blockchain addresses
- **Scalability**: No need to manage multiple wallet addresses per merchant

The `merchantId` is set when creating vouchers and validated during redemption to ensure vouchers are only used at the correct merchant.

### Flexible Voucher Types

Verxio Protocol supports **flexible, merchant-defined voucher types**. Merchants can create any voucher type that fits their business needs. The system automatically detects common patterns for value calculation while allowing complete flexibility.

#### Common Patterns (Auto-Detected)

The system automatically recognizes these patterns for value calculation:

**Percentage-Based Vouchers** (type contains 'percentage', 'percent', or 'pct'):

```typescript
{
  type: 'percentage_off', // or 'percent_discount', 'pct_off', etc.
  value: 15, // 15% discount
  conditions: ['Minimum purchase: $50']
}
```

**Fixed Credits/Amount Vouchers** (type contains 'fixed' and 'credit'/'amount'):

```typescript
{
  type: 'fixed_verxio_credits', // or 'fixed_credits', 'fixed_amount', etc.
  value: 100, // $100 in credits
  conditions: ['Valid for any purchase']
}
```

#### Custom Merchant Types

For any other type, the system returns the voucher value and merchants can handle custom logic in their application layer:

```typescript
{
  type: 'free_coffee', // Merchant-defined type
  value: 1,
  description: 'Free coffee with any purchase',
  xpReward: 50, // Award 50 XP when redeemed
}

{
  type: 'birthday_discount',
  value: 25, // $25 value
  description: 'Birthday special discount',
}

{
  type: 'wholesale_price',
  value: 30, // 30% wholesale discount
  description: 'Wholesale pricing for bulk orders',
}
```

### XP Rewards & Tier Management

Vouchers can award XP (experience points) when redeemed, integrating with voucher collection tier systems.

#### Minting a Voucher with XP Reward

```typescript
await mintVoucher(context, {
  // ... other config
  voucherData: {
    type: 'percentage_off',
    value: 20,
    xpReward: 100, // Award 100 XP when this voucher is redeemed
    // ... other fields
  },
})
```

#### Reducing XP Reward

When a customer qualifies for and cashes out their XP reward, merchants can reduce the voucher's remaining XP:

```typescript
const result = await reduceVoucherXpReward(context, {
  voucherAddress: publicKey('VOUCHER_ADDRESS'),
  updateAuthority: generateSigner(context.umi),
  xpToReduce: 50, // Reduce by 50 XP
  reason: 'Customer cashed out XP reward', // Optional
})

console.log(result)
// {
//   success: boolean,
//   signature: string,
//   updatedVoucher: VoucherData,
//   previousXpReward: number,
//   newXpReward: number
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
- **Error Handling**: Validate inputs before transaction execution

### Protocol Fees

Verxio Protocol includes built-in static fees for protocol operations:

- **CREATE_LOYALTY_PROGRAM**: 0.002 SOL - Creating new loyalty programs
- **LOYALTY_OPERATIONS**: 0.001 SOL - Pass issuance and program updates
- **VERXIO_INTERACTION**: 0.0004 SOL - Points management and messaging
- **VOUCHER_OPERATIONS**: 0.0008 SOL - Voucher creation, minting, and redemption
- **VOUCHER_MANAGEMENT**: 0.0006 SOL - Voucher validation and analytics

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
- `
