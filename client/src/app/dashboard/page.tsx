'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useWallet } from '@solana/wallet-adapter-react'
import { Users, Gift, Building2, User, Star, Ticket, Loader2 } from 'lucide-react'
import { useDashboard } from './DashboardContext'
import Link from 'next/link'
import MyLoyaltyPasses from '@/components/dashboard/MyLoyaltyPass'
import { useEffect, useState, useRef } from 'react'
import { useNetwork } from '@/lib/network-context'
import { getProgramStats, ProgramStats } from '@/app/actions/program'

export default function DashboardPage() {
  const { connected, publicKey: walletPublicKey } = useWallet()
  const { isOrganization, setIsOrganization } = useDashboard()
  const [stats, setStats] = useState<ProgramStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { network } = useNetwork()
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  useEffect(() => {
    async function fetchStats() {
      if (!walletPublicKey || !network) return

      setIsLoading(true)
      try {
        const data = await getProgramStats(walletPublicKey.toString(), network)
        if (mounted.current) {
          setStats(data)
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        if (mounted.current) {
          setIsLoading(false)
        }
      }
    }

    fetchStats()
  }, [walletPublicKey, network])

  if (!connected) {
    return null
  }

  const toggleDashboard = () => {
    setIsOrganization(!isOrganization)
  }

  if (isOrganization) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row items-start justify-between gap-5 md:items-center border border-red-500">
          <div className="w-full md:w-1/2 ">
            <h1 className="text-lg md:text-3xl font-bold bg-gradient-to-r from-[#00FFE0] via-[#0085FF] to-[#7000FF] text-transparent bg-clip-text orbitron">
              Organization Dashboard
            </h1>
          </div>
          <div className="w-full md:w-1/2 flex items-center justify-between gap-4">
            <button
              onClick={toggleDashboard}
              className="flex items-center gap-2 md:px-4 py-2 rounded-lg bg-black/20 border border-verxio-purple/20 text-white hover:bg-black/30 transition-colors"
            >
              <User className="h-4 w-4" />
              Switch to User View
            </button>
            <Link href="/dashboard/programs/new">
              <button className="bg-gradient-to-r from-[#00FFE0] via-[#0085FF] to-[#7000FF] text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity orbitron">
                Create Program
              </button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-black/20 border-verxio-purple/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/70">Total Programs</CardTitle>
              <Star className="h-4 w-4 text-[#9d4edd]" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-[#9d4edd]" />
                </div>
              ) : (
                <div className="text-2xl font-bold text-white">{stats?.totalPrograms || 0}</div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-black/20 border-verxio-purple/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/70">Total Members</CardTitle>
              <Users className="h-4 w-4 text-[#9d4edd]" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-[#9d4edd]" />
                </div>
              ) : (
                <div className="text-2xl font-bold text-white">{stats?.totalMembers || 0}</div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-black/20 border-verxio-purple/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/70">Active Passes</CardTitle>
              <Ticket className="h-4 w-4 text-[#9d4edd]" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-[#9d4edd]" />
                </div>
              ) : (
                <div className="text-2xl font-bold text-white">{stats?.activePasses || 0}</div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-black/20 border-verxio-purple/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/70">Total Points</CardTitle>
              <Gift className="h-4 w-4 text-[#9d4edd]" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-[#9d4edd]" />
                </div>
              ) : (
                <div className="text-2xl font-bold text-white">{stats?.totalPoints || 0}</div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-black/20 border-verxio-purple/20">
            <CardHeader>
              <CardTitle className="text-white">Recent Programs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/70">No programs created yet</p>
            </CardContent>
          </Card>

          <Card className="bg-black/20 border-verxio-purple/20">
            <CardHeader>
              <CardTitle className="text-white">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/70">No recent activity</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // User view
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#00FFE0] via-[#0085FF] to-[#7000FF] text-transparent bg-clip-text orbitron">
            My Loyalty Cards
          </h1>
          <button
            onClick={toggleDashboard}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black/20 border border-verxio-purple/20 text-white hover:bg-black/30 transition-colors"
          >
            <Building2 className="h-4 w-4" />
            Switch to Organization View
          </button>
        </div>
      </div>

      <MyLoyaltyPasses />
    </div>
  )
}
