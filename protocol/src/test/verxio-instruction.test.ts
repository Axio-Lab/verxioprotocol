/**
 * Examples demonstrating how to use Verxio Protocol Instructions
 * These examples show various patterns for composing and executing transactions
 */

import { beforeAll, describe, expect, it } from 'vitest'
import { generateSigner, keypairIdentity, publicKey } from '@metaplex-foundation/umi'
import { createLoyaltyProgramInstruction } from '../instructions/create-loyalty-program-instruction'
import { updateLoyaltyProgramInstruction } from '../instructions/update-loyalty-program-instruction'
import { issueLoyaltyPassInstruction } from '../instructions/issue-loyalty-pass-instruction'
import { awardLoyaltyPointsInstruction } from '../instructions/award-loyalty-points-instruction'
import { revokeLoyaltyPointsInstruction } from '../instructions/revoke-loyalty-points-instruction'
import { giftLoyaltyPointsInstruction } from '../instructions/gift-loyalty-points-instruction'
import { sendBroadcastInstruction } from '../instructions/send-broadcast-instruction'
import { sendAssetMessageInstruction } from '../instructions/send-asset-message-instruction'
import { markBroadcastReadInstruction } from '../instructions/mark-broadcast-read-instruction'
import { markMessageReadInstruction } from '../instructions/mark-message-read-instruction'
import { approveTransferInstruction } from '../instructions/approve-transfer-instruction'
import { VerxioContext } from '../schemas/verxio-context'
import { toBase58 } from '../utils/to-base58'
import { getTestContext } from './helpers/get-test-context'
import { ensureFeePayerBalance } from './helpers/ensure-fee-payer-balance'
import { initializeVerxio } from '../lib/initialize-verxio'
import { FEES } from '../utils/fee-structure'

const { feePayer, context: baseContext } = getTestContext()

