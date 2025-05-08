'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface DashboardContextType {
  isSidebarOpen: boolean
  isOrganization: boolean
  toggleSidebar: () => void
  setIsSidebarOpen: (value: boolean) => void
  setIsOrganization: (value: boolean) => void
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [isOrganization, setIsOrganization] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  return (
    <DashboardContext.Provider
      value={{ isOrganization, setIsOrganization, toggleSidebar, isSidebarOpen, setIsSidebarOpen }}
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
