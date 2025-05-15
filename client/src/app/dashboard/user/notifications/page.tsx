'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useWallet } from '@solana/wallet-adapter-react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Message {
  id: string
  content: string
  sender: string
  timestamp: number
  read: boolean
}

interface Broadcast {
  id: string
  content: string
  sender: string
  timestamp: number
  read: boolean
  recipients?: {
    type: 'all' | 'tier' | 'specific'
    value?: string[]
  }
}

export default function UserNotificationsPage() {
  const [activeTab, setActiveTab] = useState('messages')
  const [messages, setMessages] = useState<Message[]>([])
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { publicKey } = useWallet()

  useEffect(() => {
    async function fetchNotifications() {
      if (!publicKey) return

      try {
        // TODO: Implement API calls to fetch messages and broadcasts
        // For now, showing placeholder data
        setMessages([
          {
            id: '1',
            content: 'Welcome to our loyalty program!',
            sender: 'Program Authority',
            timestamp: Date.now(),
            read: false,
          },
        ])

        setBroadcasts([
          {
            id: '1',
            content: 'New rewards available for all members!',
            sender: 'Program Authority',
            timestamp: Date.now(),
            read: false,
          },
        ])
      } catch (error) {
        toast.error('Failed to fetch notifications')
      } finally {
        setIsLoading(false)
      }
    }

    fetchNotifications()
  }, [publicKey])

  if (!publicKey) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-white">Notifications</h1>
          <p className="text-white/70">Please connect your wallet to view notifications</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-12 h-12 animate-spin text-verxio-purple" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Notifications</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="broadcasts">Broadcasts</TabsTrigger>
        </TabsList>

        <TabsContent value="messages">
          {messages.length === 0 ? (
            <Card className="bg-black/20 backdrop-blur-sm border-slate-800/20">
              <CardContent className="p-6 text-center">
                <p className="text-white/70">No messages yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <Card key={message.id} className="bg-black/20 backdrop-blur-sm border-slate-800/20">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-sm text-white/70">{message.sender}</div>
                      <div className="text-sm text-white/70">{new Date(message.timestamp).toLocaleDateString()}</div>
                    </div>
                    <p className="text-white">{message.content}</p>
                    {!message.read && (
                      <div className="mt-2">
                        <span className="inline-block px-2 py-1 text-xs rounded-full bg-verxio-purple/20 text-verxio-purple">
                          New
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="broadcasts">
          {broadcasts.length === 0 ? (
            <Card className="bg-black/20 backdrop-blur-sm border-slate-800/20">
              <CardContent className="p-6 text-center">
                <p className="text-white/70">No broadcasts yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {broadcasts.map((broadcast) => (
                <Card key={broadcast.id} className="bg-black/20 backdrop-blur-sm border-slate-800/20">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-sm text-white/70">{broadcast.sender}</div>
                      <div className="text-sm text-white/70">{new Date(broadcast.timestamp).toLocaleDateString()}</div>
                    </div>
                    <p className="text-white">{broadcast.content}</p>
                    {!broadcast.read && (
                      <div className="mt-2">
                        <span className="inline-block px-2 py-1 text-xs rounded-full bg-verxio-purple/20 text-verxio-purple">
                          New
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