describe('verxio-instructions', { sequential: true, timeout: 30000 }, () => {
  let context: VerxioContext

  beforeAll(async () => {
    // Initialize context properly using initializeVerxio
    context = initializeVerxio(baseContext.umi, baseContext.programAuthority)

    // Ensure we have enough SOL for fees
    await ensureFeePayerBalance(context.umi, {
      account: feePayer.publicKey,
      amount: 2 + FEES.CREATE_LOYALTY_PROGRAM + FEES.LOYALTY_OPERATIONS + FEES.VERXIO_INTERACTION,
    })
    context.umi.use(keypairIdentity(feePayer))
  })

  describe('createLoyaltyProgramInstruction', () => {
    it('should create a loyalty program instruction and execute successfully', async () => {
      expect.assertions(4)

      const config = {
        metadataUri: 'https://example.com/metadata.json',
        loyaltyProgramName: 'Coffee Shop Rewards',
        pointsPerAction: {
          purchase: 10,
          referral: 50,
          review: 25,
        },
        programAuthority: context.programAuthority,
        tiers: [
          {
            name: 'Grind',
            xpRequired: 0,
            rewards: ['Welcome bonus'],
          },
          {
            name: 'Bronze',
            xpRequired: 100,
            rewards: ['5% discount'],
          },
        ],
        metadata: {
          organizationName: 'Coffee Shop Inc',
          brandColor: '#8B4513',
        },
      }

      // Create instruction
      const { instruction, collection, updateAuthority } = createLoyaltyProgramInstruction(context, config)

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

      const { instruction: createProgram, collection } = createLoyaltyProgramInstruction(context, programConfig)

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
      }

      const { instruction: issuePass, asset } = issueLoyaltyPassInstruction(context, passConfig)

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

      const { instruction: createProgram, collection } = createLoyaltyProgramInstruction(context, programConfig)
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

      const { instruction: createProgram, collection } = createLoyaltyProgramInstruction(context, programConfig)
      await createProgram.sendAndConfirm(context.umi, { confirm: { commitment: 'confirmed' } })

      // Update context with collection address for subsequent operations
      context.collectionAddress = collection.publicKey

      const passConfig = {
        collectionAddress: collection.publicKey,
        recipient: recipient.publicKey,
        passName: 'Test Pass',
        passMetadataUri: 'https://example.com/pass.json',
        updateAuthority,
      }

      const { instruction: issuePass, asset } = issueLoyaltyPassInstruction(context, passConfig)
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

      // Create program and issue a pass
      const updateAuthority = generateSigner(context.umi)
      const recipient = generateSigner(context.umi)

      const programConfig = {
        metadataUri: 'https://example.com/program.json',
        loyaltyProgramName: 'Gift Test Program',
        pointsPerAction: { purchase: 20 },
        programAuthority: context.programAuthority,
        updateAuthority,
        tiers: [{ name: 'Grind', xpRequired: 0, rewards: ['Welcome'] }],
        metadata: { organizationName: 'Test Co' },
      }

      const { instruction: createProgram, collection } = createLoyaltyProgramInstruction(context, programConfig)
      await createProgram.sendAndConfirm(context.umi, { confirm: { commitment: 'confirmed' } })

      // Update context with collection address for subsequent operations
      context.collectionAddress = collection.publicKey

      // Issue recipient pass
      const passConfig = {
        collectionAddress: collection.publicKey,
        recipient: recipient.publicKey,
        passName: 'Recipient Pass',
        passMetadataUri: 'https://example.com/recipient.json',
        updateAuthority,
      }

      const { instruction: issuePass, asset } = issueLoyaltyPassInstruction(context, passConfig)
      await issuePass.sendAndConfirm(context.umi, { confirm: { commitment: 'confirmed' } })

      // Gift points to the pass
      const giftConfig = {
        passAddress: asset.publicKey,
        pointsToGift: 10,
        action: 'gift',
        signer: updateAuthority,
      }

      const { instruction, newPoints } = await giftLoyaltyPointsInstruction(context, giftConfig)
      const result = await instruction.sendAndConfirm(context.umi, { confirm: { commitment: 'confirmed' } })

      expect(result).toBeTruthy()
      expect(newPoints).toBe(10) // 0 + 10 gifted
      expect(toBase58(result.signature)).toMatch(/^[1-9A-HJ-NP-Za-km-z]{86,88}$/)
    })
  })

  describe('sendBroadcastInstruction', () => {
    it('should send a broadcast message', async () => {
      expect.assertions(4)

      // Create a program first
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

      const { instruction: createProgram, collection } = createLoyaltyProgramInstruction(context, programConfig)
      await createProgram.sendAndConfirm(context.umi, { confirm: { commitment: 'confirmed' } })

      // Update context with collection address for subsequent operations
      context.collectionAddress = collection.publicKey

      // Send broadcast
      const broadcastConfig = {
        collectionAddress: collection.publicKey,
        message: 'Welcome to our loyalty program!',
        sender: context.programAuthority,
        signer: updateAuthority,
      }

      const { instruction, broadcast } = await sendBroadcastInstruction(context, broadcastConfig)
      const result = await instruction.sendAndConfirm(context.umi, { confirm: { commitment: 'confirmed' } })

      expect(result).toBeTruthy()
      expect(broadcast.content).toBe('Welcome to our loyalty program!')
      expect(broadcast.read).toBe(false)
      expect(toBase58(result.signature)).toMatch(/^[1-9A-HJ-NP-Za-km-z]{86,88}$/)
    })
  })

  describe('sendAssetMessageInstruction', () => {
    it('should send a message to an asset', async () => {
      expect.assertions(4)

      // Create program and issue a pass
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

      const { instruction: createProgram, collection } = createLoyaltyProgramInstruction(context, programConfig)
      await createProgram.sendAndConfirm(context.umi, { confirm: { commitment: 'confirmed' } })

      // Update context with collection address for subsequent operations
      context.collectionAddress = collection.publicKey

      const passConfig = {
        collectionAddress: collection.publicKey,
        recipient: recipient.publicKey,
        passName: 'Test Pass',
        passMetadataUri: 'https://example.com/pass.json',
        updateAuthority,
      }

      const { instruction: issuePass, asset } = issueLoyaltyPassInstruction(context, passConfig)
      await issuePass.sendAndConfirm(context.umi, { confirm: { commitment: 'confirmed' } })

      // Send message to asset
      const messageConfig = {
        passAddress: asset.publicKey,
        message: 'Congratulations on your new pass!',
        sender: context.programAuthority,
        signer: updateAuthority,
      }

      const { instruction, message } = await sendAssetMessageInstruction(context, messageConfig)
      const result = await instruction.sendAndConfirm(context.umi, { confirm: { commitment: 'confirmed' } })

      expect(result).toBeTruthy()
      expect(message.content).toBe('Congratulations on your new pass!')
      expect(message.read).toBe(false)
      expect(toBase58(result.signature)).toMatch(/^[1-9A-HJ-NP-Za-km-z]{86,88}$/)
    })
  })

  describe('markBroadcastReadInstruction', () => {
    it('should mark a broadcast as read', async () => {
      expect.assertions(2)

      // Create program and send broadcast first
      const updateAuthority = generateSigner(context.umi)
      const programConfig = {
        metadataUri: 'https://example.com/program.json',
        loyaltyProgramName: 'Read Test Program',
        pointsPerAction: { purchase: 10 },
        programAuthority: context.programAuthority,
        updateAuthority,
        tiers: [{ name: 'Grind', xpRequired: 0, rewards: ['Welcome'] }],
        metadata: { organizationName: 'Test Co' },
      }

      const { instruction: createProgram, collection } = createLoyaltyProgramInstruction(context, programConfig)
      await createProgram.sendAndConfirm(context.umi, { confirm: { commitment: 'confirmed' } })

      // Update context with collection address for subsequent operations
      context.collectionAddress = collection.publicKey

      // Send broadcast
      const broadcastConfig = {
        collectionAddress: collection.publicKey,
        message: 'Test broadcast message',
        sender: context.programAuthority,
        signer: updateAuthority,
      }

      const { instruction: sendBroadcast, broadcast } = await sendBroadcastInstruction(context, broadcastConfig)
      await sendBroadcast.sendAndConfirm(context.umi, { confirm: { commitment: 'confirmed' } })

      // Mark broadcast as read
      const readConfig = {
        collectionAddress: collection.publicKey,
        broadcastId: broadcast.id,
        signer: updateAuthority,
      }

      const { instruction } = await markBroadcastReadInstruction(context, readConfig)
      const result = await instruction.sendAndConfirm(context.umi, { confirm: { commitment: 'confirmed' } })

      expect(result).toBeTruthy()
      expect(toBase58(result.signature)).toMatch(/^[1-9A-HJ-NP-Za-km-z]{86,88}$/)
    })
  })

  describe('markMessageReadInstruction', () => {
    it('should mark an asset message as read', async () => {
      expect.assertions(2)

      // Create program, issue pass, and send message first
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

      const { instruction: createProgram, collection } = createLoyaltyProgramInstruction(context, programConfig)
      await createProgram.sendAndConfirm(context.umi, { confirm: { commitment: 'confirmed' } })

      // Update context with collection address for subsequent operations
      context.collectionAddress = collection.publicKey

      const passConfig = {
        collectionAddress: collection.publicKey,
        recipient: recipient.publicKey,
        passName: 'Test Pass',
        passMetadataUri: 'https://example.com/pass.json',
        updateAuthority,
      }

      const { instruction: issuePass, asset } = issueLoyaltyPassInstruction(context, passConfig)
      await issuePass.sendAndConfirm(context.umi, { confirm: { commitment: 'confirmed' } })

      const messageConfig = {
        passAddress: asset.publicKey,
        message: 'Test asset message',
        sender: context.programAuthority,
        signer: updateAuthority,
      }

      const { instruction: sendMessage, message } = await sendAssetMessageInstruction(context, messageConfig)
      await sendMessage.sendAndConfirm(context.umi, { confirm: { commitment: 'confirmed' } })

      // Mark message as read
      const readConfig = {
        passAddress: asset.publicKey,
        messageId: message.id,
        signer: updateAuthority,
      }

      const { instruction } = await markMessageReadInstruction(context, readConfig)
      const result = await instruction.sendAndConfirm(context.umi, { confirm: { commitment: 'confirmed' } })

      expect(result).toBeTruthy()
      expect(toBase58(result.signature)).toMatch(/^[1-9A-HJ-NP-Za-km-z]{86,88}$/)
    })
  })

  describe('approveTransferInstruction', () => {
    it('should approve a transfer', async () => {
      expect.assertions(2)

      // Create program and issue a pass
      const updateAuthority = generateSigner(context.umi)
      const recipient = generateSigner(context.umi)

      const programConfig = {
        metadataUri: 'https://example.com/program.json',
        loyaltyProgramName: 'Transfer Test Program',
        pointsPerAction: { purchase: 10 },
        programAuthority: context.programAuthority,
        updateAuthority,
        tiers: [{ name: 'Grind', xpRequired: 0, rewards: ['Welcome'] }],
        metadata: { organizationName: 'Test Co' },
      }

      const { instruction: createProgram, collection } = createLoyaltyProgramInstruction(context, programConfig)
      await createProgram.sendAndConfirm(context.umi, { confirm: { commitment: 'confirmed' } })

      // Update context with collection address for subsequent operations
      context.collectionAddress = collection.publicKey

      const passConfig = {
        collectionAddress: collection.publicKey,
        recipient: recipient.publicKey,
        passName: 'Test Pass',
        passMetadataUri: 'https://example.com/pass.json',
        updateAuthority,
      }

      const { instruction: issuePass, asset } = issueLoyaltyPassInstruction(context, passConfig)
      await issuePass.sendAndConfirm(context.umi, { confirm: { commitment: 'confirmed' } })

      // Approve transfer
      const transferConfig = {
        passAddress: asset.publicKey,
        toAddress: publicKey('11111111111111111111111111111112'),
      }

      const { instruction } = approveTransferInstruction(context, transferConfig)
      const result = await instruction.sendAndConfirm(context.umi, { confirm: { commitment: 'confirmed' } })

      expect(result).toBeTruthy()
      expect(toBase58(result.signature)).toMatch(/^[1-9A-HJ-NP-Za-km-z]{86,88}$/)
    })
  })
})
