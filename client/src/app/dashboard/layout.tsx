'use client'

import { useRouter } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useEffect, useState } from 'react'
import DashboardNav from '@/components/dashboard/DashboardNav'
import { DashboardProvider, useDashboard } from './DashboardContext'
import useMediaQuery from '@/components/hooks/useMediaQuerry'
import 'aos/dist/aos.css'

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { connected } = useWallet()
  const [hasMounted, setHasMounted] = useState(false)
  const isSmallDevices = useMediaQuery('(max-width: 768px)')
  const { isOrganization, toggleSidebar, isSidebarOpen, setIsSidebarOpen } = useDashboard()

  useEffect(() => {
    if (!connected) {
      router.push('/')
    }
  }, [connected, router])

  if (!connected) {
    return null
  }

  useEffect(() => {
    setHasMounted(true)
    setIsSidebarOpen(isSmallDevices)
  }, [isSmallDevices])

  if (!hasMounted) return null
  return (
    <div className="relative flex min-h-screen">
      <div
        className={`z-90 w-64 flex-col gap-4 border-r border-verxio-purple/20 bg-black p-4 fixed h-full 
          ${!isSidebarOpen ? 'translate-x-0 flex slideInLeft' : 'hidden -translate-x-full slideOutLeft'} transition-all duration-300 ease-in-out`}
      >
        <DashboardNav
          isOrganization={isOrganization}
          isSmallDevices={isSmallDevices}
          setIsSidebarOpen={setIsSidebarOpen}
        />
      </div>
      <main className="flex-1 p-4 md:p-8 md:ml-64 overflow-y-auto">{children}</main>

      <span
        onClick={toggleSidebar}
        className="bg-verxio-purple/20 shadow-sm p-2 rounded md:hidden fixed top-4 right-10 cursor-pointer transition-all duration-300 z-99"
      >
        {isSidebarOpen ? <Menu size={24} /> : <X size={24} />}
      </span>
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
