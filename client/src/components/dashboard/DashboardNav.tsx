'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Building2, Users, Trophy, Copy, LogOut, Gift, Award, Bell } from 'lucide-react'
import { useWallet } from '@solana/wallet-adapter-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { NetworkToggle } from '@/components/network/NetworkToggle'

interface DashboardNavProps {
  isOrganization: boolean
  isSmallDevices: boolean
  setIsSidebarOpen: (value: boolean) => void
}

interface NavItem {
  title: string
  href: string
  icon: any
  exact: boolean
  badge?: string
}

export default function DashboardNav({ isOrganization, isSmallDevices, setIsSidebarOpen }: DashboardNavProps) {
  const pathname = usePathname()
  const { connected, publicKey, disconnect } = useWallet()

  const userNavItems: NavItem[] = [
    {
      title: 'Overview',
      href: '/dashboard/user',
      icon: LayoutDashboard,
      exact: true,
    },
    // {
    //   title: 'Campaigns',
    //   href: '/dashboard/user/campaigns',
    //   icon: Gift,
    //   exact: false,
    // },
    // {
    //   title: 'Notifications',
    //   href: '/dashboard/user/notifications',
    //   icon: Bell,
    //   exact: false,
    // },
  ]

  const organizationNavItems: NavItem[] = [
    {
      title: 'Overview',
      href: '/dashboard',
      icon: LayoutDashboard,
      exact: true,
    },
    {
      title: 'Programs',
      href: '/dashboard/programs',
      icon: Building2,
      exact: false,
    },
    // {
    //   title: 'Campaigns',
    //   href: '/dashboard/campaigns',
    //   icon: Gift,
    //   exact: false,
    // },
    // {
    //   title: 'Notifications',
    //   href: '/dashboard/notifications',
    //   icon: Bell,
    //   exact: false,
    // },
    {
      title: 'Members',
      href: '/dashboard/members',
      icon: Users,
      exact: false,
    },
    {
      title: 'Leaderboard',
      href: '/dashboard/leaderboard',
      icon: Trophy,
      exact: false,
    },
  ]

  const navItems = isOrganization ? organizationNavItems : userNavItems

  const handleCopyAddress = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey.toString())
      toast.success('Wallet address copied to clipboard')
    }
  }

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <div className={`flex flex-col h-full p-4 `}>
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-white orbitron mb-4">Dashboard</h2>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href) &&
                (item.href === '/dashboard' || pathname.startsWith(`${item.href}/`) || pathname === item.href)

            const handleLinkClick = () => {
              if (isSmallDevices) {
                setIsSidebarOpen(true)
              }
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleLinkClick}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-white transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-verxio-purple/20 to-verxio-purple/10 text-verxio-purple border border-verxio-purple/20'
                    : 'text-white/70 hover:bg-black/20'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-verxio-purple' : ''}`} />
                <span className="text-sm font-medium">{item.title}</span>
                {item.badge && (
                  <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-verxio-purple/20 text-verxio-purple">
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>
      </div>

      {connected && (
        <div className="mt-auto">
          <NetworkToggle />
          <div className="bg-black/20 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm text-white/70">{shortenAddress(publicKey?.toString() || '')}</div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopyAddress}
                className="h-6 w-6 text-white/70 hover:text-white"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <Button
              variant="ghost"
              onClick={disconnect}
              className="w-full justify-start text-white/70 hover:text-white hover:bg-black/20"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Disconnect Wallet
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
