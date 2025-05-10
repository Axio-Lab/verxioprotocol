import { Font, LeaderboardBuilder } from 'canvacord'
import { LeaderboardMember } from './getLeaderboard'

interface LeaderboardImageData {
  collectionName: string
  totalMinted: number
  totalMembers: number
  members: LeaderboardMember[]
  backgroundImage?: string
  headerImage?: string
  defaultAvatar?: string
}

export async function createImageLeaderboard(data: LeaderboardImageData): Promise<Buffer> {
  // Load font
  Font.loadDefault()

  const background =
    data.backgroundImage ||
    'https://images.unsplash.com/photo-1634330902537-64a3ccb601ff?q=80&w=2624&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  const headerImage = data.headerImage || 'https://github.com/neplextech.png'
  let avatars: string[] = []

  if (data.defaultAvatar) {
    try {
      // Try to fetch as JSON
      const res = await fetch(data.defaultAvatar)
      const contentType = res.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        avatars = (await res.json()) as string[]
      } else {
        // Not JSON, treat as single image URL
        avatars = [data.defaultAvatar]
      }
    } catch {
      // Fallback to single image URL if fetch fails
      avatars = [data.defaultAvatar]
    }
  } else {
    avatars = ['https://github.com/notunderctrl.png']
  }

  // Create leaderboard
  const lb = new LeaderboardBuilder()
    .setHeader({
      title: data.collectionName,
      subtitle: `${data.totalMinted} minted • ${data.totalMembers} members`,
      image: headerImage,
    })
    .setPlayers(
      data.members.slice(0, 10).map((member, idx) => ({
        username: member.address.slice(0, 8).toLowerCase() + '...' + member.address.slice(-4).toLowerCase(),
        displayName: member.assetAddress.slice(0, 8) + '...' + member.assetAddress.slice(-4).toLowerCase(),
        level: member.level,
        xp: member.totalXp,
        rank: member.rank,
        avatar: avatars[idx % avatars.length],
      })),
    )
    .setBackground(background)
    .setVariant('default')

  return (await lb.build({ format: 'png' })) as Buffer
}
