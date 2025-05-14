import { getVerxioPass, getVerxioProgram, createReadOnlyServerContext } from '@/lib/methods/serverContext'
import { Network } from '@/lib/network-context'
import { publicKey } from '@metaplex-foundation/umi'

export interface LeaderboardMember {
  address: string
  assetAddress: string
  totalXp: number
  lastAction: string | null
  rank: number
  currentTier: string
  currentLevel: string
  level: number
}

export interface LeaderboardResponse {
  members: LeaderboardMember[]
  programName: string
  totalMinted: number
  totalMembers: number
}

interface NFTAsset {
  id: string
  ownership: {
    owner: string
  }
}

export async function getLeaderboard(collectionAddress: string, network: Network): Promise<LeaderboardResponse> {
  try {
    if (!collectionAddress) {
      throw new Error('Collection address is required')
    }

    const serverContext = createReadOnlyServerContext(collectionAddress, network)
    let allNFTs: NFTAsset[] = []
    let page = 1
    let hasMore = true

    // Fetch all NFTs from the collection
    while (hasMore) {
      const response = await fetch(serverContext.umi.rpc.getEndpoint(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getAssetsByGroup',
          params: {
            groupKey: 'collection',
            groupValue: collectionAddress,
            page: page,
            limit: 1000,
          },
        }),
      })

      const data = await response.json()

      if (!data.result?.items?.length) {
        hasMore = false
      } else {
        allNFTs = [...allNFTs, ...data.result.items]
        page++
      }

      // Add delay to avoid rate limits
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    // Group NFTs by owner and calculate total XP
    const members: LeaderboardMember[] = await Promise.all(
      Object.entries(
        allNFTs.reduce(
          (acc, nft) => {
            const owner = nft.ownership.owner
            if (!acc[owner]) {
              acc[owner] = []
            }
            acc[owner].push(nft)
            return acc
          },
          {} as Record<string, NFTAsset[]>,
        ),
      ).map(async ([address, memberNFTs]) => {
        let totalXp = 0
        let lastAction: string | null = null
        let currentTier = ''
        let rewardTiers: Array<{ name: string; xpRequired: number; rewards: string[] }> = []

        // Get XP, last action, and rewardTiers for each NFT
        for (const nft of memberNFTs) {
          try {
            const passData = await getVerxioPass(collectionAddress, network, publicKey(nft.id))
            if (passData) {
              totalXp += passData.xp
              if (passData.lastAction && (!lastAction || passData.lastAction > lastAction)) {
                lastAction = passData.lastAction
              }
              // Use the tier from the first valid pass
              if (!currentTier) {
                currentTier = passData.currentTier
              }
              // Use the rewardTiers from the first valid pass
              if (!rewardTiers.length && passData.rewardTiers && passData.rewardTiers.length) {
                rewardTiers = passData.rewardTiers
              }
            }
          } catch (error) {
            console.error(`Error fetching details for pass ${nft.id}:`, error)
          }
        }

        // Level calculation
        let level = 1
        let matchedTier = rewardTiers[0]?.name || ''
        for (let i = 0; i < rewardTiers.length; i++) {
          if (totalXp >= rewardTiers[i].xpRequired) {
            level = i + 1
            matchedTier = rewardTiers[i].name
          }
        }

        // Handle the "Grind" base case
        if (totalXp === 0 || matchedTier.toLowerCase() === 'grind') {
          level = 0
          matchedTier = 'Grind'
        }

        return {
          address,
          assetAddress: memberNFTs[0]?.id || '',
          totalXp,
          lastAction,
          currentTier: matchedTier, // The tier name for the current level
          currentLevel: level.toString(),
          level,
          rank: 0,
        }
      }),
    )

    // Sort members by total XP in descending order
    const sortedMembers = members.sort((a, b) => b.totalXp - a.totalXp)

    // Assign ranks
    sortedMembers.forEach((member, index) => {
      member.rank = index + 1
    })

    const programData = await getVerxioProgram(collectionAddress, network, publicKey(collectionAddress))

    return {
      members: sortedMembers,
      programName: programData.name,
      totalMinted: allNFTs.length,
      totalMembers: sortedMembers.length,
    }
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    throw new Error('Failed to fetch leaderboard')
  }
}
