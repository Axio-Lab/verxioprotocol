'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ArrowLeft,
  Plus,
  Trash2,
  ArrowRight,
  ArrowLeft as ArrowLeftIcon,
  Palette,
  PencilIcon,
  CheckIcon,
  XIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { Calendar } from '@/components/ui/calendar'
import { CountdownTimer } from '@/components/campaign/CountdownTimer'
import { CampaignPreview } from '@/components/campaign/CampaignPreview'

interface RewardTier {
  id: number
  name: string
  xp: number
  description: string
  color: string
}

interface Task {
  title: string
  description: string
  points: number
}

const DEFAULT_TIERS = [
  { id: 1, name: 'Bronze', xp: 100, description: 'Complete basic tasks', color: '#CD7F32' },
  { id: 2, name: 'Silver', xp: 250, description: 'Complete intermediate tasks', color: '#C0C0C0' },
  { id: 3, name: 'Gold', xp: 500, description: 'Complete advanced tasks', color: '#FFD700' },
  { id: 4, name: 'Platinum', xp: 1000, description: 'Complete expert tasks', color: '#E5E4E2' },
  { id: 5, name: 'Diamond', xp: 2000, description: 'Complete master tasks', color: '#B9F2FF' },
]

export default function CreateCampaignPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [organization, setOrganization] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [rewardTiers, setRewardTiers] = useState<RewardTier[]>(DEFAULT_TIERS)
  const [tasks, setTasks] = useState<Task[]>([{ title: '', description: '', points: 0 }])
  const [campaignColor, setCampaignColor] = useState('#6366f1')
  const [editingTierId, setEditingTierId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [editXp, setEditXp] = useState(0)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // TODO: Implement campaign creation with Verxio SDK
      toast.success('Campaign created successfully')
      router.push('/dashboard/campaigns')
    } catch (error) {
      toast.error('Failed to create campaign')
    } finally {
      setIsLoading(false)
    }
  }

  const addRewardTier = () => {
    const newId = Math.max(...rewardTiers.map((tier) => tier.id)) + 1
    setRewardTiers([
      ...rewardTiers,
      {
        id: newId,
        name: 'New Tier',
        xp: 0,
        description: '',
        color: '#CD7F32',
      },
    ])
  }

  const resetToDefaultTiers = () => {
    setRewardTiers(DEFAULT_TIERS)
  }

  const removeRewardTier = (id: number) => {
    setRewardTiers(rewardTiers.filter((tier) => tier.id !== id))
  }

  const updateTier = (id: number, updates: Partial<RewardTier>) => {
    setRewardTiers(rewardTiers.map((tier) => (tier.id === id ? { ...tier, ...updates } : tier)))
  }

  const startEditTier = (tier: RewardTier) => {
    setEditingTierId(tier.id)
    setEditName(tier.name)
    setEditXp(tier.xp)
  }

  const saveTierEdit = () => {
    if (editingTierId !== null) {
      updateTier(editingTierId, {
        name: editName.trim() || 'Tier',
        xp: editXp || 0,
      })
      setEditingTierId(null)
    }
  }

  const cancelTierEdit = () => {
    setEditingTierId(null)
  }

  const addTask = () => {
    setTasks([...tasks, { title: '', description: '', points: 0 }])
  }

  const removeTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index))
  }

  const nextStep = () => {
    setCurrentStep((prev) => prev + 1)
  }

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Create Campaign</h1>
      </div>

      <form onSubmit={handleSubmit}>
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Campaign Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="organization">Organization Name</Label>
                <Input
                  id="organization"
                  placeholder="Enter organization name"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Campaign Title</Label>
                <Input
                  id="title"
                  placeholder="Enter campaign title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter campaign description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !startDate && 'text-muted-foreground',
                        )}
                      >
                        {startDate ? format(startDate, 'PPP') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !endDate && 'text-muted-foreground',
                        )}
                      >
                        {endDate ? format(endDate, 'PPP') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {startDate && endDate && (
                <div className="mt-4">
                  <CountdownTimer startDate={startDate} endDate={endDate} />
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Campaign Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Reward Tiers Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Reward Tiers</h3>
                  <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" onClick={resetToDefaultTiers} size="sm">
                      Reset to Default
                    </Button>
                    <Button type="button" variant="outline" onClick={addRewardTier} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Tier
                    </Button>
                  </div>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {rewardTiers.map((tier) => (
                    <div key={tier.id} className="min-w-[100px] flex-1">
                      {editingTierId === tier.id ? (
                        <div className="space-y-2 p-2 bg-muted/40 rounded-lg border border-border/50">
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            placeholder="Tier name"
                            className="h-7 text-xs"
                          />
                          <div className="flex items-center gap-1">
                            <Input
                              type="number"
                              value={editXp}
                              onChange={(e) => setEditXp(parseInt(e.target.value) || 0)}
                              min={0}
                              className="h-7 text-xs w-14"
                            />
                            <span className="text-xs text-muted-foreground">XP</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-green-500 hover:text-green-600"
                              onClick={saveTierEdit}
                            >
                              <CheckIcon className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-muted-foreground hover:text-destructive"
                              onClick={cancelTierEdit}
                            >
                              <XIcon className="h-3.5 w-3.5" />
                            </Button>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground">
                                  <Palette className="h-3.5 w-3.5" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-64 p-3" align="center">
                                <Label className="text-xs mb-2 block">Choose a color</Label>
                                <div className="grid grid-cols-5 gap-2 mb-2">
                                  {[
                                    '#CD7F32', // Bronze
                                    '#C0C0C0', // Silver
                                    '#FFD700', // Gold
                                    '#E5E4E2', // Platinum
                                    '#B9F2FF', // Diamond
                                    '#FF5733', // Coral
                                    '#33FF57', // Lime
                                    '#3357FF', // Blue
                                    '#F033FF', // Magenta
                                    '#FFFF33', // Yellow
                                    '#33FFFF', // Cyan
                                    '#FF33A8', // Pink
                                    '#A833FF', // Purple
                                    '#FF8333', // Orange
                                    '#33FF83', // Mint
                                  ].map((color, index) => (
                                    <button
                                      key={index}
                                      className={`w-7 h-7 rounded-full border-2 ${
                                        tier.color === color ? 'border-primary' : 'border-transparent'
                                      } hover:scale-110 transition-transform`}
                                      style={{ backgroundColor: color }}
                                      onClick={() => updateTier(tier.id, { color })}
                                      aria-label={`Select color ${color}`}
                                    />
                                  ))}
                                </div>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="color"
                                    value={tier.color}
                                    onChange={(e) => updateTier(tier.id, { color: e.target.value })}
                                    className="h-7 w-8 p-0 cursor-pointer"
                                  />
                                  <Input
                                    type="text"
                                    value={tier.color}
                                    onChange={(e) => updateTier(tier.id, { color: e.target.value })}
                                    className="h-7 text-xs flex-1"
                                    placeholder="#RRGGBB"
                                  />
                                </div>
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          className="w-full h-auto flex flex-col gap-1 p-3 group relative border-2 transition-all"
                          style={{
                            borderColor: `${tier.color}40`,
                          }}
                          onClick={() => startEditTier(tier)}
                        >
                          <div
                            className="absolute bottom-0 left-0 right-0 h-1 transition-all"
                            style={{
                              backgroundColor: tier.color,
                              opacity: 0.3,
                            }}
                          />

                          <div
                            className="w-5 h-5 rounded-full mb-1 mx-auto border transition-all border-muted-foreground/20"
                            style={{
                              backgroundColor: tier.color,
                              opacity: 0.5,
                            }}
                          />

                          <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">
                            {tier.name}
                          </span>

                          <span className="text-[10px] text-muted-foreground">{tier.xp} XP</span>
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Tasks Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Campaign Tasks</h3>
                  <Button type="button" variant="outline" onClick={addTask} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Task
                  </Button>
                </div>
                {tasks.map((task, index) => (
                  <div key={index} className="space-y-4 p-4 border rounded-lg">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">Task {index + 1}</h3>
                      {index > 0 && (
                        <Button variant="ghost" size="icon" onClick={() => removeTask(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        value={task.title}
                        onChange={(e) => {
                          const newTasks = [...tasks]
                          newTasks[index].title = e.target.value
                          setTasks(newTasks)
                        }}
                        placeholder="Enter task title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={task.description}
                        onChange={(e) => {
                          const newTasks = [...tasks]
                          newTasks[index].description = e.target.value
                          setTasks(newTasks)
                        }}
                        placeholder="Enter task description"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Points</Label>
                      <Input
                        type="number"
                        value={task.points}
                        onChange={(e) => {
                          const newTasks = [...tasks]
                          newTasks[index].points = parseInt(e.target.value)
                          setTasks(newTasks)
                        }}
                        placeholder="Enter points"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Appearance Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Campaign Appearance</h3>
                <div className="space-y-2">
                  <Label>Campaign Color</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      type="color"
                      value={campaignColor}
                      onChange={(e) => setCampaignColor(e.target.value)}
                      className="w-20 h-10"
                    />
                    <span className="text-sm text-muted-foreground">{campaignColor}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 3 && startDate && endDate && (
          <CampaignPreview
            title={title}
            description={description}
            organization={organization}
            startDate={startDate}
            endDate={endDate}
            tasks={tasks}
            rewardTiers={rewardTiers}
            campaignColor={campaignColor}
          />
        )}

        <div className="mt-6 flex justify-between">
          <Button type="button" variant="outline" onClick={prevStep} disabled={currentStep === 1}>
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Previous
          </Button>
          {currentStep < 3 ? (
            <Button type="button" onClick={nextStep}>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <form onSubmit={handleSubmit}>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Campaign'}
              </Button>
            </form>
          )}
        </div>
      </form>
    </div>
  )
}
