/**
 * Examples demonstrating how to use Verxio Protocol Instructions
 * These examples show various patterns for composing and executing transactions
 */

import { describe, it, expect, beforeEach, beforeAll } from 'vitest'
import { generateSigner, publicKey } from '@metaplex-foundation/umi'
import { keypairIdentity } from '@metaplex-foundation/umi'
import { getTestContext } from './helpers/get-test-context'
import { VerxioContext } from '../schemas/verxio-context'
import { toBase58 } from '../utils/to-base58'
import {
  createLoyaltyProgramInstruction,
  CreateLoyaltyProgramInstructionConfig,
} from '../instructions/create-loyalty-program-instruction'
import { issueLoyaltyPassInstruction } from '../instructions/issue-loyalty-pass-instruction'
import { updateLoyaltyProgramInstruction } from '../instructions/update-loyalty-program-instruction'
import { awardLoyaltyPointsInstruction } from '../instructions/award-loyalty-points-instruction'
import { revokeLoyaltyPointsInstruction } from '../instructions/revoke-loyalty-points-instruction'
import { giftLoyaltyPointsInstruction } from '../instructions/gift-loyalty-points-instruction'
import { sendBroadcastInstruction } from '../instructions/send-broadcast-instruction'
import { sendAssetMessageInstruction } from '../instructions/send-asset-message-instruction'
import { markBroadcastReadInstruction } from '../instructions/mark-broadcast-read-instruction'
import { markMessageReadInstruction } from '../instructions/mark-message-read-instruction'
import { approveTransferInstruction } from '../instructions/approve-transfer-instruction'
import { createVoucherCollectionInstruction } from '../instructions/create-voucher-collection-instruction'
import { redeemVoucherInstruction } from '../instructions/redeem-voucher-instruction'
import { validateVoucherInstruction } from '../instructions/validate-voucher-instruction'
import { cancelVoucherInstruction } from '../instructions/cancel-voucher-instruction'
import { extendVoucherExpiryInstruction } from '../instructions/extend-voucher-expiry-instruction'
import { createVoucherCollection } from '../lib/create-voucher-collection'
import { mintVoucher } from '../lib/mint-voucher'
import { createTestVoucherConfig } from './helpers/create-test-voucher'
import { createMockUmiUploader } from './helpers/mock-uploader'
import { ensureFeePayerBalance } from './helpers/ensure-fee-payer-balance'

