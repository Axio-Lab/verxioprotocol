'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Users, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useNetwork } from '@/lib/network-context'
import { getProgramMembers, Member } from '@/app/actions/program'

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [expandedMember, setExpandedMember] = useState<string | null>(null)
  const { publicKey: walletPublicKey } = useWallet()
  const { network } = useNetwork()

  const MEMBERS_PER_PAGE = 10
  const totalPages = Math.ceil(members.length / MEMBERS_PER_PAGE)
  const startIndex = (currentPage - 1) * MEMBERS_PER_PAGE
  const endIndex = startIndex + MEMBERS_PER_PAGE
  const currentMembers = members.slice(startIndex, endIndex)

  useEffect(() => {
    async function fetchMembers() {
      if (!walletPublicKey || !network) return

      setIsLoading(true)
      try {
        const data = await getProgramMembers(walletPublicKey.toString(), network)
        setMembers(data)
      } catch (error) {
        console.error('Error fetching members:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMembers()
  }, [walletPublicKey, network])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-purple-950/20 to-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-verxio-purple mx-auto" />
          <p className="text-white/70 orbitron">Loading members...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#00FFE0] via-[#0085FF] to-[#7000FF] text-transparent bg-clip-text orbitron">
          Members
        </h1>
      </div>

      {members.length === 0 ? (
        <Card className="bg-black/20 backdrop-blur-sm border-slate-800/20">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-[#00FFE0] mb-4" />
            <h2 className="text-xl font-semibold text-white orbitron mb-2">No Members Yet</h2>
            <p className="text-white/70 text-center max-w-md">
              No one has joined your loyalty programs yet. Share your programs to get members!
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4">
            {currentMembers.map((member, index) => (
              <Card
                key={member.address}
                className="bg-gradient-to-r from-[#00FFE0]/10 via-[#0085FF]/10 to-[#7000FF]/10 backdrop-blur-sm border border-[#00FFE0]/20 transition-all hover:scale-[1.02]"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#00FFE0] via-[#0085FF] to-[#7000FF] flex items-center justify-center">
                        <span className="text-white font-bold">{index + 1 + startIndex}</span>
                      </div>
                      <div className="flex flex-col">
                        <CardTitle className="text-white font-mono text-sm">{member.address}</CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-white/50 text-xs">Total XP:</span>
                          <span className="text-white/70 text-xs orbitron">{member.totalXp.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setExpandedMember(expandedMember === member.address ? null : member.address)}
                      className="text-white/70 hover:text-white transition-colors"
                    >
                      {expandedMember === member.address ? (
                        <ChevronLeft className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </CardHeader>
                {expandedMember === member.address && (
                  <CardContent>
                    <div className="space-y-4">
                      {member.passes.map((pass) => (
                        <div key={pass.publicKey} className="border-t border-slate-800/20 pt-4">
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="text-white font-medium">{pass.name}</h3>
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-[#0085FF]" />
                              <span className="text-white/70">Tier: {pass.currentTier}</span>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-white/70">Current XP</p>
                              <p className="text-white">{pass.xp}</p>
                            </div>
                            <div>
                              <p className="text-sm text-white/70">Last Action</p>
                              <p className="text-white">{pass.lastAction || 'No actions yet'}</p>
                            </div>
                          </div>
                          {pass.actionHistory.length > 0 && (
                            <div className="mt-4">
                              <p className="text-sm text-white/70 mb-2">Recent Actions</p>
                              <div className="space-y-2">
                                {pass.actionHistory.slice(0, 3).map((action, index) => (
                                  <div key={index} className="flex justify-between text-sm">
                                    <span className="text-white/70">{action.type}</span>
                                    <span className="text-white">+{action.points} XP</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
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
