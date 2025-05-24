'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CountdownTimer } from '@/components/campaign/CountdownTimer'
import { toast } from 'sonner'
import { CheckCircle2, ChevronRight } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

// Mock data for now
const mockCampaign = {
  id: '1',
  title: 'Social Media Challenge',
  description: 'Complete all social media tasks to earn points and reach new achievement tiers.',
  startDate: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 2),
  endDate: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 5),
  bannerImage: '/api/uploads/1747439790337-102807883.png',
  tasks: [
    {
      id: 1,
      title: 'Follow on Twitter',
      description: 'Follow our Twitter account to earn points',
      points: 10,
      completed: false,
    },
    {
      id: 2,
      title: 'Share Post',
      description: 'Share our latest post on your social media',
      points: 20,
      completed: false,
    },
    {
      id: 3,
      title: 'Join Discord',
      description: 'Join our Discord server',
      points: 15,
      completed: false,
    },
    {
      id: 4,
      title: 'Create Content',
      description: 'Create and share content about our project',
      points: 30,
      completed: false,
    },
  ],
}

export default function CampaignPage() {
  const params = useParams()
  const [tasks, setTasks] = useState(mockCampaign.tasks)
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0)
  const [submissionUrl, setSubmissionUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (taskId: number) => {
    setIsSubmitting(true)
    try {
      // TODO: Implement task submission with Verxio SDK
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call

      const newTasks = tasks.map((task) => (task.id === taskId ? { ...task, completed: true } : task))
      setTasks(newTasks)
      setCurrentTaskIndex((prev) => prev + 1)
      setSubmissionUrl('')
      toast.success('Task completed successfully!')
    } catch (error) {
      toast.error('Failed to submit task')
    } finally {
      setIsSubmitting(false)
    }
  }

  const currentTask = tasks[currentTaskIndex]
  const isLastTask = currentTaskIndex === tasks.length - 1
  const allTasksCompleted = tasks.every((task) => task.completed)

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          <div className="relative aspect-video rounded-lg overflow-hidden">
            <img src={mockCampaign.bannerImage} alt={mockCampaign.title} className="object-cover w-full h-full" />
          </div>

          <CountdownTimer startDate={mockCampaign.startDate} endDate={mockCampaign.endDate} />

          <Card>
            <CardHeader>
              <CardTitle>Campaign Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tasks.map((task, index) => (
                  <div
                    key={task.id}
                    className={`flex items-center gap-4 p-4 rounded-lg ${
                      index === currentTaskIndex
                        ? 'bg-primary/10 border border-primary'
                        : task.completed
                          ? 'bg-muted'
                          : 'bg-background border'
                    }`}
                  >
                    <div className="flex-1">
                      <h3 className="font-medium">{task.title}</h3>
                      <p className="text-sm text-muted-foreground">{task.description}</p>
                      <p className="text-sm font-medium mt-1">{task.points} points</p>
                    </div>
                    {task.completed ? (
                      <CheckCircle2 className="h-6 w-6 text-primary" />
                    ) : (
                      <ChevronRight className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Task</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!allTasksCompleted ? (
                <>
                  <div>
                    <h3 className="text-lg font-medium">{currentTask.title}</h3>
                    <p className="text-muted-foreground">{currentTask.description}</p>
                    <p className="font-medium mt-2">{currentTask.points} points</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="submission">Submission URL</Label>
                    <div className="flex gap-2">
                      <Input
                        id="submission"
                        placeholder="Enter your submission URL"
                        value={submissionUrl}
                        onChange={(e) => setSubmissionUrl(e.target.value)}
                      />
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button disabled={!submissionUrl || isSubmitting}>
                            {isSubmitting ? 'Submitting...' : 'Submit'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80">
                          <div className="space-y-4">
                            <h4 className="font-medium">Confirm Submission</h4>
                            <p className="text-sm text-muted-foreground">
                              Are you sure you want to submit this URL? You won't be able to change it later.
                            </p>
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" onClick={() => document.body.click()}>
                                Cancel
                              </Button>
                              <Button onClick={() => handleSubmit(currentTask.id)}>Confirm</Button>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle2 className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-medium">All tasks completed!</h3>
                  <p className="text-muted-foreground">Congratulations on completing all tasks!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