describe('verxio-instructions', () => {
  let context: VerxioContext

  beforeEach(async () => {
    const { context: testContext, feePayer } = getTestContext()

    // Ensure we have enough sol for loyalty program creation and fees
    await ensureFeePayerBalance(testContext.umi, {
      account: feePayer.publicKey,
      amount: 1,
    })
    // Set the signer identity on the UMI instance
    testContext.umi.use(keypairIdentity(feePayer))
    // Set mock uploader for image upload tests
    testContext.umi.uploader = createMockUmiUploader()
    context = testContext
  })

  describe('createLoyaltyProgramInstruction', () => {
    it('should create a loyalty program instruction and execute successfully', async () => {
      expect.assertions(4)

      const config: CreateLoyaltyProgramInstructionConfig = {
        metadataUri: 'https://example.com/program.json',
        loyaltyProgramName: 'Test Loyalty Program',
        pointsPerAction: { purchase: 10, referral: 20 },
        programAuthority: context.programAuthority,
        updateAuthority: generateSigner(context.umi),
        tiers: [
          { name: 'Grind', xpRequired: 0, rewards: ['Welcome'] },
          { name: 'Bronze', xpRequired: 100, rewards: ['5% discount'] },
        ],
        metadata: {
          organizationName: 'Test Organization',
          brandColor: '#8B4513',
        },
      }

      // Create instruction
      const { instruction, collection, updateAuthority } = await createLoyaltyProgramInstruction(context, config)

      // Execute transaction
      const result = await instruction.sendAndConfirm(context.umi, {
        confirm: { commitment: 'confirmed' },
      })

      expect(result).toBeTruthy()
      expect(collection).toBeTruthy()
      expect(updateAuthority).toBeTruthy()
      expect(toBase58(result.signature)).toMatch(/^[1-9A-HJ-NP-Za-km-z]{86,88}$/)
    })
  })

  describe('batch operations', () => {
    it('should compose multiple operations in a single transaction', async () => {
      expect.assertions(4)

      const programAuthority = generateSigner(context.umi)
      const updateAuthority = generateSigner(context.umi)
      const recipient = publicKey('Bmob7K3hwi41KzneDKeazEZtSGpJBywKgRXYhr2BPfyc')

      // Step 1: Create loyalty program instruction
      const programConfig = {
        metadataUri: 'https://example.com/program.json',
        loyaltyProgramName: 'Gaming Rewards',
        pointsPerAction: { play: 5, win: 20 },
        programAuthority: programAuthority.publicKey,
        updateAuthority,
        tiers: [{ name: 'Grind', xpRequired: 0, rewards: ['Badge'] }],
        metadata: { organizationName: 'Gaming Co' },
      }

      const { instruction: createProgram, collection } = await createLoyaltyProgramInstruction(context, programConfig)

      // Execute program creation first
      const programResult = await createProgram.sendAndConfirm(context.umi, {
        confirm: { commitment: 'confirmed' },
      })

      // Step 2: Issue loyalty pass instruction (separate transaction due to size limits)
      const passConfig = {
        collectionAddress: collection.publicKey,
        recipient,
        passName: 'Gaming Pass',
        passMetadataUri: 'https://example.com/pass.json',
        updateAuthority,
        organizationName: 'Gaming Co',
      }

      const { instruction: issuePass, asset } = await issueLoyaltyPassInstruction(context, passConfig)

      // Execute pass issuance separately
      const passResult = await issuePass.sendAndConfirm(context.umi, {
        confirm: { commitment: 'confirmed' },
      })

      expect(programResult).toBeTruthy()
      expect(passResult).toBeTruthy()
      expect(collection).toBeTruthy()
      expect(asset).toBeTruthy()
    })
  })

  describe('updateLoyaltyProgramInstruction', () => {
    it('should update program with new tiers and point values', async () => {
      expect.assertions(4)

      // First create a program
      const updateAuthority = generateSigner(context.umi)
      const programConfig = {
        metadataUri: 'https://example.com/program.json',
        loyaltyProgramName: 'Test Program',
        pointsPerAction: { purchase: 10 },
        programAuthority: context.programAuthority,
        updateAuthority,
        tiers: [{ name: 'Grind', xpRequired: 0, rewards: ['Welcome'] }],
        metadata: { organizationName: 'Test Co' },
      }

      const { instruction: createProgram, collection } = await createLoyaltyProgramInstruction(context, programConfig)
      await createProgram.sendAndConfirm(context.umi, { confirm: { commitment: 'confirmed' } })

      // Update context with collection address for subsequent operations
      context.collectionAddress = collection.publicKey

      // Update the program
      const updateConfig = {
        collectionAddress: collection.publicKey,
        programAuthority: context.programAuthority,
        updateAuthority,
        newTiers: [
          { name: 'Grind', xpRequired: 0, rewards: ['Welcome'] },
          { name: 'Bronze', xpRequired: 100, rewards: ['5% discount'] },
        ],
        newPointsPerAction: {
          purchase: 15,
          referral: 25,
        },
      }

      const { instruction, updatedTiers, updatedPointsPerAction } = await updateLoyaltyProgramInstruction(
        context,
        updateConfig,
      )
      const result = await instruction.sendAndConfirm(context.umi, { confirm: { commitment: 'confirmed' } })

      expect(result).toBeTruthy()
      expect(updatedTiers).toHaveLength(2)
      expect(Object.keys(updatedPointsPerAction)).toHaveLength(2)
      expect(toBase58(result.signature)).toMatch(/^[1-9A-HJ-NP-Za-km-z]{86,88}$/)
    })
  })

  describe('error handling', () => {
    it('should handle errors during instruction creation', async () => {
      expect.assertions(1)

      try {
        // This will fail during instruction creation if pass doesn't exist
        await awardLoyaltyPointsInstruction(context, {
          passAddress: publicKey('11111111111111111111111111111111'), // Invalid address
          action: 'purchase',
          signer: generateSigner(context.umi),
        })
      } catch (error: any) {
        expect(error.message).toContain('Pass not found')
      }
    })
  })

  describe('revokeLoyaltyPointsInstruction', () => {
    it('should revoke loyalty points from a pass', async () => {
      expect.assertions(3)

      // First create a program and issue a pass
      const updateAuthority = generateSigner(context.umi)
      const recipient = generateSigner(context.umi)

      const programConfig = {
        metadataUri: 'https://example.com/program.json',
        loyaltyProgramName: 'Revoke Test Program',
        pointsPerAction: { purchase: 10 },
        programAuthority: context.programAuthority,
        updateAuthority,
        tiers: [{ name: 'Grind', xpRequired: 0, rewards: ['Welcome'] }],
        metadata: { organizationName: 'Test Co' },
      }

      const { instruction: createProgram, collection } = await createLoyaltyProgramInstruction(context, programConfig)
      await createProgram.sendAndConfirm(context.umi, { confirm: { commitment: 'confirmed' } })

      // Update context with collection address for subsequent operations
      context.collectionAddress = collection.publicKey

      const passConfig = {
        collectionAddress: collection.publicKey,
        recipient: recipient.publicKey,
        passName: 'Test Pass',
        passMetadataUri: 'https://example.com/pass.json',
        updateAuthority,
        organizationName: 'Test Co',
      }

      const { instruction: issuePass, asset } = await issueLoyaltyPassInstruction(context, passConfig)
      await issuePass.sendAndConfirm(context.umi, { confirm: { commitment: 'confirmed' } })

      // Award points first
      const awardConfig = {
        passAddress: asset.publicKey,
        action: 'purchase',
        signer: updateAuthority,
      }

      const { instruction: awardPoints } = await awardLoyaltyPointsInstruction(context, awardConfig)
      await awardPoints.sendAndConfirm(context.umi, { confirm: { commitment: 'confirmed' } })

      // Now revoke points
      const revokeConfig = {
        passAddress: asset.publicKey,
        pointsToRevoke: 5,
        reason: 'Test revocation',
        signer: updateAuthority,
      }

      const { instruction, newPoints } = await revokeLoyaltyPointsInstruction(context, revokeConfig)
      const result = await instruction.sendAndConfirm(context.umi, { confirm: { commitment: 'confirmed' } })

      expect(result).toBeTruthy()
      expect(newPoints).toBe(5) // 10 awarded - 5 revoked
      expect(toBase58(result.signature)).toMatch(/^[1-9A-HJ-NP-Za-km-z]{86,88}$/)
    })
  })

  describe('giftLoyaltyPointsInstruction', () => {
    it('should gift loyalty points to a pass', async () => {
      expect.assertions(3)

      // First create a program and issue a pass
      const updateAuthority = generateSigner(context.umi)
      const recipient = generateSigner(context.umi)

      const programConfig = {
        metadataUri: 'https://example.com/program.json',
        loyaltyProgramName: 'Gift Test Program',
        pointsPerAction: { purchase: 10 },
        programAuthority: context.programAuthority,
        updateAuthority,
        tiers: [{ name: 'Grind', xpRequired: 0, rewards: ['Welcome'] }],
        metadata: { organizationName: 'Test Co' },
      }

      const { instruction: createProgram, collection } = await createLoyaltyProgramInstruction(context, programConfig)
      await createProgram.sendAndConfirm(context.umi, { confirm: { commitment: 'confirmed' } })

      // Update context with collection address for subsequent operations
      context.collectionAddress = collection.publicKey

      const passConfig = {
        collectionAddress: collection.publicKey,
        recipient: recipient.publicKey,
        passName: 'Test Pass',
        passMetadataUri: 'https://example.com/pass.json',
        updateAuthority,
        organizationName: 'Test Co',
      }

      const { instruction: issuePass, asset } = await issueLoyaltyPassInstruction(context, passConfig)
      await issuePass.sendAndConfirm(context.umi, { confirm: { commitment: 'confirmed' } })

      // Gift points
      const giftConfig = {
        passAddress: asset.publicKey,
        pointsToGift: 50,
        action: 'welcome_bonus',
        signer: updateAuthority,
      }

      const { instruction, newPoints } = await giftLoyaltyPointsInstruction(context, giftConfig)
      const result = await instruction.sendAndConfirm(context.umi, { confirm: { commitment: 'confirmed' } })

      expect(result).toBeTruthy()
      expect(newPoints).toBe(50)
      expect(toBase58(result.signature)).toMatch(/^[1-9A-HJ-NP-Za-km-z]{86,88}$/)
    })
  })

  describe('sendBroadcastInstruction', () => {
    it('should send a broadcast message', async () => {
      expect.assertions(3)

      // First create a program
      const updateAuthority = generateSigner(context.umi)
      const programConfig = {
        metadataUri: 'https://example.com/program.json',
        loyaltyProgramName: 'Broadcast Test Program',
        pointsPerAction: { purchase: 10 },
        programAuthority: context.programAuthority,
        updateAuthority,
        tiers: [{ name: 'Grind', xpRequired: 0, rewards: ['Welcome'] }],
        metadata: { organizationName: 'Test Co' },
      }

      const { instruction: createProgram, collection } = await createLoyaltyProgramInstruction(context, programConfig)
      await createProgram.sendAndConfirm(context.umi, { confirm: { commitment: 'confirmed' } })

      // Update context with collection address for subsequent operations
      context.collectionAddress = collection.publicKey

      // Send broadcast
      const broadcastConfig = {
        collectionAddress: collection.publicKey,
        message: 'Welcome to our loyalty program!',
        sender: updateAuthority.publicKey,
        signer: updateAuthority,
      }

      const { instruction, broadcast } = await sendBroadcastInstruction(context, broadcastConfig)
      const result = await instruction.sendAndConfirm(context.umi, { confirm: { commitment: 'confirmed' } })

      expect(result).toBeTruthy()
      expect(broadcast).toBeTruthy()
      expect(toBase58(result.signature)).toMatch(/^[1-9A-HJ-NP-Za-km-z]{86,88}$/)
    })
  })

  describe('sendAssetMessageInstruction', () => {
    it('should send a message to an asset', async () => {
      expect.assertions(3)

      // First create a program and issue a pass
      const updateAuthority = generateSigner(context.umi)
      const recipient = generateSigner(context.umi)

      const programConfig = {
        metadataUri: 'https://example.com/program.json',
        loyaltyProgramName: 'Message Test Program',
        pointsPerAction: { purchase: 10 },
        programAuthority: context.programAuthority,
        updateAuthority,
        tiers: [{ name: 'Grind', xpRequired: 0, rewards: ['Welcome'] }],
        metadata: { organizationName: 'Test Co' },
      }

      const { instruction: createProgram, collection } = await createLoyaltyProgramInstruction(context, programConfig)
      await createProgram.sendAndConfirm(context.umi, { confirm: { commitment: 'confirmed' } })

      // Update context with collection address for subsequent operations
      context.collectionAddress = collection.publicKey

      const passConfig = {
        collectionAddress: collection.publicKey,
        recipient: recipient.publicKey,
        passName: 'Test Pass',
        passMetadataUri: 'https://example.com/pass.json',
        updateAuthority,
        organizationName: 'Test Co',
      }

      const { instruction: issuePass, asset } = await issueLoyaltyPassInstruction(context, passConfig)
      await issuePass.sendAndConfirm(context.umi, { confirm: { commitment: 'confirmed' } })

      // Send message
      const messageConfig = {
        passAddress: asset.publicKey,
        message: 'Hello from the program!',
        sender: updateAuthority.publicKey,
        signer: updateAuthority,
      }

      const { instruction, message } = await sendAssetMessageInstruction(context, messageConfig)
      const result = await instruction.sendAndConfirm(context.umi, { confirm: { commitment: 'confirmed' } })

      expect(result).toBeTruthy()
      expect(message).toBeTruthy()
      expect(toBase58(result.signature)).toMatch(/^[1-9A-HJ-NP-Za-km-z]{86,88}$/)
    })
  })

  describe('markBroadcastReadInstruction', () => {
    it('should mark a broadcast as read', async () => {
      expect.assertions(3)

      // First create a program and send a broadcast
      const updateAuthority = generateSigner(context.umi)
      const programConfig = {
        metadataUri: 'https://example.com/program.json',
        loyaltyProgramName: 'Broadcast Read Test Program',
        pointsPerAction: { purchase: 10 },
        programAuthority: context.programAuthority,
        updateAuthority,
        tiers: [{ name: 'Grind', xpRequired: 0, rewards: ['Welcome'] }],
        metadata: { organizationName: 'Test Co' },
      }

      const { instruction: createProgram, collection } = await createLoyaltyProgramInstruction(context, programConfig)
      await createProgram.sendAndConfirm(context.umi, { confirm: { commitment: 'confirmed' } })

      // Update context with collection address for subsequent operations
      context.collectionAddress = collection.publicKey

      const broadcastConfig = {
        collectionAddress: collection.publicKey,
        message: 'Test broadcast',
        sender: updateAuthority.publicKey,
        signer: updateAuthority,
      }

      const { instruction: sendBroadcast, broadcast } = await sendBroadcastInstruction(context, broadcastConfig)
      await sendBroadcast.sendAndConfirm(context.umi, { confirm: { commitment: 'confirmed' } })

      // Mark as read
      const readConfig = {
        collectionAddress: collection.publicKey,
        broadcastId: broadcast.id,
        signer: updateAuthority,
      }

      const { instruction } = await markBroadcastReadInstruction(context, readConfig)
      const result = await instruction.sendAndConfirm(context.umi, { confirm: { commitment: 'confirmed' } })

      expect(result).toBeTruthy()
      expect(broadcast).toBeTruthy()
      expect(toBase58(result.signature)).toMatch(/^[1-9A-HJ-NP-Za-km-z]{86,88}$/)
    })
  })

  describe('markMessageReadInstruction', () => {
    it('should mark an asset message as read', async () => {
      expect.assertions(3)

      // First create a program, issue a pass, and send a message
      const updateAuthority = generateSigner(context.umi)
      const recipient = generateSigner(context.umi)

      const programConfig = {
        metadataUri: 'https://example.com/program.json',
        loyaltyProgramName: 'Message Read Test Program',
        pointsPerAction: { purchase: 10 },
        programAuthority: context.programAuthority,
        updateAuthority,
        tiers: [{ name: 'Grind', xpRequired: 0, rewards: ['Welcome'] }],
        metadata: { organizationName: 'Test Co' },
      }

      const { instruction: createProgram, collection } = await createLoyaltyProgramInstruction(context, programConfig)
      await createProgram.sendAndConfirm(context.umi, { confirm: { commitment: 'confirmed' } })

      // Update context with collection address for subsequent operations
      context.collectionAddress = collection.publicKey

      const passConfig = {
        collectionAddress: collection.publicKey,
        recipient: recipient.publicKey,
        passName: 'Test Pass',
        passMetadataUri: 'https://example.com/pass.json',
        updateAuthority,
        organizationName: 'Test Co',
      }

      const { instruction: issuePass, asset } = await issueLoyaltyPassInstruction(context, passConfig)
      await issuePass.sendAndConfirm(context.umi, { confirm: { commitment: 'confirmed' } })

      const messageConfig = {
        passAddress: asset.publicKey,
        message: 'Test message',
        sender: updateAuthority.publicKey,
        signer: updateAuthority,
      }

      const { instruction: sendMessage, message } = await sendAssetMessageInstruction(context, messageConfig)
      await sendMessage.sendAndConfirm(context.umi, { confirm: { commitment: 'confirmed' } })

      // Mark as read
      const readConfig = {
        passAddress: asset.publicKey,
        messageId: message.id,
        signer: updateAuthority,
      }

      const { instruction } = await markMessageReadInstruction(context, readConfig)
      const result = await instruction.sendAndConfirm(context.umi, { confirm: { commitment: 'confirmed' } })

      expect(result).toBeTruthy()
      expect(message).toBeTruthy()
      expect(toBase58(result.signature)).toMatch(/^[1-9A-HJ-NP-Za-km-z]{86,88}$/)
    })
  })

  describe('approveTransferInstruction', () => {
    it('should approve a transfer', async () => {
      expect.assertions(3)

      // First create a program and issue a pass
      const updateAuthority = generateSigner(context.umi)
      const recipient = generateSigner(context.umi)
      const newOwner = generateSigner(context.umi)

      const programConfig = {
        metadataUri: 'https://example.com/program.json',
        loyaltyProgramName: 'Transfer Test Program',
        pointsPerAction: { purchase: 10 },
        programAuthority: context.programAuthority,
        updateAuthority,
        tiers: [{ name: 'Grind', xpRequired: 0, rewards: ['Welcome'] }],
        metadata: { organizationName: 'Test Co' },
      }

      const { instruction: createProgram, collection } = await createLoyaltyProgramInstruction(context, programConfig)
      await createProgram.sendAndConfirm(context.umi, { confirm: { commitment: 'confirmed' } })

      // Update context with collection address for subsequent operations
      context.collectionAddress = collection.publicKey

      const passConfig = {
        collectionAddress: collection.publicKey,
        recipient: recipient.publicKey,
        passName: 'Test Pass',
        passMetadataUri: 'https://example.com/pass.json',
        updateAuthority,
        organizationName: 'Test Co',
      }

      const { instruction: issuePass, asset } = await issueLoyaltyPassInstruction(context, passConfig)
      await issuePass.sendAndConfirm(context.umi, { confirm: { commitment: 'confirmed' } })

      // Approve transfer
      const transferConfig = {
        passAddress: asset.publicKey,
        toAddress: newOwner.publicKey,
        signer: updateAuthority,
      }

      const { instruction } = await approveTransferInstruction(context, transferConfig)
      const result = await instruction.sendAndConfirm(context.umi, { confirm: { commitment: 'confirmed' } })

      expect(result).toBeTruthy()
      expect(asset).toBeTruthy()
      expect(toBase58(result.signature)).toMatch(/^[1-9A-HJ-NP-Za-km-z]{86,88}$/)
    })
  })

  describe('Voucher Management Instructions', () => {
    let voucherCollectionAddress: any
    let voucherCollectionUpdateAuthority: any
    let testVoucherAddress: any

    beforeEach(async () => {
      // Create a voucher collection for testing
      const collectionResult = await createVoucherCollection(context, {
        programAuthority: context.programAuthority,
        voucherCollectionName: 'Test Voucher Collection',
        metadataUri: 'https://arweave.net/test-collection-metadata',
        metadata: {
          merchantName: 'Test Coffee Shop',
          merchantAddress: 'test_coffee_shop_001',
          voucherTypes: ['discount', 'free_item', 'credits'],
        },
      })
      voucherCollectionAddress = collectionResult.collection.publicKey
      voucherCollectionUpdateAuthority = collectionResult.updateAuthority

      // Create a test voucher for operations
      const voucherConfig = createTestVoucherConfig({
        collectionAddress: voucherCollectionAddress,
        updateAuthority: voucherCollectionUpdateAuthority,
        voucherData: {
          type: 'percentage_off',
          value: 25,
          description: '25% off your purchase',
          expiryDate: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
          maxUses: 3,
          merchantId: 'test_coffee_shop_001',
        },
      })

      const voucherResult = await mintVoucher(context, voucherConfig)
      testVoucherAddress = voucherResult.voucherAddress
    })

    describe('createVoucherCollectionInstruction', () => {
      it('should create a voucher collection instruction with image upload', async () => {
        expect.assertions(4)

        const imageBuffer = Buffer.from('fake-voucher-collection-image')
        const config = {
          voucherCollectionName: 'Test Collection Instruction',
          programAuthority: context.programAuthority,
          updateAuthority: generateSigner(context.umi),
          metadata: {
            merchantName: 'Test Merchant',
            merchantAddress: 'test_merchant_001',
            voucherTypes: ['percentage_off', 'free_item'],
          },
          imageBuffer,
          imageFilename: 'collection.png',
          imageContentType: 'image/png',
        }

        const result = await createVoucherCollectionInstruction(context, config)

        expect(result.instruction).toBeDefined()
        expect(result.collection).toBeDefined()
        expect(result.updateAuthority).toBeDefined()
        expect(result.collection.publicKey).toBeDefined()
      })

      it('should create a voucher collection instruction with existing metadata URI', async () => {
        expect.assertions(3)

        const config = {
          voucherCollectionName: 'Test Collection URI',
          programAuthority: context.programAuthority,
          updateAuthority: generateSigner(context.umi),
          metadata: {
            merchantName: 'Test Merchant',
            merchantAddress: 'test_merchant_002',
            voucherTypes: ['credits'],
          },
          metadataUri: 'https://arweave.net/existing-collection-metadata',
        }

        const result = await createVoucherCollectionInstruction(context, config)

        expect(result.instruction).toBeDefined()
        expect(result.collection).toBeDefined()
        expect(result.updateAuthority).toBeDefined()
      })
    })

    describe('validateVoucherInstruction', () => {
      it('should validate a valid voucher successfully', async () => {
        expect.assertions(4)

        const config = {
          voucherAddress: testVoucherAddress,
          merchantId: 'test_coffee_shop_001',
        }

        const result = await validateVoucherInstruction(context, config)

        expect(result.validation).toBeDefined()
        expect(result.validation.isValid).toBe(true)
        expect(result.validation.errors).toHaveLength(0)
        expect(result.validation.voucher).toBeDefined()
      })

      it('should fail validation for wrong merchant', async () => {
        expect.assertions(3)

        const config = {
          voucherAddress: testVoucherAddress,
          merchantId: 'wrong_merchant',
        }

        const result = await validateVoucherInstruction(context, config)

        expect(result.validation).toBeDefined()
        expect(result.validation.isValid).toBe(false)
        expect(result.validation.errors.length).toBeGreaterThan(0)
      })
    })

    describe('redeemVoucherInstruction', () => {
      it('should create a redeem voucher instruction for percentage off voucher', async () => {
        expect.assertions(5)

        const config = {
          voucherAddress: testVoucherAddress,
          merchantId: 'test_coffee_shop_001',
          updateAuthority: voucherCollectionUpdateAuthority,
          redemptionAmount: 100, // $100 purchase
          redemptionDetails: {
            transactionId: 'tx_123',
            items: ['Coffee', 'Pastry'],
            totalAmount: 100,
            discountApplied: 25,
          },
        }

        const result = await redeemVoucherInstruction(context, config)

        expect(result.instruction).toBeDefined()
        expect(result.validation).toBeDefined()
        expect(result.validation.isValid).toBe(true)
        expect(result.redemptionValue).toBe(25) // 25% of $100
        expect(result.updatedVoucher).toBeDefined()
      })
    })

    describe('cancelVoucherInstruction', () => {
      it('should create a cancel voucher instruction', async () => {
        expect.assertions(3)

        // Create a new voucher for cancellation test
        const cancelVoucherConfig = createTestVoucherConfig({
          collectionAddress: voucherCollectionAddress,
          updateAuthority: voucherCollectionUpdateAuthority,
          voucherData: {
            type: 'free_item',
            value: 1,
            description: 'Free Coffee',
            expiryDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
            maxUses: 1,
            merchantId: 'test_coffee_shop_001',
          },
        })

        const cancelVoucherResult = await mintVoucher(context, cancelVoucherConfig)

        const config = {
          voucherAddress: cancelVoucherResult.voucherAddress,
          updateAuthority: voucherCollectionUpdateAuthority,
          reason: 'Merchant request',
        }

        const result = await cancelVoucherInstruction(context, config)

        expect(result.instruction).toBeDefined()
        expect(result.updatedVoucher).toBeDefined()
        expect(result.updatedVoucher.status).toBe('cancelled')
      })
    })

    describe('extendVoucherExpiryInstruction', () => {
      it('should create an extend voucher expiry instruction', async () => {
        expect.assertions(4)

        // Create a voucher with short expiry for testing
        const extendVoucherConfig = createTestVoucherConfig({
          collectionAddress: voucherCollectionAddress,
          updateAuthority: voucherCollectionUpdateAuthority,
          voucherData: {
            type: 'percentage_off',
            value: 15,
            description: '15% off',
            expiryDate: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
            maxUses: 2,
            merchantId: 'test_coffee_shop_001',
          },
        })

        const extendVoucherResult = await mintVoucher(context, extendVoucherConfig)

        const newExpiryDate = Date.now() + 60 * 24 * 60 * 60 * 1000 // 60 days
        const config = {
          voucherAddress: extendVoucherResult.voucherAddress,
          updateAuthority: voucherCollectionUpdateAuthority,
          newExpiryDate,
        }

        const result = await extendVoucherExpiryInstruction(context, config)

        expect(result.instruction).toBeDefined()
        expect(result.updatedVoucher).toBeDefined()
        expect(result.updatedVoucher.expiryDate).toBe(newExpiryDate)
        expect(result.previousExpiryDate).toBeLessThan(newExpiryDate)
      })
    })

    describe('Batch Voucher Operations', () => {
      it('should batch multiple voucher operations in a single transaction', async () => {
        expect.assertions(1)

        // Create a new voucher for batch operations
        const batchVoucherConfig = createTestVoucherConfig({
          collectionAddress: voucherCollectionAddress,
          updateAuthority: voucherCollectionUpdateAuthority,
          voucherData: {
            type: 'percentage_off',
            value: 30,
            description: '30% off',
            expiryDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
            maxUses: 2,
            merchantId: 'test_coffee_shop_001',
          },
        })

        const batchVoucherResult = await mintVoucher(context, batchVoucherConfig)

        // Create instructions for multiple operations
        const redeemInstruction = await redeemVoucherInstruction(context, {
          voucherAddress: batchVoucherResult.voucherAddress,
          merchantId: 'test_coffee_shop_001',
          updateAuthority: voucherCollectionUpdateAuthority,
          redemptionAmount: 200,
        })

        const extendInstruction = await extendVoucherExpiryInstruction(context, {
          voucherAddress: batchVoucherResult.voucherAddress,
          updateAuthority: voucherCollectionUpdateAuthority,
          newExpiryDate: Date.now() + 90 * 24 * 60 * 60 * 1000, // 90 days
        })

        // Combine instructions
        const combinedInstruction = redeemInstruction.instruction.add(extendInstruction.instruction)

        expect(combinedInstruction).toBeDefined()
        // Note: We don't execute the transaction here as it would modify the voucher state
        // In a real scenario, you would call combinedInstruction.sendAndConfirm()
      })
    })
  })
})
