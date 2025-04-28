'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Clock } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#00FFE0] via-[#0085FF] to-[#7000FF] text-transparent bg-clip-text orbitron">
          Contests
        </h1>
      </div>

      <Card className="bg-black/20 backdrop-blur-sm border-slate-800/20">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4">
            <Clock className="w-12 h-12 text-[#00FFE0]" />
          </div>
          <h2 className="text-xl font-semibold text-white orbitron mb-2">Coming Soon</h2>
          <p className="text-white/70 text-center max-w-md">
            We're working on something exciting! The contest page will be available soon.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
