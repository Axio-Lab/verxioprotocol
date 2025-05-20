'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { CalendarIcon, Trophy, CheckCircle2, ClockIcon, UserIcon, Gift } from 'lucide-react'
import { format } from 'date-fns'

// Mock data for development
const mockUser = {
  id: 1,
  username: 'demo_user',
  displayName: 'Demo User',
  avatar: null,
}

const mockUserCampaigns = [
  {
    campaignId: 1,
    campaignTitle: 'Social Media Challenge',
    campaignDescription: 'Complete all social media tasks to earn points and reach new achievement tiers.',
    campaignStartDate: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    campaignEndDate: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 5).toISOString(),
    campaignBannerImage: '/api/uploads/1747439790337-102807883.png',
    campaignStatus: 'active',
    progress: 75,
    points: 150,
    totalPoints: 200,
    tasks: [
      {
        taskId: 1,
        taskName: 'Follow on Twitter',
        taskDescription: 'Follow our Twitter account to earn points',
        taskPoints: 10,
        taskRequired: true,
        completed: true,
      },
      {
        taskId: 2,
        taskName: 'Share Post',
        taskDescription: 'Share our latest post on your social media',
        taskPoints: 20,
        taskRequired: false,
        completed: false,
      },
    ],
  },
  {
    campaignId: 2,
    campaignTitle: 'Summer Product Launch',
    campaignDescription: 'Promote our new summer collection across your channels.',
    campaignStartDate: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 10).toISOString(),
    campaignEndDate: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 40).toISOString(),
    campaignBannerImage: null,
    campaignStatus: 'scheduled',
    progress: 0,
    points: 0,
    totalPoints: 300,
    tasks: [],
  },
]

const mockRecentSubmissions = [
  {
    submissionId: 1,
    submissionUrl: 'https://twitter.com/user/status/123',
    submissionDate: new Date(new Date().getTime() - 1000 * 60 * 60 * 24).toISOString(),
    submissionStatus: 'approved' as const,
    attemptNumber: 1,
    feedback: 'Great job!',
    taskId: 1,
    taskName: 'Follow on Twitter',
    taskPoints: 10,
    campaignId: 1,
    campaignTitle: 'Social Media Challenge',
  },
  {
    submissionId: 2,
    submissionUrl: 'https://instagram.com/p/123',
    submissionDate: new Date(new Date().getTime() - 1000 * 60 * 60 * 12).toISOString(),
    submissionStatus: 'pending' as const,
    attemptNumber: 1,
    feedback: null,
    taskId: 2,
    taskName: 'Share Post',
    taskPoints: 20,
    campaignId: 1,
    campaignTitle: 'Social Media Challenge',
  },
]

export default function UserCampaignsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')

  const getStatusBadge = (status: string) => {
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

  const getSubmissionStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500">Approved</Badge>
      case 'revoked':
        return <Badge variant="destructive">Revoked</Badge>
      case 'pending':
      default:
        return (
          <Badge variant="outline" className="text-yellow-500 border-yellow-500">
            Pending
          </Badge>
        )
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* User Profile and Summary */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <Avatar className="h-16 w-16">
                {mockUser.avatar ? (
                  <AvatarImage src={mockUser.avatar} alt={mockUser.displayName || mockUser.username} />
                ) : (
                  <AvatarFallback>
                    <UserIcon className="h-8 w-8" />
                  </AvatarFallback>
                )}
              </Avatar>

              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Welcome, {mockUser.displayName || mockUser.username}</h1>
                <p className="text-muted-foreground">Track your campaign progress and next steps</p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Trophy className="h-4 w-4 mr-2 text-primary" />
                  Total Points
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {mockUserCampaigns.reduce((total, campaign) => total + campaign.points, 0)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <CheckCircle2 className="h-4 w-4 mr-2 text-primary" />
                  Completed Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {mockUserCampaigns.reduce(
                    (total, campaign) => total + campaign.tasks.filter((task) => task.completed).length,
                    0,
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <ClockIcon className="h-4 w-4 mr-2 text-primary" />
                  Pending Reviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {mockRecentSubmissions.filter((sub) => sub.submissionStatus === 'pending').length}
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="submissions">Submissions</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockUserCampaigns.map((campaign) => {
                  const status = getStatusBadge(campaign.campaignStatus)

                  return (
                    <Card
                      key={campaign.campaignId}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => router.push(`/dashboard/user/campaigns/${campaign.campaignId}`)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg font-medium">{campaign.campaignTitle}</CardTitle>
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <p className="text-sm text-muted-foreground line-clamp-2">{campaign.campaignDescription}</p>

                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Progress</span>
                              <span>{campaign.progress}%</span>
                            </div>
                            <Progress value={campaign.progress} className="h-2" />
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center gap-1">
                              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                              <span>{format(new Date(campaign.campaignStartDate), 'MMM d')}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Trophy className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {campaign.points}/{campaign.totalPoints} pts
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </TabsContent>

            <TabsContent value="submissions" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your latest submissions and achievements</CardDescription>
                </CardHeader>
                <CardContent>
                  {mockRecentSubmissions.length > 0 ? (
                    <div className="space-y-4">
                      {mockRecentSubmissions.map((submission) => (
                        <div
                          key={submission.submissionId}
                          className="flex items-center justify-between p-3 border rounded-md"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                              <Gift className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{submission.taskName}</p>
                              <div className="flex items-center text-xs text-muted-foreground gap-2">
                                <CalendarIcon className="h-3 w-3" />
                                <span>{format(new Date(submission.submissionDate), 'MMM d, yyyy')}</span>
                                <span>•</span>
                                <span>{submission.campaignTitle}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {submission.submissionStatus === 'approved' && (
                              <Badge variant="outline" className="text-primary border-primary">
                                +{submission.taskPoints} pts
                              </Badge>
                            )}
                            {getSubmissionStatusBadge(submission.submissionStatus)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-muted-foreground">No recent activity found</p>
                      <Button variant="outline" className="mt-4" onClick={() => router.push('/dashboard')}>
                        Find Campaigns
                      </Button>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push('/dashboard/user/submissions')}
                  >
                    View All Submissions
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
