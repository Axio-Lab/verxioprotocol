'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Raffle } from '@/types/raffle'
import Link from 'next/link'
import { useWallet } from '@solana/wallet-adapter-react'

export function UserRaffles() {
  const [raffles, setRaffles] = useState<Raffle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorShown, setErrorShown] = useState(false)
  const { publicKey } = useWallet()

  useEffect(() => {
    let isMounted = true

    async function fetchRaffles() {
      if (!publicKey) return

      try {
        const response = await fetch(`/api/raffles?wallet=${publicKey.toString()}`)
        if (!response.ok) throw new Error('Failed to fetch raffles')
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
  }, [publicKey, errorShown])

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
        <p className="text-white/70 text-center max-w-md mb-4">You haven't participated in any raffles yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {raffles.map((raffle) => (
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
                    raffle.status === 'UPCOMING'
                      ? 'bg-yellow-500/20 text-yellow-500'
                      : raffle.status === 'ACTIVE'
                        ? 'bg-green-500/20 text-green-500'
                        : raffle.status === 'COMPLETED'
                          ? 'bg-blue-500/20 text-blue-500'
                          : 'bg-red-500/20 text-red-500'
                  }`}
                >
                  {raffle.status}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <Button variant="outline" asChild>
                <Link href={`/dashboard/raffle/${raffle.id}`}>View Details</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
