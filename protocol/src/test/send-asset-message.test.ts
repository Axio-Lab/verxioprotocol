import { describe, expect, it, beforeAll } from 'vitest'
import { generateSigner, keypairIdentity } from '@metaplex-foundation/umi'
import { createLoyaltyProgram } from '../lib/create-loyalty-program'
import { issueLoyaltyPass } from '../lib/issue-loyalty-pass'
import { sendMessage } from '../lib/send-asset-message'
import { markMessageRead } from '../lib/mark-message-read'
import { getAssetMessages } from '../lib/get-asset-messages'
import { DEFAULT_TIER, DEFAULT_PASS_DATA } from '../lib/constants'
import { getTestContext } from './helpers/get-test-context'
import { ensureFeePayerBalance } from './helpers/ensure-fee-payer-balance'
import { FEES } from '../utils/fee-structure'
import { updatePassData } from '../lib'
import { fetchAsset } from '@metaplex-foundation/mpl-core'

const { feePayer, context } = getTestContext()

describe('send-asset-message', { sequential: true, timeout: 30000 }, () => {
  let programAuthority: any
  let updateAuthority: any
  let collection: any
  let asset: any
  let recipient: any
  let sentMessages: any[] = []
  let appDataPlugin: any

  beforeAll(async () => {
    console.log('🚀 Starting test setup...')

    // Ensure we have enough sol for all operations
    await ensureFeePayerBalance(context.umi, {
      account: feePayer.publicKey,
      amount: 1 + FEES.CREATE_LOYALTY_PROGRAM,
    })
    context.umi.use(keypairIdentity(feePayer))

    programAuthority = generateSigner(context.umi)
    updateAuthority = generateSigner(context.umi)
    recipient = generateSigner(context.umi)

    console.log('📝 Creating loyalty program...')
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
    console.log('✅ Loyalty program created:', programResult.collection.publicKey.toString())

    collection = programResult.collection
    context.collectionAddress = collection.publicKey

    console.log('🎫 Issuing loyalty pass...')
    // Issue loyalty pass
    const passResult = await issueLoyaltyPass(context, {
      collectionAddress: collection.publicKey,
      recipient: recipient.publicKey,
      passName: 'Test Pass',
      passMetadataUri: 'https://example.com/pass',
      updateAuthority,
    })
    console.log('✅ Loyalty pass issued:', passResult.asset.publicKey.toString())

    asset = passResult.asset

    // Get the app data plugin
    const assetData = await fetchAsset(context.umi, asset.publicKey)
    appDataPlugin = assetData?.appDatas?.[0]
    if (!appDataPlugin) {
      throw new Error('AppData plugin not found')
    }

    console.log('📊 Initializing pass data...')
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
    console.log('✅ Pass data initialized')
  })

  describe('Message Flow', () => {
    it('should handle complete message flow', async () => {
      console.log('\n📨 Starting message flow test...')

      // Send 3 messages
      const messages = ['First test message', 'Second test message', 'Third test message']

      console.log('\n📤 Sending messages...')
      for (const message of messages) {
        console.log(`\nSending message: "${message}"`)
        const result = await sendMessage(context, {
          passAddress: asset.publicKey,
          message,
          sender: programAuthority.publicKey,
          signer: updateAuthority,
        })
        console.log('✅ Message sent:', {
          id: result.message.id,
          content: result.message.content,
          timestamp: new Date(result.message.timestamp).toISOString(),
        })
        sentMessages.push(result.message)
        // Add a small delay between messages
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }

      // Get current messages before marking as read
      const currentMessages = await getAssetMessages(context, asset.publicKey)
      console.log('\n📥 Current messages before marking as read:', currentMessages.messages.length)

      // Mark first message as read
      console.log('\n📖 Marking first message as read...')
      const messageToMark = sentMessages[0]
      await markMessageRead(context, {
        passAddress: asset.publicKey,
        messageId: messageToMark.id,
        signer: updateAuthority,
      })
      console.log('✅ Message marked as read:', messageToMark.id)

      // Update pass data with marked message
      await updatePassData(context, asset.publicKey, updateAuthority, appDataPlugin, {
        xp: 0,
        action: 'read_message',
        points: 0,
        currentData: {
          ...DEFAULT_PASS_DATA,
          messageHistory: currentMessages.messages.map((msg) =>
            msg.id === messageToMark.id ? { ...msg, read: true } : msg,
          ),
        },
        newTier: DEFAULT_TIER,
      })

      // Wait for transaction to be confirmed
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Get all messages
      console.log('\n📥 Getting all messages...')
      const allMessages = await getAssetMessages(context, asset.publicKey)
      console.log('\n📊 Message Stats:', {
        total: allMessages.stats.total,
        unread: allMessages.stats.unread,
        read: allMessages.stats.read,
      })
      console.log(
        '\n📝 Messages:',
        allMessages.messages.map((msg) => ({
          id: msg.id,
          content: msg.content,
          read: msg.read,
          timestamp: new Date(msg.timestamp).toISOString(),
        })),
      )

      // Verify results
      expect(allMessages.stats.total).toBe(3)
      expect(allMessages.stats.unread).toBe(2)
      expect(allMessages.stats.read).toBe(1)
      expect(allMessages.messages).toHaveLength(3)
      expect(allMessages.messages[0].read).toBe(true)
      expect(allMessages.messages[1].read).toBe(false)
      expect(allMessages.messages[2].read).toBe(false)
    })
  })
})
