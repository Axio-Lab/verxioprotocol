'use client'

import { useRef } from 'react'
import QRCode from 'react-qr-code'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Users, Download, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import html2canvas from 'html2canvas'

interface LoyaltyCardProps {
  programName: string
  owner: string
  pointsPerAction: Record<string, number>
  hostName?: string
  brandColor?: string
  loyaltyPassAddress: string
  qrCodeUrl: string
  totalEarnedPoints: number
  tier: string
  lastAction?: string | null
  rewards?: string[]
}

export default function LoyaltyCard({
  programName = 'Sample Program',
  owner = '7YarZW...',
  pointsPerAction = { purchase: 100, review: 50 },
  hostName = 'Verxio Protocol',
  brandColor = '#9d4edd',
  loyaltyPassAddress,
  qrCodeUrl,
  totalEarnedPoints = 0,
  tier = 'Bronze',
  lastAction = null,
  rewards = [],
}: LoyaltyCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  // Create gradient colors based on brand color
  const gradientColors = {
    primary: brandColor,
    glow: 'shadow-neon-purple',
    textGlow: 'text-glow',
    borderStyle: `border-2 border-opacity-30 shadow-[0_0_15px_rgba(157,78,221,0.3)]`,
  }

  const downloadAsImage = async () => {
    if (!cardRef.current) return
    try {
      const canvas = await html2canvas(cardRef.current)
      const image = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.href = image
      link.download = `${programName}-loyalty-card.png`
      link.click()
      toast.success('Loyalty card downloaded successfully!')
    } catch (error) {
      toast.error('Failed to download loyalty card')
    }
  }

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(qrCodeUrl)
      toast.success('Loyalty card URL copied to clipboard!')
    } catch (error) {
      toast.error('Failed to copy URL')
    }
  }

  return (
    <div className="space-y-2">
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="card-border-gradient w-[450px] h-[650px]"
        style={{
          borderColor: brandColor,
          boxShadow: `0 0 15px ${brandColor}40`,
        }}
      >
        <div className="p-6 backdrop-blur-md h-full flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0 mr-4">
              <h2
                className={`pixel-font text-xl font-bold text-white ${gradientColors.textGlow} mb-1 truncate`}
                style={{ textShadow: `0 0 10px ${brandColor}` }}
                title={programName}
              >
                {programName}
              </h2>
              <p className="text-white/70 text-sm truncate" title={hostName}>
                by {hostName}
              </p>
            </div>
            <div
              className="relative px-4 py-2 rounded-lg overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${brandColor}40, ${brandColor}20)`,
                border: `1px solid ${brandColor}40`,
              }}
            >
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  background: `linear-gradient(45deg, ${brandColor} 0%, transparent 100%)`,
                }}
              />
              <div className="relative">
                <span className="text-white orbitron font-bold text-sm tracking-wider uppercase">{tier}</span>
              </div>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="flex-grow flex justify-center items-center mb-4">
            <div
              className="p-4 rounded-2xl"
              style={{
                background: `linear-gradient(135deg, ${brandColor}, ${brandColor}dd)`,
                boxShadow: `0 0 15px ${brandColor}40`,
              }}
            >
              <div className="bg-white p-2 rounded-lg">
                <QRCode value={qrCodeUrl} size={250} style={{ height: 'auto', maxWidth: '100%', width: '100%' }} />
              </div>
            </div>
          </div>

          {/* Card Details */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-white/70">Total Earned Points</span>
              <Badge
                className="pixel-font py-1 px-3"
                style={{
                  backgroundColor: brandColor,
                  boxShadow: `0 0 10px ${brandColor}40`,
                  color: 'white',
                }}
              >
                {totalEarnedPoints} XP
              </Badge>
            </div>
            {lastAction && (
              <div className="flex items-center justify-between">
                <span className="text-white/70">Last Action</span>
                <span className="text-white/90 text-sm">{lastAction}</span>
              </div>
            )}
            {rewards.length > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-white/70">Current Reward</span>
                <Badge
                  className="pixel-font py-1 px-2 text-[10px]"
                  style={{
                    backgroundColor: `${brandColor}40`,
                    color: 'white',
                  }}
                >
                  {rewards[0]}
                </Badge>
              </div>
            )}
            <div className="space-y-1">
              <p className="text-[10.5px] text-white/50 font-mono truncate" title={owner}>
                Owner: {owner}
              </p>
              <p className="text-[10.5px] text-white/50 font-mono truncate" title={loyaltyPassAddress}>
                Pass: {loyaltyPassAddress}
              </p>
            </div>
            <div className="pt-4 border-t border-white/10">
              <div className="flex items-center gap-2 text-white/50 text-sm">
                <Users className="w-4 h-4" />
                <span>Scan QR to join program</span>
              </div>
              <div className="pt-4 text-center">
                <p className="text-[10px] text-white/30">Powered by Verxio Protocol</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-2">
        <Button variant="outline" size="sm" className="w-full" onClick={downloadAsImage}>
          <Download className="w-4 h-4 mr-2" />
          Save as PNG
        </Button>
        <Button variant="outline" size="sm" className="w-full" onClick={copyUrl}>
          <Copy className="w-4 h-4 mr-2" />
          Copy URL
        </Button>
      </div>
    </div>
  )
}
