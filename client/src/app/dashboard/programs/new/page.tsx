'use client'

import LoyaltyCardCustomizer from '@/components/loyalty/LoyaltyCardCustomizer'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'

export default function NewProgramPage() {
  const router = useRouter()

  const handleRotationComplete = () => {
    // Handle rotation completion if needed
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start gap-5 justify-between md:items-center w-full">
        <h1 className="text-xl md:text-3xl font-bold text-white orbitron">Create New Program</h1>
        <button
          onClick={() => router.back()}
          className="flex items-center self-end md:self-auto gap-2 px-4 py-2 bg-white/10 border border-white/20 hover:bg-white/20 hover:border-white/30 text-white transition-colors rounded-lg orbitron"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>
      </div>

      <LoyaltyCardCustomizer onRotationComplete={handleRotationComplete} />
    </div>
  )
}
