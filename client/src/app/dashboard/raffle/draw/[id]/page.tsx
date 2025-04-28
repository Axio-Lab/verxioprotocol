'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Raffle } from '@/types/raffle'
import { useWallet } from '@solana/wallet-adapter-react'
// import { Helius } from 'helius-sdk'
import { Wheel } from '@/components/raffle/Wheel'
import { ArrowLeft } from 'lucide-react'

// Demo addresses for testing
const DEMO_ADDRESSES = [
  '8x8j5K9vPQY6p4wXUY7o7v7v7v7v7v7v7v7v7v7v7v7v',
  '9y9k6L0vQRZ7q5wYVZ8p8w8w8w8w8w8w8w8w8w8w8w',
  '0z0l7M1vRSa8r6xWa9q9x9x9x9x9x9x9x9x9x9x9x9x',
  '1a1m8N2vSTb9s7yXb0r0y0y0y0y0y0y0y0y0y0y0y0y',
  '2b2n9O3vTUc0t8zYc1s1z1z1z1z1z1z1z1z1z1z1z1z',
  '3c3o0P4vUVd1u9Zd2t2a2a2a2a2a2a2a2a2a2a2a2a2a',
  '4d4p1Q5vVWe2v0Ae3u3b3b3b3b3b3b3b3b3b3b3b3b3b',
  '5e5q2R6vWXf3w1Bf4v4c4c4c4c4c4c4c4c4c4c4c4c4c',
  '6f6r3S7vXYg4x2Cg5w5d5d5d5d5d5d5d5d5d5d5d5d5d',
  '7g7s4T8vYZh5y3Dh6x6e6e6e6e6e6e6e6e6e6e6e6e6e',
]

export default function RaffleDrawPage() {
  const { id } = useParams()
  const router = useRouter()
  const [raffle, setRaffle] = useState<Raffle | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDrawing, setIsDrawing] = useState(false)
  const [winners, setWinners] = useState<string[]>([])
  const [participants, setParticipants] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const { publicKey } = useWallet()

  const participantsPerPage = 10
  const totalPages = Math.ceil(participants.length / participantsPerPage)
  const startIndex = (currentPage - 1) * participantsPerPage
  const endIndex = startIndex + participantsPerPage
  const currentParticipants = participants.slice(startIndex, endIndex)

  useEffect(() => {
    async function fetchRaffle() {
      try {
        const response = await fetch(`/api/raffles/${id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch raffle')
        }
        const data = await response.json()
        setRaffle(data)
      } catch (error) {
        toast.error('Failed to fetch raffle details')
      } finally {
        setIsLoading(false)
      }
    }

    fetchRaffle()
  }, [id])

  useEffect(() => {
    if (raffle?.programAddress) {
      setParticipants(DEMO_ADDRESSES)
    }
  }, [raffle?.programAddress])

  const handleDrawWinners = () => {
    if (!raffle || participants.length === 0) return

    setIsDrawing(true)
    setWinners([])

    // Simulate wheel animation
    setTimeout(() => {
      const shuffled = [...participants].sort(() => 0.5 - Math.random())
      const selected = shuffled.slice(0, raffle.numWinners)
      setWinners(selected)
      setIsDrawing(false)
    }, 3000) // 3 second animation
  }

  const handlePayout = async (winner: string) => {
    try {
      // TODO: Implement actual payout logic
      toast.success(`Prize paid to ${winner}`)
    } catch (error) {
      toast.error('Failed to process payout')
    }
  }

  const getRaffleStatus = (raffle: Raffle) => {
    const now = new Date()
    const startDate = new Date(raffle.startDate)
    const endDate = new Date(raffle.endDate)
    const drawDate = new Date(raffle.drawDate)

    if (raffle.winners && raffle.winners.length > 0) {
      return 'COMPLETED'
    }

    if (now < startDate) {
      return 'UPCOMING'
    }

    if (now >= startDate && now <= endDate) {
      return 'ACTIVE'
    }

    if (now > endDate && now <= drawDate) {
      return 'DRAWING'
    }

    return 'ENDED'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-verxio-purple"></div>
      </div>
    )
  }

  if (!raffle) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="bg-black/20 backdrop-blur-sm border-slate-800/20">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h2 className="text-xl font-semibold text-white orbitron mb-2">Raffle Not Found</h2>
            <p className="text-white/70 text-center max-w-md">
              The raffle you're looking for doesn't exist or has been removed.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const status = getRaffleStatus(raffle)

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/dashboard/raffle')}
          className="text-white/70 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Raffles
        </Button>
      </div>

      <Card className="bg-black/20 backdrop-blur-sm border-slate-800/20 mb-8">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white orbitron mb-2">{raffle.name}</h1>
              <p className="text-white/70">{raffle.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-sm ${
                  status === 'UPCOMING'
                    ? 'bg-yellow-500/20 text-yellow-500'
                    : status === 'ACTIVE'
                      ? 'bg-green-500/20 text-green-500'
                      : status === 'DRAWING'
                        ? 'bg-purple-500/20 text-purple-500'
                        : status === 'ENDED'
                          ? 'bg-red-500/20 text-red-500'
                          : 'bg-blue-500/20 text-blue-500'
                }`}
              >
                {status}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center py-8">
            {isDrawing ? (
              <Wheel participants={participants} />
            ) : winners.length > 0 ? (
              <div className="space-y-4 w-full">
                <h3 className="text-xl font-semibold text-white orbitron text-center">Winners</h3>
                {winners.map((winner, index) => (
                  <div key={winner} className="flex justify-between items-center p-4 bg-black/20 rounded-lg">
                    <div>
                      <p className="text-white/70">
                        <span className="text-white">Position {index + 1}:</span> {winner}
                      </p>
                    </div>
                    <Button onClick={() => handlePayout(winner)}>Pay Winner</Button>
                  </div>
                ))}
              </div>
            ) : (
              <Button
                onClick={handleDrawWinners}
                disabled={participants.length === 0}
                className="bg-gradient-to-r from-[#00FFE0] via-[#0085FF] to-[#7000FF] text-white hover:opacity-90 orbitron"
              >
                Draw Winners
              </Button>
            )}
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-semibold text-white orbitron mb-4">Participants</h3>
            <div className="space-y-4">
              <p className="text-white/70">Total eligible participants: {participants.length}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentParticipants.map((participant) => (
                  <div key={participant} className="p-2 bg-black/20 rounded">
                    <p className="text-white/70 truncate">{participant}</p>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="text-white/70 hover:text-white"
                  >
                    Previous
                  </Button>
                  <span className="text-white/70">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="text-white/70 hover:text-white"
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
