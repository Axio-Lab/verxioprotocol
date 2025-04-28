'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { useWallet } from '@solana/wallet-adapter-react'
import { RaffleList } from '@/components/raffle/RaffleList'
import { UserRaffles } from '@/components/raffle/UserRaffles'
import { useDashboard } from '@/app/dashboard/DashboardContext'

export default function RafflePage() {
  const { publicKey } = useWallet()
  const { isOrganization } = useDashboard()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white orbitron">Raffles</h1>
        {isOrganization && (
          <Button
            className="bg-gradient-to-r from-[#00FFE0] via-[#0085FF] to-[#7000FF] text-white hover:opacity-90 orbitron"
            asChild
          >
            <Link href="/dashboard/raffle/create">
              <Plus className="w-4 h-4 mr-2" />
              Create Raffle
            </Link>
          </Button>
        )}
      </div>

      {isOrganization ? (
        <Card className="bg-black/20 backdrop-blur-sm border-slate-800/20">
          <CardContent className="p-6">
            <RaffleList />
          </CardContent>
        </Card>
      ) : (
        <UserRaffles />
      )}
    </div>
  )
}
