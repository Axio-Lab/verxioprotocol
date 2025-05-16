import { motion } from 'framer-motion'
import QRCode from 'react-qr-code'
import { Badge } from '@/components/ui/badge'
import { Users, Gift, Download, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useRef } from 'react'
import Image from 'next/image'
import demoImage from '@/app/public/demoImage.png'
import * as htmlToImage from 'html-to-image'

interface ProgramCardProps {
  programName: string
  creator: string
  pointsPerAction: Record<string, number>
  organizationName?: string
  brandColor?: string
  collectionAddress: string
  qrCodeUrl: string
  bannerImage?: string | null
}

export default function ProgramCard({
  programName = 'Sample Program',
  creator = '7YarZW...',
  pointsPerAction = { purchase: 100, review: 50 },
  organizationName = 'Verxio Protocol',
  brandColor = '#00adef',
  collectionAddress,
  qrCodeUrl,
  bannerImage = null,
}: ProgramCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const totalEarnablePoints = Object.values(pointsPerAction).reduce((sum, points) => sum + points, 0)

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
      // Use htmlToImage for better quality
      const dataUrl = await htmlToImage.toPng(cardRef.current, {
        quality: 1,
        pixelRatio: 2, // Higher resolution
        style: {
          transform: 'scale(1)', // Remove any active animations
          opacity: '1',
        },
      })

      const link = document.createElement('a')
      link.href = dataUrl
      link.download = `${programName}-program-card.png`
      link.click()
      toast.success('Program card downloaded successfully!')
    } catch (error) {
      console.error('PNG download error:', error)
      toast.error('Failed to download program card')
    }
  }

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(qrCodeUrl)
      toast.success('Program URL copied to clipboard!')
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
        className="card-border-gradient w-[450px] h-[600px]"
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
              <p className="text-white/70 text-sm truncate" title={organizationName}>
                by {organizationName}
              </p>
            </div>
            <div
              className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full"
              style={{
                background: `linear-gradient(135deg, ${brandColor}, ${brandColor}dd)`,
                boxShadow: `0 0 15px ${brandColor}40`,
              }}
            >
              <Gift className="w-6 h-6 text-white" />
            </div>
          </div>

          {/* Banner Image Section - Increased size */}
          <div className="flex-grow flex justify-center items-center mb-4">
            <div
              className="w-full h-[250px] rounded-2xl overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${brandColor}, ${brandColor}dd)`,
                boxShadow: `0 0 15px ${brandColor}40`,
              }}
            >
              <Image
                src={bannerImage || demoImage}
                alt="Program Preview"
                width={400}
                height={250}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Program Details - Compact version */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-white/70">Total Earnable Points</span>
              <Badge
                className="pixel-font py-1 px-3"
                style={{
                  backgroundColor: brandColor,
                  boxShadow: `0 0 10px ${brandColor}40`,
                  color: 'white',
                }}
              >
                {totalEarnablePoints} XP
              </Badge>
            </div>
            {/* <div className="space-y-1">
              <p className="text-[10.5px] text-white/50 font-mono truncate" title={creator}>
                Creator: {creator}
              </p>
              <p className="text-[10.5px] text-white/50 font-mono truncate" title={collectionAddress}>
                Collection: {collectionAddress}
              </p>
            </div> */}
            <div className="pt-4 border-t border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white/50 text-sm">
                  <Users className="w-4 h-4" />
                  <span>Scan QR to join program</span>
                </div>
                <div className="bg-white p-2 rounded-lg">
                  <QRCode
                    value={qrCodeUrl}
                    size={80}
                    style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                    level="H"
                  />
                </div>
              </div>
              <div className="pt-2 text-center">
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
