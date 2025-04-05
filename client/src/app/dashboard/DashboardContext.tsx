'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface DashboardContextType {
  isOrganization: boolean
  setIsOrganization: (value: boolean) => void
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [isOrganization, setIsOrganization] = useState(false)

  return <DashboardContext.Provider value={{ isOrganization, setIsOrganization }}>{children}</DashboardContext.Provider>
}

export function useDashboard() {
  const context = useContext(DashboardContext)
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider')
  }
  return context
}
