'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { sendMessageToPass, sendBroadcastToCollection } from '@/app/actions/notifications'
import { useWallet } from '@solana/wallet-adapter-react'
import { useNetwork } from '@/lib/network-context'

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState('message')
  const [isLoading, setIsLoading] = useState(false)
  const { publicKey } = useWallet()
  const { network } = useNetwork()

  const [messageForm, setMessageForm] = useState({
    collectionAddress: '',
    passAddress: '',
    message: '',
  })

  const [broadcastForm, setBroadcastForm] = useState({
    collectionAddress: '',
    message: '',
    recipientType: 'all',
    specificRecipients: '',
  })

  const handleMessageSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!publicKey) {
      toast.error('Please connect your wallet')
      return
    }

    setIsLoading(true)
    try {
      await sendMessageToPass({
        collectionAddress: messageForm.collectionAddress,
        passAddress: messageForm.passAddress,
        message: messageForm.message,
        network,
      })
      toast.success('Message sent successfully')
      setMessageForm({ collectionAddress: '', passAddress: '', message: '' })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send message')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBroadcastSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!publicKey) {
      toast.error('Please connect your wallet')
      return
    }

    setIsLoading(true)
    try {
      const recipients =
        broadcastForm.recipientType !== 'all'
          ? {
              type: broadcastForm.recipientType as 'tier' | 'specific',
              value:
                broadcastForm.recipientType === 'specific'
                  ? broadcastForm.specificRecipients.split(',').map((addr) => addr.trim())
                  : undefined,
            }
          : undefined

      await sendBroadcastToCollection({
        collectionAddress: broadcastForm.collectionAddress,
        message: broadcastForm.message,
        network,
        recipients,
      })
      toast.success('Broadcast sent successfully')
      setBroadcastForm({
        collectionAddress: '',
        message: '',
        recipientType: 'all',
        specificRecipients: '',
      })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send broadcast')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Notifications</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="message">Send Message</TabsTrigger>
          <TabsTrigger value="broadcast">Send Broadcast</TabsTrigger>
        </TabsList>

        <TabsContent value="message">
          <Card className="bg-black/20 backdrop-blur-sm border-slate-800/20">
            <CardContent>
              <form onSubmit={handleMessageSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="collectionAddress">Collection Address</Label>
                  <Input
                    id="collectionAddress"
                    value={messageForm.collectionAddress}
                    onChange={(e) => setMessageForm({ ...messageForm, collectionAddress: e.target.value })}
                    placeholder="Enter collection address"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="passAddress">Pass Address</Label>
                  <Input
                    id="passAddress"
                    value={messageForm.passAddress}
                    onChange={(e) => setMessageForm({ ...messageForm, passAddress: e.target.value })}
                    placeholder="Enter pass address"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={messageForm.message}
                    onChange={(e) => setMessageForm({ ...messageForm, message: e.target.value })}
                    placeholder="Enter your message"
                    required
                    className="min-h-[100px]"
                  />
                </div>

                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="broadcast">
          <Card className="bg-black/20 backdrop-blur-sm border-slate-800/20">
            <CardContent>
              <form onSubmit={handleBroadcastSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="broadcastCollectionAddress">Collection Address</Label>
                  <Input
                    id="broadcastCollectionAddress"
                    value={broadcastForm.collectionAddress}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, collectionAddress: e.target.value })}
                    placeholder="Enter collection address"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recipientType">Recipient Type</Label>
                  <Select
                    value={broadcastForm.recipientType}
                    onValueChange={(value) => setBroadcastForm({ ...broadcastForm, recipientType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select recipient type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Holders</SelectItem>
                      <SelectItem value="tier">Specific Tier</SelectItem>
                      <SelectItem value="specific">Specific Holders</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {broadcastForm.recipientType === 'specific' && (
                  <div className="space-y-2">
                    <Label htmlFor="specificRecipients">Recipient Addresses (comma-separated)</Label>
                    <Textarea
                      id="specificRecipients"
                      value={broadcastForm.specificRecipients}
                      onChange={(e) => setBroadcastForm({ ...broadcastForm, specificRecipients: e.target.value })}
                      placeholder="Enter recipient addresses separated by commas"
                      required
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="broadcastMessage">Message</Label>
                  <Textarea
                    id="broadcastMessage"
                    value={broadcastForm.message}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                    placeholder="Enter your broadcast message"
                    required
                    className="min-h-[100px]"
                  />
                </div>

                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? 'Sending...' : 'Send Broadcast'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
