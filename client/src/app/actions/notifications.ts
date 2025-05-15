'use server'

import { createServerContextWithFeePayer } from '@/lib/methods/serverContext'
import { Network } from '@/lib/methods/serverProgram'
import { getProgramAuthorityAccount } from './program'
import { createSignerFromKeypair, publicKey } from '@metaplex-foundation/umi'
import { sendMessage, sendBroadcast } from '@verxioprotocol/core'
import { unstable_cache as cache } from 'next/cache'
import { convertSecretKeyToKeypair } from '@/lib/utils'

interface SendMessageInput {
  collectionAddress: string
  passAddress: string
  message: string
  network: string
}

interface SendBroadcastInput {
  collectionAddress: string
  message: string
  network: string
  recipients?: {
    type: 'all' | 'tier' | 'specific'
    value?: string[]
  }
}

export const sendMessageToPass = cache(async (input: SendMessageInput) => {
  try {
    const programAuthorityAccount = await getProgramAuthorityAccount(input.collectionAddress)
    if (!programAuthorityAccount) {
      throw new Error('Program authority account not found')
    }

    const serverContext = createServerContextWithFeePayer(
      input.collectionAddress,
      input.network as Network,
      programAuthorityAccount,
    )

    const programSigner = createSignerFromKeypair(serverContext.umi, convertSecretKeyToKeypair(programAuthorityAccount))
    const result = await sendMessage(serverContext, {
      passAddress: publicKey(input.passAddress),
      message: input.message,
      sender: serverContext.programAuthority,
      signer: programSigner,
    })

    return result
  } catch (error) {
    console.error('Error sending message:', error)
    throw new Error(error instanceof Error ? error.message : 'An unexpected error occurred')
  }
})

export const sendBroadcastToCollection = cache(async (input: SendBroadcastInput) => {
  try {
    const programAuthorityAccount = await getProgramAuthorityAccount(input.collectionAddress)
    if (!programAuthorityAccount) {
      throw new Error('Program authority account not found')
    }

    const serverContext = createServerContextWithFeePayer(
      input.collectionAddress,
      input.network as Network,
      programAuthorityAccount,
    )

    const programSigner = createSignerFromKeypair(serverContext.umi, convertSecretKeyToKeypair(programAuthorityAccount))
    const result = await sendBroadcast(serverContext, {
      collectionAddress: publicKey(input.collectionAddress),
      message: input.message,
      sender: serverContext.programAuthority,
      signer: programSigner,
    })

    return result
  } catch (error) {
    console.error('Error sending broadcast:', error)
    throw new Error(error instanceof Error ? error.message : 'An unexpected error occurred')
  }
})
