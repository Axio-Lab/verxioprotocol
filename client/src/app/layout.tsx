import type { Metadata } from 'next'
import { Orbitron, Press_Start_2P, Kalam } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import '@wallet-ui/tailwind/index.css'
import WalletProvider from '@/components/providers/WalletProvider'

const orbitron = Orbitron({
  variable: '--font-orbitron',
  subsets: ['latin'],
  display: 'swap',
})

const pressStart2P = Press_Start_2P({
  variable: '--font-press-start-2p',
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
})

const kalam = Kalam({
  variable: '--font-kalam',
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Verxio - On-Chain Loyalty Program',
  description:
    'Create and manage on-chain loyalty programs to enhance customer retention while gaining valuable insights into customer behavior.',
  keywords: 'loyalty program, blockchain, customer retention, rewards, on-chain, web3',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${orbitron.variable} ${pressStart2P.variable} ${kalam.variable} font-sans antialiased bg-verxio-dark min-h-screen grid-bg`}
      >
        <WalletProvider>{children}</WalletProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
