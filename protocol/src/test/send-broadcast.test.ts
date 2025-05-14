import { generateSigner, keypairIdentity } from '@metaplex-foundation/umi'
import { describe, expect, it, beforeAll } from 'vitest'
import { createTestLoyaltyProgram } from './helpers/create-test-loyalty-program'
import { getTestContext } from './helpers/get-test-context'
import { ensureFeePayerBalance } from './helpers/ensure-fee-payer-balance'
import { sendBroadcast } from '../lib/send-broadcast'
import { getProgramDetails } from '../lib/get-program-details'
import { markBroadcastRead } from '../lib/mark-broadcast-read'
import { FEES } from '../utils/fee-structure'

const { feePayer, context } = getTestContext()

describe('send-broadcast', { sequential: true, timeout: 30000 }, () => {
  let collection: any
  let updateAuthority: any

  beforeAll(async () => {
    console.log('🚀 Starting test setup...')

    // Ensure we have enough sol for all operations
    await ensureFeePayerBalance(context.umi, {
      account: feePayer.publicKey,
      amount: 1 + FEES.CREATE_LOYALTY_PROGRAM,
    })
    context.umi.use(keypairIdentity(feePayer))

    // Create a test loyalty program
    const result = await createTestLoyaltyProgram(context)
    collection = result.collection
    updateAuthority = result.updateAuthority
    context.collectionAddress = collection.publicKey

    console.log('✅ Test setup complete')
  })

  describe('expected usage', () => {
    it('should send a broadcast and update program details', async () => {
      console.log('\n📨 Starting broadcast test...')

      // Get initial program details
      console.log('\n📊 Initial program details:')
      const initialDetails = await getProgramDetails(context)
      console.log('Initial broadcasts:', initialDetails)

      // Send broadcast
      const message = 'Welcome to our loyalty program! This is a test broadcast.'
      console.log('\n📤 Sending broadcast:', message)

      const result = await sendBroadcast(context, {
        collectionAddress: collection.publicKey,
        message,
        sender: updateAuthority.publicKey,
        signer: updateAuthority,
      })

      console.log('✅ Broadcast sent: ', {
        signature: result.signature,
        broadcast: result.broadcast,
      })

      // Get updated program details
      console.log('\n📊 Updated program details:')
      const updatedDetails = await getProgramDetails(context)
      console.log('Updated broadcasts:', updatedDetails.broadcasts)

      // Verify results
      expect(result.signature).toBeDefined()
      expect(result.broadcast).toBeDefined()
      expect(result.broadcast.content).toBe(message)
      expect(result.broadcast.sender).toBe(updateAuthority.publicKey.toString())
      expect(result.broadcast.timestamp).toBeDefined()
      expect(result.broadcast.id).toBeDefined()
      expect(result.broadcast.read).toBe(false)

      // Verify program details were updated
      expect(updatedDetails.broadcasts.broadcasts).toHaveLength(1)
      expect(updatedDetails.broadcasts.totalBroadcasts).toBe(1)
      expect(updatedDetails.broadcasts.broadcasts[0].content).toBe(message)
      expect(updatedDetails.broadcasts.broadcasts[0].sender).toBe(updateAuthority.publicKey.toString())
      expect(updatedDetails.broadcasts.broadcasts[0].read).toBe(false)

      // Mark broadcast as read
      console.log('\n📖 Marking broadcast as read...')
      const markReadResult = await markBroadcastRead(context, {
        collectionAddress: collection.publicKey,
        broadcastId: result.broadcast.id,
        signer: updateAuthority,
      })
      console.log('✅ Broadcast marked as read:', markReadResult.signature)

      // Wait for transaction to be confirmed
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Get final program details
      console.log('\n📊 Final program details:')
      const finalDetails = await getProgramDetails(context)
      console.log('Final broadcasts:', finalDetails.broadcasts)

      // Verify broadcast was marked as read
      expect(finalDetails.broadcasts.broadcasts[0].read).toBe(true)
    })

    it('should send multiple broadcasts', async () => {
      console.log('\n📨 Starting multiple broadcast test...')

      const messages = ['First test broadcast', 'Second test broadcast', 'Third test broadcast']

      // Get initial program details
      console.log('\n📊 Initial program details:')
      const initialDetails = await getProgramDetails(context)
      console.log('Initial broadcasts:', initialDetails.broadcasts)

      // Send multiple broadcasts
      for (const message of messages) {
        console.log(`\n📤 Sending broadcast: "${message}"`)
        const result = await sendBroadcast(context, {
          collectionAddress: collection.publicKey,
          message,
          sender: updateAuthority.publicKey,
          signer: updateAuthority,
        })
        console.log('✅ Broadcast sent:', {
          signature: result.signature,
          broadcast: result.broadcast,
        })
        // Add a small delay between broadcasts
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }

      // Wait for final transaction to be confirmed
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Get updated program details
      console.log('\n📊 Updated program details:')
      const updatedDetails = await getProgramDetails(context)
      console.log('Updated broadcasts:', updatedDetails.broadcasts)

      // Verify results
      expect(updatedDetails.broadcasts.broadcasts).toHaveLength(4) // 3 new + 1 from previous test
      expect(updatedDetails.broadcasts.totalBroadcasts).toBe(4)

      // Verify the last three broadcasts
      const lastThreeBroadcasts = updatedDetails.broadcasts.broadcasts.slice(-3)
      expect(lastThreeBroadcasts.map((b) => b.content)).toEqual(messages)
      expect(lastThreeBroadcasts.every((b) => b.read === false)).toBe(true)

      // Mark first broadcast as read
      console.log('\n📖 Marking first broadcast as read...')
      const firstBroadcast = updatedDetails.broadcasts.broadcasts[0]
      const markReadResult = await markBroadcastRead(context, {
        collectionAddress: collection.publicKey,
        broadcastId: firstBroadcast.id,
        signer: updateAuthority,
      })
      console.log('✅ Broadcast marked as read:', markReadResult.signature)

      // Wait for transaction to be confirmed
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Get final program details
      console.log('\n📊 Final program details:')
      const finalDetails = await getProgramDetails(context)
      console.log('Final broadcasts:', finalDetails.broadcasts)

      // Verify first broadcast was marked as read
      expect(finalDetails.broadcasts.broadcasts[0].read).toBe(true)
      // Verify other broadcasts are still unread
      expect(finalDetails.broadcasts.broadcasts.slice(1).every((b) => b.read === false)).toBe(true)
    })
  })

  describe('unexpected usage', () => {
    it('should throw an error if collection address is invalid', async () => {
      expect.assertions(2)
      const invalidAddress = generateSigner(context.umi).publicKey

      try {
        await sendBroadcast(context, {
          collectionAddress: invalidAddress,
          message: 'Test message',
          sender: updateAuthority.publicKey,
          signer: updateAuthority,
        })
        expect(true).toBe(false) // Should not reach here
      } catch (error) {
        expect(error).toBeDefined()
        expect(error.message).toContain('The account of type [CollectionV1] was not found')
      }
    })

    it('should throw an error if message is empty', async () => {
      expect.assertions(2)

      try {
        await sendBroadcast(context, {
          collectionAddress: collection.publicKey,
          message: '',
          sender: updateAuthority.publicKey,
          signer: updateAuthority,
        })
        expect(true).toBe(false) // Should not reach here
      } catch (error) {
        expect(error).toBeDefined()
        expect(error.message).toContain('Message is undefined or empty')
      }
    })

    it('should throw an error if broadcast ID is invalid', async () => {
      expect.assertions(2)

      try {
        await markBroadcastRead(context, {
          collectionAddress: collection.publicKey,
          broadcastId: 'invalid-id',
          signer: updateAuthority,
        })
        expect(true).toBe(false) // Should not reach here
      } catch (error) {
        expect(error).toBeDefined()
        expect(error.message).toContain('Broadcast not found')
      }
    })
  })
})
