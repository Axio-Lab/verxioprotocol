'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { CountdownTimer } from './CountdownTimer'

interface Task {
  title: string
  description: string
  points: number
}

interface RewardTier {
  name: string
  xp: number
  description: string
}

interface CampaignPreviewProps {
  title: string
  description: string
  organization: string
  startDate: Date
  endDate: Date
  tasks: Task[]
  rewardTiers: RewardTier[]
  campaignColor: string
}

export function CampaignPreview({
  title,
  description,
  organization,
  startDate,
  endDate,
  tasks,
  rewardTiers,
  campaignColor,
}: CampaignPreviewProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <Badge variant="outline" className="mb-2">
                {organization}
              </Badge>
              <CardTitle>{title}</CardTitle>
            </div>
            <div className="text-sm text-muted-foreground">
              {format(startDate, 'MMM d, yyyy')} - {format(endDate, 'MMM d, yyyy')}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">{description}</p>

          <div className="border rounded-lg p-4" style={{ borderColor: `${campaignColor}40` }}>
            <CountdownTimer startDate={startDate} endDate={endDate} />
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">Reward Tiers</h3>
            <div className="grid gap-4">
              {rewardTiers.map((tier, index) => (
                <div key={index} className="p-4 rounded-lg border" style={{ borderColor: `${campaignColor}40` }}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{tier.name}</h4>
                    <Badge variant="outline">{tier.xp} XP</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{tier.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">Tasks</h3>
            <div className="grid gap-4">
              {tasks.map((task, index) => (
                <div key={index} className="p-4 rounded-lg border" style={{ borderColor: `${campaignColor}40` }}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{task.title}</h4>
                    <Badge variant="outline">{task.points} points</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{task.description}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
