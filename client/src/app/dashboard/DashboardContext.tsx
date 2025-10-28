'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

interface DashboardContextType {
  isOrganization: boolean
  setIsOrganization: (value: boolean) => void
  isSidebarOpen: boolean
  setIsSidebarOpen: (value: boolean) => void
  toggleSidebar: () => void
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [isOrganization, setIsOrganization] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const pathname = usePathname()

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  useEffect(() => {
    // Set the view based on the current route
    setIsOrganization(!pathname.includes('/dashboard/user'))
  }, [pathname])

  return (
    <DashboardContext.Provider
      value={{
        isOrganization,
        setIsOrganization,
        isSidebarOpen,
        setIsSidebarOpen,
        toggleSidebar,
      }}
    >
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard() {
  const context = useContext(DashboardContext)
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider')
  }
  return context
}
