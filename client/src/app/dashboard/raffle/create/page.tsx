'use client'

import { Card, CardContent } from '@/components/ui/card'
import { CreateRaffleForm } from '@/components/raffle/CreateRaffleForm'
import { useWallet } from '@solana/wallet-adapter-react'
import { useEffect, useState } from 'react'

export default function CreateRafflePage() {
  const { publicKey } = useWallet()
  const [programs, setPrograms] = useState([])

  useEffect(() => {
    async function fetchPrograms() {
      if (!publicKey) return
      const response = await fetch(`/api/programs?creator=${publicKey.toString()}`)
      const data = await response.json()
      setPrograms(data)
    }
    fetchPrograms()
  }, [publicKey])

  if (!publicKey) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h2 className="text-xl font-semibold text-white orbitron mb-2">Connect Wallet</h2>
        <p className="text-white/70 text-center max-w-md">Please connect your wallet to create a raffle.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white orbitron">Create Raffle</h1>
      </div>

      <Card className="bg-black/20 backdrop-blur-sm border-slate-800/20">
        <CardContent className="p-6">
          <CreateRaffleForm programs={programs} />
        </CardContent>
      </Card>
    </div>
  )
}
