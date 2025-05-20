'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { PlusIcon } from 'lucide-react'
import { CampaignList } from '@/components/campaigns/CampaignList'

// Mock data for now
const mockCampaigns = [
  {
    id: 1,
    title: 'Social Media Challenge',
    description: 'Complete all social media tasks to earn points and reach new achievement tiers.',
    startDate: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 2),
    endDate: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 5),
    bannerImage: '/api/uploads/1747439790337-102807883.png',
    participants: 128,
    submissions: 421,
    status: 'active' as const,
  },
  {
    id: 2,
    title: 'Summer Product Launch',
    description: 'Promote our new summer collection across your channels.',
    startDate: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 10),
    endDate: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 40),
    bannerImage: null,
    participants: 0,
    submissions: 0,
    status: 'scheduled' as const,
  },
  // Add more mock campaigns as needed
]

export default function CampaignsPage() {
  const router = useRouter()

  const handleCampaignClick = (id: number) => {
    router.push(`/dashboard/campaigns/${id}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Campaigns</h1>
        <Button onClick={() => router.push('/dashboard/campaigns/create')}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Create Campaign
        </Button>
      </div>

      <CampaignList campaigns={mockCampaigns} onCampaignClick={handleCampaignClick} />
    </div>
  )
}
