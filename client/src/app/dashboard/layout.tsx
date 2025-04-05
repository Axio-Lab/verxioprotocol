'use client'

import { useWalletUi } from '@wallet-ui/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import DashboardNav from '@/components/dashboard/DashboardNav'
import { DashboardProvider, useDashboard } from './DashboardContext'

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { connected } = useWalletUi()
  const router = useRouter()
  const { isOrganization } = useDashboard()

  useEffect(() => {
    if (!connected) {
      router.push('/')
    }
  }, [connected, router])

  if (!connected) {
    return null
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden md:flex w-64 flex-col gap-4 border-r border-verxio-purple/20 bg-black/20 p-4">
        <DashboardNav isOrganization={isOrganization} />
      </div>
      <main className="flex-1 p-4 md:p-8">{children}</main>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </DashboardProvider>
  )
}
