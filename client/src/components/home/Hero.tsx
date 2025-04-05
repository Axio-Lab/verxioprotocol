'use client'
import LoyaltyCardCustomizer from '@/components/loyalty/LoyaltyCardCustomizer'
import { motion } from 'framer-motion'
import { useState } from 'react'

const colorOptions = [
  { name: 'Purple', value: 'purple' },
  { name: 'Blue', value: 'blue' },
  { name: 'Cyan', value: 'cyan' },
  { name: 'Pink', value: 'pink' },
  { name: 'Green', value: 'green' },
]

export default function Hero() {
  const [currentThemeIndex, setCurrentThemeIndex] = useState(0)

  const handleRotationComplete = () => {
    setCurrentThemeIndex((prev) => (prev + 1) % colorOptions.length)
  }

  return (
    <div className="container mx-auto py-10 px-4 md:px-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center mb-20"
      >
        <h1
          className={`text-3xl md:text-4xl font-bold text-white text-glow gradient-text leading-tight tracking-wide mb-4 text-verxio-${colorOptions[currentThemeIndex].value}`}
        >
          Design Your Loyalty Program
        </h1>
        <p className="pixel-font text-xs text-white/70 max-w-3xl mx-auto">
          Customize your loyalty program's appearance and settings to perfectly match your brand identity.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-20"
      >
        <LoyaltyCardCustomizer onRotationComplete={handleRotationComplete} />
      </motion.div>
    </div>
  )
}
