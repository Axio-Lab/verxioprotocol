'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

export type Network = 'devnet' | 'mainnet-beta'

interface NetworkContextType {
  network: Network
  setNetwork: (network: Network) => void
  rpcEndpoint: string
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined)

export const RPC_ENDPOINTS = {
  devnet: 'https://api.devnet.solana.com',
  'mainnet-beta': `https://mainnet.helius-rpc.com/?api-key=${process.env.NEXT_PUBLIC_HELIUS_API_KEY}`,
}

export function NetworkProvider({ children }: { children: ReactNode }) {
  const [network, setNetwork] = useState<Network>('devnet')
  const rpcEndpoint = RPC_ENDPOINTS[network]

  return <NetworkContext.Provider value={{ network, setNetwork, rpcEndpoint }}>{children}</NetworkContext.Provider>
}

export function useNetwork() {
  const context = useContext(NetworkContext)
  if (context === undefined) {
    throw new Error('useNetwork must be used within a NetworkProvider')
  }
  return context
}
