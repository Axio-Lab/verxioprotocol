'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Trophy, Medal, Crown, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useNetwork } from '@/lib/network-context'
import { getLeaderboard, LeaderboardMember } from '@/app/actions/leaderboard'

export default function LeaderboardPage() {
  const [members, setMembers] = useState<LeaderboardMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const { publicKey: walletPublicKey } = useWallet()
  const { network } = useNetwork()

  const MEMBERS_PER_PAGE = 10
  const totalPages = Math.ceil(members.length / MEMBERS_PER_PAGE)
  const startIndex = (currentPage - 1) * MEMBERS_PER_PAGE
  const endIndex = startIndex + MEMBERS_PER_PAGE
  const currentMembers = members.slice(startIndex, endIndex)

  useEffect(() => {
    async function fetchLeaderboard() {
      if (!walletPublicKey || !network) return

      setIsLoading(true)
      try {
        const data = await getLeaderboard(walletPublicKey.toString(), network)
        setMembers(data)
      } catch (error) {
        console.error('Error fetching leaderboard:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLeaderboard()
  }, [walletPublicKey, network])

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="relative">
            <Trophy className="h-8 w-8 text-[#00FFE0] animate-pulse" />
            <Sparkles className="absolute -top-2 -right-2 h-4 w-4 text-[#00FFE0] animate-spin" />
          </div>
        )
      case 2:
        return <Medal className="h-8 w-8 text-[#0085FF]" />
      case 3:
        return <Crown className="h-8 w-8 text-[#7000FF]" />
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#00FFE0] via-[#0085FF] to-[#7000FF] flex items-center justify-center">
            <span className="text-white font-bold">{rank}</span>
          </div>
        )
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-[#00FFE0]/10 via-[#0085FF]/10 to-[#7000FF]/10 border-[#00FFE0]/20'
      case 2:
        return 'bg-gradient-to-r from-[#00FFE0]/10 via-[#0085FF]/10 to-[#7000FF]/10 border-[#0085FF]/20'
      case 3:
        return 'bg-gradient-to-r from-[#00FFE0]/10 via-[#0085FF]/10 to-[#7000FF]/10 border-[#7000FF]/20'
      default:
        return 'bg-gradient-to-r from-[#00FFE0]/10 via-[#0085FF]/10 to-[#7000FF]/10 border-[#00FFE0]/20'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-purple-950/20 to-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-verxio-purple mx-auto" />
          <p className="text-white/70 orbitron">Loading leaderboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#00FFE0] via-[#0085FF] to-[#7000FF] text-transparent bg-clip-text orbitron">
          Leaderboard
        </h1>
      </div>

      {members.length === 0 ? (
        <Card className="bg-black/20 backdrop-blur-sm border-slate-800/20">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Trophy className="h-12 w-12 text-[#00FFE0] mb-4" />
            <h2 className="text-xl font-semibold text-white orbitron mb-2">No Members Yet</h2>
            <p className="text-white/70 text-center max-w-md">
              No one has joined your loyalty programs yet. Share your programs to get members!
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4">
            {currentMembers.map((member) => (
              <Card
                key={member.address}
                className={`${getRankColor(member.rank)} backdrop-blur-sm border transition-all hover:scale-[1.02]`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {getRankBadge(member.rank)}
                      <div className="flex flex-col">
                        <CardTitle className="text-white font-mono text-sm">{member.address}</CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-white/50 text-xs">Last Action:</span>
                          <span className="text-white/70 text-xs orbitron">
                            {member.lastAction || 'No actions yet'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex flex-col items-end">
                        <span className="text-white/50 text-xs">Total XP</span>
                        <span className="text-white font-bold text-lg orbitron">{member.totalXp.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <button
                className="bg-gradient-to-r from-[#00FFE0] via-[#0085FF] to-[#7000FF] text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-white/70 text-sm orbitron">
                Page {currentPage} of {totalPages}
              </span>
              <button
                className="bg-gradient-to-r from-[#00FFE0] via-[#0085FF] to-[#7000FF] text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
