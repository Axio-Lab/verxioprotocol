'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Search, Download, Gift } from 'lucide-react'
import { useWalletUi } from '@wallet-ui/react'
import { useDashboard } from '../DashboardContext'
import LoyaltyCard from '@/components/loyalty/LoyaltyCard'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { toPng } from 'html-to-image'
import { useRef } from 'react'

export default function MyPassesPage() {
  const { connected } = useWalletUi()
  const { isOrganization } = useDashboard()
  const cardRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  if (!connected) {
    return null
  }

  const handleDownload = async (passId: string) => {
    const cardElement = cardRefs.current[passId]
    if (!cardElement) return

    try {
      const dataUrl = await toPng(cardElement, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: 'transparent',
      })

      const link = document.createElement('a')
      link.download = `loyalty-pass-${passId}.png`
      link.href = dataUrl
      link.click()
    } catch (error) {
      console.error('Error downloading card:', error)
    }
  }

  // Demo data for passes - empty array to show no passes state
  const passes = [
    {
      id: 'tech-masters',
      programName: 'Tech Masters',
      logo: '',
      tier: 'Gold',
      points: 2450,
      memberName: 'John Doe',
      programColor: 'purple' as const,
      qrCodeData: 'https://verxio.io/passes/tech-masters',
    },
    {
      id: 'coffee-hub',
      programName: 'Coffee Hub',
      logo: '',
      tier: 'Platinum',
      points: 5280,
      memberName: 'John Doe',
      programColor: 'blue' as const,
      qrCodeData: 'https://verxio.io/passes/coffee-hub',
    },
    {
      id: 'fitness-club',
      programName: 'Fitness Club',
      logo: '',
      tier: 'Silver',
      points: 850,
      memberName: 'John Doe',
      programColor: 'cyan' as const,
      qrCodeData: 'https://verxio.io/passes/fitness-club',
    },
    {
      id: 'bookworms',
      programName: 'Bookworms',
      logo: '',
      tier: 'Bronze',
      points: 320,
      memberName: 'John Doe',
      programColor: 'pink' as const,
      qrCodeData: 'https://verxio.io/passes/bookworms',
    },
  ]

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white orbitron">My Passes</h1>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
          <Input
            type="search"
            placeholder="Search passes..."
            className="w-full bg-black/20 border-verxio-purple/20 pl-9 text-white placeholder:text-white/50"
          />
        </div>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {passes.length > 0 ? (
          passes.map((pass) => (
            <motion.div key={pass.id} variants={item} className="flex flex-col items-center gap-4">
              <div
                ref={(el) => {
                  cardRefs.current[pass.id] = el
                }}
                className="w-full max-w-[400px]"
              >
                <LoyaltyCard
                  programName={pass.programName}
                  logo={pass.logo}
                  tier={pass.tier}
                  points={pass.points}
                  memberName={pass.memberName}
                  programColor={pass.programColor}
                  qrCodeData={pass.qrCodeData}
                />
              </div>
              <Button
                onClick={() => handleDownload(pass.id)}
                className="bg-gradient-to-r from-[#00FFE0] via-[#0085FF] to-[#7000FF] text-white hover:opacity-90 transition-opacity"
              >
                <Download className="mr-2 h-4 w-4" />
                Download Pass
              </Button>
            </motion.div>
          ))
        ) : (
          <motion.div variants={item} className="col-span-full">
            <Card className="bg-black/20 border-verxio-purple/20">
              <CardContent className="flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-verxio-purple/10 flex items-center justify-center mb-4">
                  <Gift className="h-8 w-8 text-verxio-purple" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No Loyalty Passes Found</h3>
                <p className="text-white/70 mb-6 max-w-md">
                  You haven't joined any loyalty programs yet. Start exploring available programs to earn rewards and
                  benefits.
                </p>
                <Button className="bg-gradient-to-r from-[#00FFE0] via-[#0085FF] to-[#7000FF] text-white hover:opacity-90 transition-opacity">
                  Explore Programs
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
