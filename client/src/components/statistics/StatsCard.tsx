'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { motion } from 'framer-motion'

interface StatsCardProps {
  title: string
  value: number
  description?: string
  prefix?: string
  suffix?: string
  icon?: React.ReactNode
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  color?: 'purple' | 'blue' | 'cyan' | 'pink' | 'green'
}

export default function StatsCard({
  title,
  value,
  description,
  prefix = '',
  suffix = '',
  icon,
  trend = 'neutral',
  trendValue = '',
  color = 'purple',
}: StatsCardProps) {
  const [displayValue, setDisplayValue] = useState(0)

  // Colors based on the theme
  const colorMap = {
    purple: {
      bgFrom: 'from-verxio-purple/10',
      bgTo: 'to-verxio-purple/5',
      iconBg: 'bg-verxio-purple/20',
      iconColor: 'text-verxio-purple',
      textColor: 'text-verxio-purple',
      borderColor: 'border-verxio-purple/20',
      shadowColor: 'shadow-neon-purple',
    },
    blue: {
      bgFrom: 'from-verxio-blue/10',
      bgTo: 'to-verxio-blue/5',
      iconBg: 'bg-verxio-blue/20',
      iconColor: 'text-verxio-blue',
      textColor: 'text-verxio-blue',
      borderColor: 'border-verxio-blue/20',
      shadowColor: 'shadow-neon-blue',
    },
    cyan: {
      bgFrom: 'from-verxio-cyan/10',
      bgTo: 'to-verxio-cyan/5',
      iconBg: 'bg-verxio-cyan/20',
      iconColor: 'text-verxio-cyan',
      textColor: 'text-verxio-cyan',
      borderColor: 'border-verxio-cyan/20',
      shadowColor: 'shadow-neon-cyan',
    },
    pink: {
      bgFrom: 'from-verxio-pink/10',
      bgTo: 'to-verxio-pink/5',
      iconBg: 'bg-verxio-pink/20',
      iconColor: 'text-verxio-pink',
      textColor: 'text-verxio-pink',
      borderColor: 'border-verxio-pink/20',
      shadowColor: 'shadow-neon-pink',
    },
    green: {
      bgFrom: 'from-verxio-green/10',
      bgTo: 'to-verxio-green/5',
      iconBg: 'bg-verxio-green/20',
      iconColor: 'text-verxio-green',
      textColor: 'text-verxio-green',
      borderColor: 'border-verxio-green/20',
      shadowColor: 'shadow-neon-green',
    },
  }

  // Trend icons and colors
  const trendConfig = {
    up: {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-green-500"
        >
          <path d="m18 15-6-6-6 6" />
        </svg>
      ),
      color: 'text-green-500',
    },
    down: {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-red-500"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      ),
      color: 'text-red-500',
    },
    neutral: {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-gray-500"
        >
          <path d="M5 12h14" />
        </svg>
      ),
      color: 'text-gray-500',
    },
  }

  const colors = colorMap[color]

  // Animate the count up
  useEffect(() => {
    const duration = 1000 // ms
    const frameDuration = 1000 / 60 // 60fps
    const totalFrames = Math.round(duration / frameDuration)
    let frame = 0

    const counter = setInterval(() => {
      frame++
      const progress = frame / totalFrames
      const currentCount = Math.round(value * progress)

      setDisplayValue(currentCount)

      if (frame === totalFrames) {
        clearInterval(counter)
      }
    }, frameDuration)

    return () => clearInterval(counter)
  }, [value])

  return (
    <Card className={`border ${colors.borderColor} bg-gradient-to-b ${colors.bgFrom} ${colors.bgTo} overflow-hidden`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-white/80">{title}</h3>
          {icon && <div className={`p-2 rounded-full ${colors.iconBg} ${colors.iconColor}`}>{icon}</div>}
        </div>

        <div className="flex items-baseline">
          {prefix && <span className="text-xl font-medium text-white mr-1">{prefix}</span>}
          <motion.span
            key={value}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-3xl font-bold ${colors.textColor}`}
          >
            {displayValue.toLocaleString()}
          </motion.span>
          {suffix && <span className="text-xl font-medium text-white ml-1">{suffix}</span>}
        </div>

        {(description || trendValue) && (
          <div className="mt-2 flex items-center gap-1.5">
            {trendValue && (
              <>
                {trendConfig[trend].icon}
                <span className={`text-xs font-medium ${trendConfig[trend].color}`}>{trendValue}</span>
              </>
            )}
            {description && (
              <span className="orbitron text-[10px] text-white/60">
                {trendValue && ' · '}
                {description}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
