import { CampaignCard } from './CampaignCard'
import { Input } from '@/components/ui/input'
import { SearchIcon } from 'lucide-react'
import { useState } from 'react'

interface Campaign {
  id: number
  title: string
  description: string
  startDate: Date
  endDate: Date
  bannerImage: string | null
  participants: number
  submissions: number
  status: 'active' | 'scheduled' | 'ended' | 'draft'
}

interface CampaignListProps {
  campaigns: Campaign[]
  onCampaignClick: (id: number) => void
}

export function CampaignList({ campaigns, onCampaignClick }: CampaignListProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredCampaigns = campaigns.filter(
    (campaign) =>
      campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search campaigns..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCampaigns.map((campaign) => (
          <CampaignCard key={campaign.id} campaign={campaign} onClick={onCampaignClick} />
        ))}
      </div>

      {filteredCampaigns.length === 0 && (
        <div className="text-center py-10 text-muted-foreground">No campaigns found</div>
      )}
    </div>
  )
}
