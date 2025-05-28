'use client'

import Link from 'next/link'

export default function Home() {
  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Verxio Protocol SDK</h1>
        <p className="text-xl text-gray-600 leading-relaxed">
          Build powerful on-chain loyalty programs with Metaplex CORE. Create, manage, and distribute loyalty passes as
          NFTs with built-in tier progression and comprehensive user analytics.
        </p>
      </div>

      {/* Quick Start */}
      <div className="doc-section">
        <h2>Quick Start</h2>
        <p>Get started with the Verxio Protocol SDK in just a few lines of code.</p>

        <div className="code-block">
          <pre>{`npm install @verxioprotocol/core

import { initializeVerxio, createLoyaltyProgram } from '@verxioprotocol/core'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'

// Initialize the SDK
const umi = createUmi('https://api.devnet.solana.com')
const context = initializeVerxio(umi, programAuthority)

// Create your first loyalty program
const result = await createLoyaltyProgram(context, {
  loyaltyProgramName: "Coffee Rewards",
  metadataUri: "https://arweave.net/...",
  // ... additional parameters
})`}</pre>
        </div>
      </div>

      {/* Features */}
      <div className="doc-section">
        <h2>Core Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="card">
            <h3 className="text-lg font-semibold mb-2">🎯 Loyalty Programs</h3>
            <p className="text-muted mb-4">
              Create customizable loyalty programs with multiple tiers, rewards, and automatic progression based on user
              activity.
            </p>
            <Link href="/create-program" className="text-blue-600 text-sm font-medium">
              Learn more →
            </Link>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-2">🎫 NFT Loyalty Passes</h3>
            <p className="text-muted mb-4">
              Issue loyalty passes as NFTs that users can hold in their wallets, with transferability controls and
              metadata.
            </p>
            <Link href="/issue-pass" className="text-blue-600 text-sm font-medium">
              Learn more →
            </Link>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-2">⭐ Points System</h3>
            <p className="text-muted mb-4">
              Award, revoke, and gift points based on user actions. Automatic tier progression with customizable
              thresholds.
            </p>
            <Link href="/award-points" className="text-blue-600 text-sm font-medium">
              Learn more →
            </Link>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-2">💬 Communication</h3>
            <p className="text-muted mb-4">
              Send direct messages to pass holders or broadcast announcements to your entire program community.
            </p>
            <Link href="/messaging" className="text-blue-600 text-sm font-medium">
              Learn more →
            </Link>
          </div>
        </div>
      </div>

      {/* SDK Functions Overview */}
      <div className="doc-section">
        <h2>SDK Functions</h2>
        <p>Complete reference of all available functions in the Verxio Protocol SDK.</p>

        <div className="mt-6 space-y-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Core Functions</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <code className="inline-code">createLoyaltyProgram</code>
                <Link href="/create-program" className="text-blue-600 text-sm">
                  View docs
                </Link>
              </div>
              <div className="flex items-center justify-between">
                <code className="inline-code">updateLoyaltyProgram</code>
                <Link href="/update-program" className="text-blue-600 text-sm">
                  View docs
                </Link>
              </div>
              <div className="flex items-center justify-between">
                <code className="inline-code">issueLoyaltyPass</code>
                <Link href="/issue-pass" className="text-blue-600 text-sm">
                  View docs
                </Link>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Points Management</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <code className="inline-code">awardLoyaltyPoints</code>
                <Link href="/award-points" className="text-blue-600 text-sm">
                  View docs
                </Link>
              </div>
              <div className="flex items-center justify-between">
                <code className="inline-code">revokeLoyaltyPoints</code>
                <Link href="/revoke-points" className="text-blue-600 text-sm">
                  View docs
                </Link>
              </div>
              <div className="flex items-center justify-between">
                <code className="inline-code">giftLoyaltyPoints</code>
                <Link href="/gift-points" className="text-blue-600 text-sm">
                  View docs
                </Link>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Data Retrieval</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <code className="inline-code">getAssetData</code>
                <Link href="/get-asset-data" className="text-blue-600 text-sm">
                  View docs
                </Link>
              </div>
              <div className="flex items-center justify-between">
                <code className="inline-code">getProgramDetails</code>
                <Link href="/get-program-details" className="text-blue-600 text-sm">
                  View docs
                </Link>
              </div>
              <div className="flex items-center justify-between">
                <code className="inline-code">getWalletLoyaltyPasses</code>
                <Link href="/get-wallet-passes" className="text-blue-600 text-sm">
                  View docs
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="doc-section">
        <h2>Next Steps</h2>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Ready to build?</h3>
          <p className="text-blue-700 mb-4">
            Start by creating your first loyalty program or explore our interactive documentation to test all SDK
            functions.
          </p>
          <div className="flex gap-3">
            <Link href="/create-program" className="btn btn-primary">
              Create Loyalty Program
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
