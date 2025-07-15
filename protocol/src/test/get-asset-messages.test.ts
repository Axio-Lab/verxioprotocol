import { describe, expect, it, beforeAll } from 'vitest'
import { generateSigner, keypairIdentity, publicKey } from '@metaplex-foundation/umi'
import { createLoyaltyProgram } from '../lib/create-loyalty-program'
import { issueLoyaltyPass } from '../lib/issue-loyalty-pass'
import { sendMessage } from '../lib/send-asset-message'
import { markMessageRead } from '../lib/mark-message-read'
import { getAssetMessages } from '../lib/get-asset-messages'
import { DEFAULT_TIER, DEFAULT_PASS_DATA } from '../lib/constants'
import { getTestContext } from './helpers/get-test-context'
import { ensureFeePayerBalance } from './helpers/ensure-fee-payer-balance'
import { updatePassData } from '../lib'
import { fetchAsset } from '@metaplex-foundation/mpl-core'

const { feePayer, context } = getTestContext()

describe('getAssetMessages', { sequential: true, timeout: 30000 }, () => {
  let programAuthority: any
  let updateAuthority: any
  let collection: any
  let asset: any
  let recipient: any
  let sentMessages: any[] = []

  beforeAll(async () => {
    // Ensure we have enough sol for all operations
    await ensureFeePayerBalance(context.umi, {
      account: feePayer.publicKey,
      amount: 1,
    })
    context.umi.use(keypairIdentity(feePayer))

    programAuthority = generateSigner(context.umi)
    updateAuthority = generateSigner(context.umi)
    recipient = generateSigner(context.umi)

    // Create loyalty program
    const programResult = await createLoyaltyProgram(context, {
      metadataUri: 'https://example.com/metadata',
      loyaltyProgramName: 'Test Program',
      pointsPerAction: { test: 10 },
      programAuthority: programAuthority.publicKey,
      updateAuthority,
      tiers: [DEFAULT_TIER],
      metadata: {
        organizationName: 'Test Org',
      },
    })

    collection = programResult.collection

    // Set collection address in context
    context.collectionAddress = collection.publicKey

    // Issue loyalty pass
    const passResult = await issueLoyaltyPass(context, {
      collectionAddress: collection.publicKey,
      recipient: recipient.publicKey,
      passName: 'Test Pass',
      passMetadataUri: 'https://arweave.net/123abc',
      updateAuthority,
      organizationName: 'Test Organization',
    })

    asset = passResult.asset

    // Get the app data plugin
    const assetData = await fetchAsset(context.umi, asset.publicKey)
    const appDataPlugin = assetData?.appDatas?.[0]
    if (!appDataPlugin) {
      throw new Error('AppData plugin not found')
    }

    // Initialize pass data with default values
    await updatePassData(context, asset.publicKey, updateAuthority, appDataPlugin, {
      xp: 0,
      action: 'init',
      points: 0,
      currentData: {
        ...DEFAULT_PASS_DATA,
        messageHistory: [],
      },
      newTier: DEFAULT_TIER,
    })

    // Send test messages one by one with delays
    const messages = ['First test message', 'Second test message', 'Third test message']

    for (const message of messages) {
      const result = await sendMessage(context, {
        passAddress: asset.publicKey,
        message,
        sender: programAuthority.publicKey,
        signer: updateAuthority,
      })
      sentMessages.push(result.message)
      // Add a small delay between messages to prevent transaction size issues
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    // Mark first message as read
    await markMessageRead(context, {
      passAddress: asset.publicKey,
      messageId: sentMessages[0].id,
      signer: updateAuthority,
    })
  })

  it('should successfully get messages with correct stats', async () => {
    const result = await getAssetMessages(context, asset.publicKey)

    expect(result.stats).toBeDefined()
    expect(result.stats.total).toBe(3)
    expect(result.stats.unread).toBe(3) // All messages are unread
    expect(result.stats.read).toBe(0) // No messages are read
    expect(result.messages).toHaveLength(3)

    // Verify message content and order (oldest first)
    expect(result.messages[0].content).toBe('First test message')
    expect(result.messages[0].read).toBe(false) // All messages are unread
    expect(result.messages[1].content).toBe('Second test message')
    expect(result.messages[1].read).toBe(false)
    expect(result.messages[2].content).toBe('Third test message')
    expect(result.messages[2].read).toBe(false)
  })

  it('should throw error when pass not found', async () => {
    const nonExistentPass = publicKey('11111111111111111111111111111111')

    await expect(getAssetMessages(context, nonExistentPass)).rejects.toThrow('The account at the provided address')
  })

  it('should return empty stats for new pass', async () => {
    // Create a new pass without any messages
    const newPassResult = await issueLoyaltyPass(context, {
      collectionAddress: collection.publicKey,
      recipient: recipient.publicKey,
      passName: 'New Test Pass',
      passMetadataUri: 'https://arweave.net/123abc',
      updateAuthority,
      organizationName: 'Test Organization',
    })

    // Get the app data plugin for the new pass
    const newAssetData = await fetchAsset(context.umi, newPassResult.asset.publicKey)
    const newAppDataPlugin = newAssetData?.appDatas?.[0]
    if (!newAppDataPlugin) {
      throw new Error('AppData plugin not found')
    }

    // Initialize pass data with default values
    await updatePassData(context, newPassResult.asset.publicKey, updateAuthority, newAppDataPlugin, {
      xp: 0,
      action: 'init',
      points: 0,
      currentData: {
        ...DEFAULT_PASS_DATA,
        messageHistory: [],
      },
      newTier: DEFAULT_TIER,
    })

    const result = await getAssetMessages(context, newPassResult.asset.publicKey)

    expect(result.stats.total).toBe(0)
    expect(result.stats.unread).toBe(0)
    expect(result.stats.read).toBe(0)
    expect(result.messages).toHaveLength(0)
  })

  it('should handle pass with no message history', async () => {
    // Create a pass and initialize it without any messages
    const noMessagesPass = await issueLoyaltyPass(context, {
      collectionAddress: collection.publicKey,
      recipient: recipient.publicKey,
      passName: 'No Messages Pass',
      passMetadataUri: 'https://arweave.net/123abc',
      updateAuthority,
      organizationName: 'Test Organization',
    })

    const noMessagesAssetData = await fetchAsset(context.umi, noMessagesPass.asset.publicKey)
    const noMessagesAppDataPlugin = noMessagesAssetData?.appDatas?.[0]
    if (!noMessagesAppDataPlugin) {
      throw new Error('AppData plugin not found')
    }

    // Initialize with empty message history
    await updatePassData(context, noMessagesPass.asset.publicKey, updateAuthority, noMessagesAppDataPlugin, {
      xp: 0,
      action: 'init',
      points: 0,
      currentData: {
        ...DEFAULT_PASS_DATA,
        messageHistory: [],
      },
      newTier: DEFAULT_TIER,
    })

    const result = await getAssetMessages(context, noMessagesPass.asset.publicKey)

    expect(result.stats.total).toBe(0)
    expect(result.stats.unread).toBe(0)
    expect(result.stats.read).toBe(0)
    expect(result.messages).toHaveLength(0)
  })
})
