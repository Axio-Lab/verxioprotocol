'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useWalletUi } from '@wallet-ui/react'
import { Activity, Users, Gift, Trophy, Building2, User } from 'lucide-react'
import { useDashboard } from './DashboardContext'

export default function DashboardPage() {
  const { connected } = useWalletUi()
  const { isOrganization, setIsOrganization } = useDashboard()

  if (!connected) {
    return null
  }

  const toggleDashboard = () => {
    setIsOrganization(!isOrganization)
  }

  if (isOrganization) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-white orbitron">Organization Dashboard</h1>
            <button
              onClick={toggleDashboard}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black/20 border border-verxio-purple/20 text-white hover:bg-black/30 transition-colors"
            >
              <User className="h-4 w-4" />
              Switch to User View
            </button>
          </div>
          <button className="bg-gradient-to-r from-[#00FFE0] via-[#0085FF] to-[#7000FF] text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
            Create Program
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-black/20 border-verxio-purple/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/70">Total Programs</CardTitle>
              <Gift className="h-4 w-4 text-verxio-purple" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">0</div>
            </CardContent>
          </Card>

          <Card className="bg-black/20 border-verxio-purple/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/70">Total Members</CardTitle>
              <Users className="h-4 w-4 text-verxio-purple" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">0</div>
            </CardContent>
          </Card>

          <Card className="bg-black/20 border-verxio-purple/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/70">Active Passes</CardTitle>
              <Activity className="h-4 w-4 text-verxio-purple" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">0</div>
            </CardContent>
          </Card>

          <Card className="bg-black/20 border-verxio-purple/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/70">Total Points</CardTitle>
              <Trophy className="h-4 w-4 text-verxio-purple" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">0</div>
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
          <h1 className="text-3xl font-bold text-white orbitron">My Dashboard</h1>
          <button
            onClick={toggleDashboard}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black/20 border border-verxio-purple/20 text-white hover:bg-black/30 transition-colors"
          >
            <Building2 className="h-4 w-4" />
            Switch to Organization View
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-black/20 border-verxio-purple/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/70">My Passes</CardTitle>
            <Gift className="h-4 w-4 text-verxio-purple" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">0</div>
          </CardContent>
        </Card>

        <Card className="bg-black/20 border-verxio-purple/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/70">Total Points</CardTitle>
            <Trophy className="h-4 w-4 text-verxio-purple" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">0</div>
          </CardContent>
        </Card>

        <Card className="bg-black/20 border-verxio-purple/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/70">Current Tier</CardTitle>
            <Activity className="h-4 w-4 text-verxio-purple" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">Bronze</div>
          </CardContent>
        </Card>

        <Card className="bg-black/20 border-verxio-purple/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/70">Available Rewards</CardTitle>
            <Gift className="h-4 w-4 text-verxio-purple" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">0</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-black/20 border-verxio-purple/20">
          <CardHeader>
            <CardTitle className="text-white">My Passes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-white/70">No passes yet</p>
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
