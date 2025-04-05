'use client'

import LoyaltyCardCustomizer from '@/components/loyalty/LoyaltyCardCustomizer'
import { useRouter } from 'next/navigation'

export default function NewProgramPage() {
  const router = useRouter()

  const handleRotationComplete = () => {
    // Handle rotation completion if needed
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white orbitron">Create New Program</h1>
        <button onClick={() => router.back()} className="text-white/70 hover:text-white transition-colors">
          Cancel
        </button>
      </div>

      <LoyaltyCardCustomizer onRotationComplete={handleRotationComplete} />
    </div>
  )
}
