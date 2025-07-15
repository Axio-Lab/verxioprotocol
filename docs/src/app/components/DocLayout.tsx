'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

const navigation = [
  {
    title: 'Getting Started',
    items: [
      { name: 'Introduction', href: '/' },
      // { name: 'Installation', href: '/installation' },
      // { name: 'Quick Start', href: '/quickstart' },
    ],
  },
  {
    title: 'Loyalty Management',
    items: [
      { name: 'Create Loyalty Program', href: '/create-program' },
      { name: 'Update Loyalty Program', href: '/update-program' },
      { name: 'Issue Loyalty Pass', href: '/issue-pass' },
    ],
  },
  {
    title: 'Voucher Management',
    items: [
      { name: 'Create Voucher Collection', href: '/create-voucher-collection' },
      { name: 'Mint Voucher', href: '/mint-voucher' },
      { name: 'Cancel Voucher', href: '/cancel-voucher' },
      { name: 'Validate Voucher', href: '/validate-voucher' },
      { name: 'Redeem Voucher', href: '/redeem-voucher' },
      { name: 'Extend Voucher Expiry', href: '/extend-voucher-expiry' },
      { name: 'Get User Vouchers', href: '/get-user-vouchers' },
    ],
  },
  {
    title: 'Points Management',
    items: [
      { name: 'Award Points', href: '/award-points' },
      { name: 'Revoke Points', href: '/revoke-points' },
      { name: 'Gift Points', href: '/gift-points' },
    ],
  },
  {
    title: 'Data Retrieval',
    items: [
      { name: 'Get Asset Data', href: '/get-asset-data' },
      { name: 'Get Program Details', href: '/get-program-details' },
      // { name: 'Get Wallet Passes', href: '/get-wallet-passes' },
    ],
  },
  {
    title: 'Communication',
    items: [
      { name: 'Send Message', href: '/messaging' },
      { name: 'Send Broadcast', href: '/broadcasts' },
    ],
  },
  {
    title: 'Transfer Management',
    items: [{ name: 'Approve Transfer', href: '/approve-transfer' }],
  },
]

export default function DocLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-white via-slate-50 to-blue-50 transition-all duration-500">
      {/* Mobile Header */}
      <div className="mobile-header">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="absolute -inset-1 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl blur opacity-25"></div>
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Verxio Protocol
              </h1>
            </div>
          </div>

          {/* Hamburger Menu Button */}
          <button onClick={toggleMobileMenu} className="hamburger-button" aria-label="Toggle navigation menu">
            <div className={`hamburger-line ${isMobileMenuOpen ? 'hamburger-line-1-open' : ''}`}></div>
            <div className={`hamburger-line ${isMobileMenuOpen ? 'hamburger-line-2-open' : ''}`}></div>
            <div className={`hamburger-line ${isMobileMenuOpen ? 'hamburger-line-3-open' : ''}`}></div>
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="mobile-overlay" onClick={closeMobileMenu}>
          <div className="mobile-menu" onClick={(e) => e.stopPropagation()}>
            {/* Mobile menu content */}
            <div className="p-6">
              {/* Navigation */}
              <div className="space-y-6">
                {navigation.map((section, index) => (
                  <div key={section.title} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                    <h3 className="mobile-nav-section-title">{section.title}</h3>
                    <ul className="space-y-2">
                      {section.items.map((item, itemIndex) => (
                        <li
                          key={item.name}
                          className="animate-fade-in"
                          style={{ animationDelay: `${index * 0.1 + itemIndex * 0.05}s` }}
                        >
                          <Link
                            href={item.href}
                            onClick={closeMobileMenu}
                            className={`mobile-nav-item ${pathname === item.href ? 'active' : ''}`}
                          >
                            <span className="relative z-10">{item.name}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <nav className="doc-sidebar relative overflow-hidden">
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/95 via-slate-50/95 to-blue-50/95 backdrop-blur-xl"></div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-cyan-500/10 to-transparent rounded-full blur-2xl"></div>

        <div className="relative z-10 p-6 h-full">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8 relative">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="absolute -inset-1 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl blur opacity-25 animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Verxio Protocol
              </h1>
              <p className="text-sm text-slate-600 font-medium">SDK Documentation</p>
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-6">
            {navigation.map((section, index) => (
              <div key={section.title} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <h3 className="nav-section-title">{section.title}</h3>
                <ul className="space-y-1">
                  {section.items.map((item, itemIndex) => (
                    <li
                      key={item.name}
                      className="animate-fade-in"
                      style={{ animationDelay: `${index * 0.1 + itemIndex * 0.05}s` }}
                    >
                      <Link href={item.href} className={`doc-nav-item ${pathname === item.href ? 'active' : ''}`}>
                        <span className="relative z-10">{item.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="doc-content relative">
        {/* Background decorative elements */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-48 h-48 bg-gradient-to-tr from-purple-500/5 to-pink-500/5 rounded-full blur-2xl"></div>

        {/* Content */}
        <div className="relative z-10">{children}</div>
      </main>
    </div>
  )
}
