'use client'

import { useState, useEffect } from 'react'
import QRCode from 'react-qr-code'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'

interface LoyaltyCardProps {
  programName?: string
  logo?: string
  tier?: string
  points?: number
  memberName?: string
  programColor?: 'purple' | 'blue' | 'cyan' | 'pink' | 'green'
  qrCodeData?: string
}

export default function LoyaltyCard({
  programName = 'Sample Loyalty Program',
  logo = '',
  tier = 'Silver',
  points = 750,
  memberName = 'John Doe',
  programColor = 'purple',
  qrCodeData = 'https://verxio.io/sample',
}: LoyaltyCardProps) {
  const [isCustomizing, setIsCustomizing] = useState(false)

  // Colors for each theme
  const themeColors = {
    purple: {
      primary: '#9d4edd',
      secondary: '#4361ee',
      glow: 'shadow-neon-purple',
      textGlow: 'text-glow',
      gradientFrom: 'from-verxio-neon-purple',
      gradientTo: 'to-verxio-purple',
      borderStyle: 'border-2 border-verxio-purple/30 shadow-[0_0_15px_rgba(157,78,221,0.3)]',
    },
    blue: {
      primary: '#4361ee',
      secondary: '#3772ff',
      glow: 'shadow-neon-blue',
      textGlow: 'text-glow',
      gradientFrom: 'from-verxio-neon-blue',
      gradientTo: 'to-verxio-blue',
      borderStyle: 'border-2 border-verxio-blue/30 shadow-[0_0_15px_rgba(67,97,238,0.3)]',
    },
    cyan: {
      primary: '#4cc9f0',
      secondary: '#3bf0bb',
      glow: 'shadow-neon-cyan',
      textGlow: 'text-glow-cyan',
      gradientFrom: 'from-verxio-cyan',
      gradientTo: 'to-verxio-green',
      borderStyle: 'border-2 border-verxio-cyan/30 shadow-[0_0_15px_rgba(76,201,240,0.3)]',
    },
    pink: {
      primary: '#f72585',
      secondary: '#ff49db',
      glow: 'shadow-neon-pink',
      textGlow: 'text-glow',
      gradientFrom: 'from-verxio-pink',
      gradientTo: 'to-verxio-neon-pink',
      borderStyle: 'border-2 border-verxio-pink/30 shadow-[0_0_15px_rgba(247,37,133,0.3)]',
    },
    green: {
      primary: '#2fc6a4',
      secondary: '#3bf0bb',
      glow: 'shadow-neon-green',
      textGlow: 'text-glow-cyan',
      gradientFrom: 'from-verxio-green',
      gradientTo: 'to-verxio-neon-green',
      borderStyle: 'border-2 border-verxio-green/30 shadow-[0_0_15px_rgba(47,198,164,0.3)]',
    },
  }

  const colors = themeColors[programColor]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`card-border-gradient ${colors.borderStyle}`}
      style={{ maxWidth: '400px', width: '100%' }}
    >
      <div className={`loyalty-card p-6 backdrop-blur-md ${isCustomizing ? 'opacity-70' : ''}`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {logo ? (
              <Image
                src={logo}
                alt={`${programName} logo`}
                width={40}
                height={40}
                className="rounded-full object-cover"
              />
            ) : (
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r ${colors.gradientFrom} ${colors.gradientTo} ${colors.glow}`}
              >
                <span className="text-white font-bold text-sm">{programName.substring(0, 1)}</span>
              </div>
            )}
            <div>
              <h3 className={`pixel-font text-xs font-bold text-white ${colors.textGlow} uppercase tracking-tight`}>
                {programName}
              </h3>
              <p className="text-white/70 text-[10px]">Powered by Verxio</p>
            </div>
          </div>
          <Badge
            className="pixel-font py-1 px-3 text-xs tracking-wide uppercase"
            style={{
              backgroundColor: colors.primary,
              boxShadow: `0 0 10px ${colors.primary}40`,
              color: 'white',
            }}
          >
            {tier}
          </Badge>
        </div>

        <div className="my-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-white/70">Member</span>
            <span className="pixel-title text-white/70">Points</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-white">{memberName}</span>
            <div className="flex items-center gap-1.5">
              <span className="pixel-font text-lg font-bold" style={{ color: colors.primary }}>
                {points}
              </span>
              <motion.svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="animate-pulse"
                style={{ color: colors.primary }}
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
              </motion.svg>
            </div>
          </div>
        </div>

        <div className="flex justify-center mb-4">
          <div
            className="p-3 bg-white rounded-xl"
            style={{
              boxShadow: `0 0 15px ${colors.primary}30`,
            }}
          >
            <QRCode
              value={qrCodeData}
              size={150}
              style={{
                height: 'auto',
                maxWidth: '100%',
                width: '100%',
              }}
            />
          </div>
        </div>

        <div className="flex justify-between items-center text-sm text-white/70">
          <div className="flex flex-col">
            <span className="pixel-title text-xs">Issued</span>
            <span>March 31, 2025</span>
          </div>
          <div className="flex flex-col text-right">
            <span className="pixel-title text-xs">Last action</span>
            <span>Today, 10:45 AM</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
