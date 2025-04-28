'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Raffle } from '@/types/raffle'
import Link from 'next/link'
import { useWallet } from '@solana/wallet-adapter-react'

export function RaffleList() {
  const [raffles, setRaffles] = useState<Raffle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorShown, setErrorShown] = useState(false)
  const { publicKey } = useWallet()

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

  useEffect(() => {
    let isMounted = true

    async function fetchRaffles() {
      try {
        if (!publicKey) {
          throw new Error('Wallet not connected')
        }

        const response = await fetch(`/api/raffles?creator=${publicKey.toString()}`)
        if (!response.ok) {
          throw new Error('Failed to fetch raffles')
        }
        const data = await response.json()
        if (isMounted) {
          setRaffles(data)
        }
      } catch (error) {
        if (isMounted && !errorShown) {
          setErrorShown(true)
          toast.error('Failed to fetch raffles')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchRaffles()

    return () => {
      isMounted = false
    }
  }, [errorShown, publicKey])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-verxio-purple"></div>
      </div>
    )
  }

  if (raffles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h2 className="text-xl font-semibold text-white orbitron mb-2">No Raffles</h2>
        <p className="text-white/70 text-center max-w-md mb-4">You haven't created any raffles yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {raffles.map((raffle) => {
        const status = getRaffleStatus(raffle)
        return (
          <Card key={raffle.id} className="bg-black/20 backdrop-blur-sm border-slate-800/20">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-white orbitron mb-2">{raffle.name}</h2>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white orbitron mb-2">Prize Details</h3>
                  <div className="space-y-2">
                    <p className="text-white/70">
                      <span className="text-white">Type:</span> {raffle.prizeType}
                    </p>
                    {raffle.prizeType === 'TOKEN' && (
                      <>
                        <p className="text-white/70">
                          <span className="text-white">Amount:</span> {raffle.prizeDetails.token?.amount}
                        </p>
                        <p className="text-white/70">
                          <span className="text-white">Mint:</span> {raffle.prizeDetails.token?.mint}
                        </p>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white orbitron mb-2">Raffle Details</h3>
                  <div className="space-y-2">
                    <p className="text-white/70">
                      <span className="text-white">Start Date:</span> {new Date(raffle.startDate).toLocaleDateString()}
                    </p>
                    <p className="text-white/70">
                      <span className="text-white">End Date:</span> {new Date(raffle.endDate).toLocaleDateString()}
                    </p>
                    <p className="text-white/70">
                      <span className="text-white">Draw Date:</span> {new Date(raffle.drawDate).toLocaleDateString()}
                    </p>
                    <p className="text-white/70">
                      <span className="text-white">Entry Cost:</span>{' '}
                      {raffle.entryCost ? `${raffle.entryCost} XP` : 'Free'}
                    </p>
                    <p className="text-white/70">
                      <span className="text-white">Program Address:</span> {raffle.programAddress}
                    </p>
                    <p className="text-white/70">
                      <span className="text-white">Eligible Participants:</span> {raffle.eligibleParticipants}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                {status === 'ACTIVE' && (
                  <Button variant="outline" className="text-white hover:opacity-90 orbitron" asChild>
                    <Link href={`/dashboard/raffle/draw/${raffle.id}`}>Start Raffle</Link>
                  </Button>
                )}
                {status === 'COMPLETED' && (
                  <p className="text-white/70">{raffle.winners?.length || 0} winners selected</p>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
