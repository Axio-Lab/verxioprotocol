'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface WheelProps {
  participants: string[]
}

const COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#96CEB4', // Green
  '#FFEEAD', // Yellow
  '#D4A5A5', // Pink
  '#9B59B6', // Purple
  '#3498DB', // Light Blue
  '#E67E22', // Orange
  '#2ECC71', // Emerald
]

export function Wheel({ participants }: WheelProps) {
  const wheelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (wheelRef.current) {
      const wheel = wheelRef.current
      const segments = participants.length
      const segmentAngle = 360 / segments

      // Create wheel segments
      wheel.style.setProperty('--segments', segments.toString())
      wheel.style.setProperty('--segment-angle', `${segmentAngle}deg`)
    }
  }, [participants])

  return (
    <div className="relative w-[400px] h-[400px]">
      {/* Outer ring */}
      <div className="absolute inset-0 rounded-full border-8 border-verxio-purple/30 shadow-lg" />

      {/* Wheel */}
      <motion.div
        ref={wheelRef}
        className="wheel absolute inset-0 rounded-full overflow-hidden shadow-inner"
        animate={{
          rotate: [0, 360 * 5], // 5 full rotations
        }}
        transition={{
          duration: 3,
          ease: 'easeInOut',
        }}
      >
        {participants.map((_, index) => (
          <div
            key={index}
            className="wheel-segment absolute inset-0 origin-center"
            style={{
              transform: `rotate(${(360 / participants.length) * index}deg)`,
              backgroundColor: COLORS[index % COLORS.length],
              clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos((2 * Math.PI) / participants.length)}% ${50 + 50 * Math.sin((2 * Math.PI) / participants.length)}%)`,
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-1 h-8 bg-white/20" />
            </div>
          </div>
        ))}
      </motion.div>

      {/* Center circle */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-verxio-purple flex items-center justify-center shadow-lg">
          <div className="w-8 h-8 rounded-full bg-white" />
        </div>
      </div>

      {/* Pointer */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="w-0 h-0 border-l-[15px] border-r-[15px] border-b-[30px] border-l-transparent border-r-transparent border-b-verxio-purple" />
      </div>

      {/* Glow effect */}
      <div className="absolute inset-0 rounded-full bg-verxio-purple/10 blur-xl" />
    </div>
  )
}
