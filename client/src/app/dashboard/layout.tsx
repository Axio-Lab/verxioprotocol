'use client'

import { useRouter } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useEffect } from 'react'
import DashboardNav from '@/components/dashboard/DashboardNav'
import { DashboardProvider, useDashboard } from './DashboardContext'
import useMediaQuery from '@/components/hooks/useMediaQuerry'

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { connected } = useWallet()
  const router = useRouter()
  const isAboveMobileDevices = useMediaQuery('(min-width: 768px)')
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
    if (isAboveMobileDevices) {
      setIsSidebarOpen(false)
    }
  }, [isAboveMobileDevices])

  console.log('isSidebarOpen value:', isSidebarOpen)

  // <div
  //   className={`z-50 flex flex-col h-full p-4 border-4 border-red-500 transition-all duration-300 ease-in-out ${
  //     isOpen ? 'translate-x-0' : '-translate-x-full'
  //   } rounded-lg`}
  // >
  // <div
  //   className={`z-[999] flex flex-col h-full p-4 transition-all duration-300 ease-in-out border border-red-500 ${
  //     isOpen ? 'translate-x-0' : '-translate-x-full'
  //   } md:translate-x-0 rounded-lg`}
  // ></div>

  return (
    <div className="relative flex min-h-screen">
      <div
        className={`hidden md:flex w-64 flex-col gap-4 border-r border-verxio-purple/20 bg-black/20 p-4 fixed h-full 
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-all duration-300 ease-in-out`}
      >
        <DashboardNav isOrganization={isOrganization} />
      </div>
      <main className="flex-1 p-4 md:p-8 md:ml-64 overflow-y-auto">{children}</main>

      <span
        onClick={toggleSidebar}
        className="bg-black/20 shadow-sm p-2 rounded md:hidden fixed top-10 right-10 cursor-pointer transition-all duration-300 z-50"
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
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
