import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CalendarIcon, UsersIcon, ListChecksIcon } from 'lucide-react'
import { format } from 'date-fns'

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

interface CampaignCardProps {
  campaign: Campaign
  onClick: (id: number) => void
}

export function CampaignCard({ campaign, onClick }: CampaignCardProps) {
  const getStatusBadge = (status: Campaign['status']) => {
    switch (status) {
      case 'active':
        return { variant: 'default' as const, label: 'Active' }
      case 'scheduled':
        return { variant: 'outline' as const, label: 'Scheduled' }
      case 'ended':
        return { variant: 'secondary' as const, label: 'Ended' }
      case 'draft':
        return { variant: 'destructive' as const, label: 'Draft' }
      default:
        return { variant: 'outline' as const, label: 'Unknown' }
    }
  }

  const status = getStatusBadge(campaign.status)

  return (
    <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => onClick(campaign.id)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">{campaign.title}</CardTitle>
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground line-clamp-2">{campaign.description}</p>

          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="flex items-center gap-1">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <span>{format(campaign.startDate, 'MMM d')}</span>
            </div>
            <div className="flex items-center gap-1">
              <UsersIcon className="h-4 w-4 text-muted-foreground" />
              <span>{campaign.participants}</span>
            </div>
            <div className="flex items-center gap-1">
              <ListChecksIcon className="h-4 w-4 text-muted-foreground" />
              <span>{campaign.submissions}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
