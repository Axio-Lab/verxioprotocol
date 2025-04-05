'use client'

import StatsCard from './StatsCard'
import { Users, Award, CreditCard, Zap, Repeat, BarChart3 } from 'lucide-react'

export default function DashboardStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <StatsCard
        title="Total Members"
        value={2583}
        description="Active members in your loyalty program"
        icon={<Users size={20} />}
        color="purple"
        trend="up"
        trendValue="12% this month"
      />

      <StatsCard
        title="Points Issued"
        value={1250750}
        description="Total points distributed to members"
        icon={<Award size={20} />}
        color="blue"
        trend="up"
        trendValue="8.3% this month"
      />

      <StatsCard
        title="Average Points"
        value={485}
        description="Average points per member"
        icon={<BarChart3 size={20} />}
        color="cyan"
        trend="down"
        trendValue="3.2% this month"
      />

      <StatsCard
        title="Redemption Rate"
        value={38}
        suffix="%"
        description="Percentage of points redeemed"
        icon={<Repeat size={20} />}
        color="pink"
        trend="up"
        trendValue="4.5% this month"
      />

      <StatsCard
        title="Passes Issued"
        value={1872}
        description="Active loyalty passes"
        icon={<CreditCard size={20} />}
        color="green"
        trend="up"
        trendValue="10.7% this month"
      />

      <StatsCard
        title="Member Activity"
        value={74}
        suffix="%"
        description="Active members in the last 30 days"
        icon={<Zap size={20} />}
        color="purple"
        trend="neutral"
        trendValue="0.2% this month"
      />
    </div>
  )
}
