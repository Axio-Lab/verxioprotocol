'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useWallet } from '@solana/wallet-adapter-react'
import { Building2, Loader2 } from 'lucide-react'
import { useDashboard } from '../DashboardContext'
import MyLoyaltyPasses from '@/components/dashboard/MyLoyaltyPass'
import { useEffect, useRef } from 'react'
import useMediaQuery from '@/components/hooks/useMediaQuerry'
import { useRouter } from 'next/navigation'

export default function UserDashboardPage() {
  const { connected } = useWallet()
  const { setIsOrganization } = useDashboard()
  const mounted = useRef(true)
  const responsiveNavMenu = useMediaQuery('(max-width: 896px)')
  const router = useRouter()

  useEffect(() => {
    mounted.current = true
    setIsOrganization(false)
    return () => {
      mounted.current = false
    }
  }, [setIsOrganization])

  if (!connected) {
    return null
  }

  const toggleDashboard = () => {
    setIsOrganization(true)
    router.push('/dashboard')
  }

  return (
    <div className="space-y-8">
      <div
        className={`w-full flex gap-5 ${responsiveNavMenu ? 'flex-col items-start' : 'flex-row items-center justify-between'}`}
      >
        <h1 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-[#00FFE0] via-[#0085FF] to-[#7000FF] text-transparent bg-clip-text orbitron">
          My Loyalty Cards
        </h1>
        <button
          onClick={toggleDashboard}
          className="self-end md:self-auto flex items-center gap-2 px-4 py-2 rounded-lg bg-black/20 border border-verxio-purple/20 text-white hover:bg-black/30 transition-colors"
        >
          <Building2 className="h-4 w-4" />
          Switch to Organization View
        </button>
      </div>

      <MyLoyaltyPasses />
    </div>
  )
}
