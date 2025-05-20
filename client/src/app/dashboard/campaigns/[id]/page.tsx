'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, CalendarIcon, UsersIcon, ListChecksIcon } from 'lucide-react'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'

// Mock data for now
const mockCampaign: {
  id: number
  title: string
  description: string
  startDate: Date
  endDate: Date
  bannerImage: string | null
  participants: number
  submissions: number
  status: 'active' | 'scheduled' | 'ended' | 'draft'
  tasks: Array<{
    id: number
    title: string
    description: string
    points: number
    completed: boolean
  }>
} = {
  id: 1,
  title: 'Social Media Challenge',
  description: 'Complete all social media tasks to earn points and reach new achievement tiers.',
  startDate: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 2),
  endDate: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 5),
  bannerImage: '/api/uploads/1747439790337-102807883.png',
  participants: 128,
  submissions: 421,
  status: 'active' as const,
  tasks: [
    {
      id: 1,
      title: 'Follow on Twitter',
      description: 'Follow our Twitter account to earn points',
      points: 10,
      completed: true,
    },
    {
      id: 2,
      title: 'Share Post',
      description: 'Share our latest post on your social media',
      points: 20,
      completed: false,
    },
  ],
}

export default function CampaignDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const [activeTab, setActiveTab] = useState('overview')

  const getStatusBadge = (status: typeof mockCampaign.status) => {
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

  const status = getStatusBadge(mockCampaign.status)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{mockCampaign.title}</h1>
          <p className="text-muted-foreground">{mockCampaign.description}</p>
        </div>
        <Badge variant={status.variant}>{status.label}</Badge>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Start Date</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <span>{format(mockCampaign.startDate, 'MMM d, yyyy')}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Participants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <UsersIcon className="h-4 w-4 text-muted-foreground" />
              <span>{mockCampaign.participants}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <ListChecksIcon className="h-4 w-4 text-muted-foreground" />
              <span>{mockCampaign.submissions}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Description</h3>
                  <p className="text-muted-foreground">{mockCampaign.description}</p>
                </div>
                {mockCampaign.bannerImage && (
                  <div>
                    <h3 className="font-medium mb-2">Banner Image</h3>
                    <img
                      src={mockCampaign.bannerImage}
                      alt="Campaign banner"
                      className="rounded-lg max-h-[300px] object-cover"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockCampaign.tasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{task.title}</h3>
                      <p className="text-sm text-muted-foreground">{task.description}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium">{task.points} points</span>
                      <Badge variant={task.completed ? 'default' : 'outline'}>
                        {task.completed ? 'Completed' : 'Pending'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="submissions">
          <Card>
            <CardHeader>
              <CardTitle>Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">No submissions yet. Check back later.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
