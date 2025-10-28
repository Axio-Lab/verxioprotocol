'use server'

import { createSignerFromKeypair, generateSigner } from '@metaplex-foundation/umi'
import { issueNewLoyaltyPass } from '@/lib/methods/issueLoyaltyPass'
import { awardPoints, revokePoints, giftPoints } from '@/lib/methods/manageLoyaltyPoints'
import { convertSecretKeyToKeypair } from '@/lib/utils'
import { getPassCollection, storeLoyaltyPass } from './loyalty'
import { getProgramAuthorityAccount } from './program'
import { unstable_cache as cache } from 'next/cache'
import bs58 from 'bs58'
import { Network } from '@/lib/methods/serverProgram'
import { createServerContextWithFeePayer } from '@/lib/methods/serverContext'

interface IssuePassInput {
  collectionAddress: string
  recipient: string
  passName: string
  passMetadataUri: string
  network: string
}

interface AwardPointsInput {
  passAddress: string
  action: string
  network: string
}

interface GiftPointsInput {
  passAddress: string
  pointsToGift: number
  action: string
  network: string
}

interface RevokePointsInput {
  passAddress: string
  pointsToRevoke: number
  network: string
}

export const issuePasses = cache(async (inputs: IssuePassInput[]) => {
  try {
    const results = await Promise.all(
      inputs.map(async (input) => {
        const programAuthorityAccount = await getProgramAuthorityAccount(input.collectionAddress)
        if (!programAuthorityAccount) {
          throw new Error('Program authority account not found')
        }
        const serverContext = createServerContextWithFeePayer(
          input.collectionAddress,
          input.network as Network,
          programAuthorityAccount,
        )

        const programSigner = createSignerFromKeypair(
          serverContext.umi,
          convertSecretKeyToKeypair(programAuthorityAccount),
        )
        const assetSigner = generateSigner(serverContext.umi)
        const result = await issueNewLoyaltyPass(serverContext, {
          collectionAddress: input.collectionAddress,
          recipient: input.recipient,
          passName: input.passName,
          passMetadataUri: input.passMetadataUri,
          assetSigner,
          updateAuthority: programSigner,
        })

        await storeLoyaltyPass({
          collection: input.collectionAddress,
          recipient: input.recipient,
          publicKey: result.asset.publicKey.toString(),
          privateKey: bs58.encode(result.asset.secretKey),
          signature: result.signature,
          network: input.network,
        })

        return {
          publicKey: result.asset.publicKey.toString(),
          signature: result.signature,
        }
      }),
    )

    return results
  } catch (error) {
    console.error('Error issuing passes:', error)
    if (
      error instanceof Error &&
      error.message.includes('Attempt to debit an account but found no record of a prior credit')
    ) {
      throw new Error("Contact owner to top up loyalty program's fee account to continue")
    }
    throw new Error(error instanceof Error ? error.message : 'An unexpected error occurred')
  }
})

export const awardPointsToPasses = cache(async (inputs: AwardPointsInput[]) => {
  try {
    const results = await Promise.all(
      inputs.map(async (input) => {
        const collectionAddress = await getPassCollection(input.passAddress)
        const programAuthorityAccount = await getProgramAuthorityAccount(collectionAddress)
        if (!programAuthorityAccount) {
          throw new Error('Program authority account not found')
        }
        const serverContext = createServerContextWithFeePayer(
          collectionAddress,
          input.network as Network,
          programAuthorityAccount,
        )
        const programSigner = createSignerFromKeypair(
          serverContext.umi,
          convertSecretKeyToKeypair(programAuthorityAccount),
        )
        return await awardPoints(serverContext, {
          passAddress: input.passAddress,
          action: input.action,
          signer: programSigner,
        })
      }),
    )

    return results
  } catch (error) {
    console.error('Error awarding points:', error)
    throw new Error(error instanceof Error ? error.message : 'An unexpected error occurred')
  }
})

export const giftPointsToPasses = cache(async (inputs: GiftPointsInput[]) => {
  try {
    const results = await Promise.all(
      inputs.map(async (input) => {
        const collectionAddress = await getPassCollection(input.passAddress)
        const programAuthorityAccount = await getProgramAuthorityAccount(collectionAddress)
        if (!programAuthorityAccount) {
          throw new Error('Program authority account not found')
        }
        const serverContext = createServerContextWithFeePayer(
          collectionAddress,
          input.network as Network,
          programAuthorityAccount,
        )
        const programSigner = createSignerFromKeypair(
          serverContext.umi,
          convertSecretKeyToKeypair(programAuthorityAccount),
        )

        return await giftPoints(serverContext, {
          passAddress: input.passAddress,
          pointsToGift: input.pointsToGift,
          signer: programSigner,
          action: input.action,
        })
      }),
    )

    return results
  } catch (error) {
    console.error('Error gifting points:', error)
    throw new Error(error instanceof Error ? error.message : 'An unexpected error occurred')
  }
})

export const revokePointsFromPasses = cache(async (inputs: RevokePointsInput[]) => {
  try {
    const results = await Promise.all(
      inputs.map(async (input) => {
        const collectionAddress = await getPassCollection(input.passAddress)
        const programAuthorityAccount = await getProgramAuthorityAccount(collectionAddress)
        if (!programAuthorityAccount) {
          throw new Error('Program authority account not found')
        }
        const serverContext = createServerContextWithFeePayer(
          collectionAddress,
          input.network as Network,
          programAuthorityAccount,
        )
        const programSigner = createSignerFromKeypair(
          serverContext.umi,
          convertSecretKeyToKeypair(programAuthorityAccount),
        )

        return await revokePoints(serverContext, {
          passAddress: input.passAddress,
          pointsToRevoke: input.pointsToRevoke,
          signer: programSigner,
        })
      }),
    )

    return results
  } catch (error) {
    console.error('Error revoking points:', error)
    throw new Error(error instanceof Error ? error.message : 'An unexpected error occurred')
  }
})
