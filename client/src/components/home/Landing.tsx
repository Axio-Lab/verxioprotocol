'use client'

import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { WalletButton } from '@/components/layout/buttonConfig'
import LoyaltyCardCustomizer from '@/components/loyalty/LoyaltyCardCustomizer'
import ProgramCard from '@/components/loyalty/ProgramCard'
import demoSample from '@/app/public/demoSample.png'
import airbillspay from '@/app/public/brandlogo/airbillspay.png'
import nectarfi from '@/app/public/brandlogo/nectarfi.svg'
import XDegen from '@/app/public/brandlogo/XDegen.svg'
import superteamNG from '@/app/public/brandlogo/superteamNG.png'

export default function Landing() {
  const [showCustomizer, setShowCustomizer] = useState(false)
  const { connected } = useWallet()
  const router = useRouter()

  useEffect(() => {
    if (connected) {
      router.push('/dashboard')
    }
  }, [connected, router])

  // Default program card values
  const defaultProgram = {
    programName: 'Dealership Card',
    creator: 'VERXIO76abNGYsQa4vjLcCJ4zx8vbtrVWTR',
    pointsPerAction: { 'Make Purchase': 100, 'Write Review': 50 },
    organizationName: 'Warner & Spencer',
    brandColor: '#ef3635',
    collectionAddress: 'VERXIO25rNGYsQa4vjLAcCJ4zx8vZ4BSqQoCb',
    qrCodeUrl: 'https://verxio.xyz',
    bannerImage: demoSample.src,
  }

  const Footer = () => (
    <div className="w-full py-4 border-t border-white/10 mt-8">
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="text-center text-[10px] text-white/50">
          <p className="pixel-font">© {new Date().getFullYear()} Verxio. All rights reserved.</p>
        </div>
      </div>
    </div>
  )

  const CustomizerView = () => (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-950/20 to-black flex flex-col">
      <div className="flex-grow">
        <div className="max-w-[1400px] mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <Button variant="ghost" className="text-white hover:text-white/70" onClick={() => setShowCustomizer(false)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white orbitron mb-2">Customize Your Loyalty Program</h2>
            <p className="text-white/70">Design your program and preview how it will look</p>
          </div>

          <LoyaltyCardCustomizer />
        </div>
      </div>
      <Footer />
    </div>
  )

  const MainView = () => (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-950/20 to-black flex flex-col">
      <div className="flex-grow">
        <div className="max-w-[1400px] mx-auto px-4 py-20 grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <div className="space-y-8">
            <motion.h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white orbitron"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              All in one
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FFE0] via-[#0085FF] to-[#7000FF]">
                Loyalty Platform
              </span>
            </motion.h1>

            <motion.p
              className="text-lg text-white/70"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Turn customers into brand advocates & businesses into partners with just one platform.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex gap-4 flex-col sm:flex-row"
            >
              <WalletButton
                style={{
                  fontFamily: 'orbitron',
                  background: 'linear-gradient(to right, #00FFE0, #0085FF, #7000FF)',
                  padding: '1.5rem 2rem',
                  color: 'white',
                  fontSize: '1.125rem',
                  width: '100%',
                }}
              />
              <Button
                variant="outline"
                className="border-2 border-[#0085FF] hover:border-[#7000FF] text-white bg-transparent hover:bg-black/20 orbitron px-8 py-6 text-lg transition-all duration-300 w-full sm:w-auto"
                onClick={() => setShowCustomizer(true)}
              >
                Try it for free
              </Button>
            </motion.div>

            <motion.div
              className="pt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <p className="text-white/50 uppercase tracking-wider text-sm mb-4">TRUSTED BY LEADING BRANDS</p>
              <div className="relative w-full overflow-hidden">
                <div className="inline-flex w-[200%] animate-marquee">
                  <div className="flex w-1/2 justify-around items-center">
                    <img src={airbillspay.src} alt="AirbillsPay" className="h-8 w-auto object-contain opacity-40" />
                    <img src={superteamNG.src} alt="SuperteamNG" className="h-12 w-auto object-contain opacity-40" />
                    <img src={nectarfi.src} alt="NectarFi" className="h-10 w-auto object-contain opacity-40" />
                    <img src={XDegen.src} alt="XDegen" className="h-6 w-auto object-contain opacity-40" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Program Card Preview */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Background Elements */}
            <div className="absolute -inset-4 bg-gradient-radial from-[#7000FF]/30 to-transparent opacity-70 blur-xl rounded-full"></div>

            {/* Program Card */}
            <div className="relative flex justify-center">
              <ProgramCard {...defaultProgram} />
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  )

  return showCustomizer ? <CustomizerView /> : <MainView />
}
