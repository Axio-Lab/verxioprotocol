'use client'

import Link from 'next/link'

export default function Home() {
  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Verxio Protocol SDK</h1>
        <p className="text-xl text-gray-600 leading-relaxed">
          On-chain loyalty infrastructure for creating and managing loyalty programs on Solana and SVM.
        </p>
      </div>

      {/* Quick Start */}
      <div className="doc-section">
        <h2>Quick Start</h2>
        <p>Get started with the Verxio Protocol SDK in just a few lines of code.</p>

        <div className="code-block">
          <pre>{`pnpm add @verxioprotocol/core

import { initializeVerxio, createLoyaltyProgram } from '@verxioprotocol/core'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { publicKey, keypairIdentity } from '@metaplex-foundation/umi'

// Initialize the SDK
const umi = createUmi('https://api.devnet.solana.com')
const context = initializeVerxio(umi, publicKey('PROGRAM_AUTHORITY'))
context.umi.use(keypairIdentity('FEE_PAYER'))

// Create your first loyalty program
const result = await createLoyaltyProgram(context, {
  loyaltyProgramName: "Coffee Brew Rewards",
  metadataUri: "https://arweave.net/...",
  programAuthority: context.programAuthority,
  metadata: {
    organizationName: "Coffee Brew", // Required
    brandColor: "#FF5733", // Optional
  },
  tiers: [
    { name: "Bronze", xpRequired: 500, rewards: ["2% cashback"] },
    { name: "Silver", xpRequired: 1000, rewards: ["5% cashback"] },
    { name: "Gold", xpRequired: 2000, rewards: ["10% cashback"] },
  ],
  pointsPerAction: {
    purchase: 100,
    review: 50,
    referral: 200,
  },
})

console.log('Loyalty Program Created:', result.collection.publicKey)`}</pre>
        </div>
      </div>

      {/* Two Approaches */}
      <div className="doc-section">
        <h2>Two Approaches to Using Verxio Protocol</h2>
        <p>Verxio Protocol provides two complementary approaches for different use cases:</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="card">
            <h3 className="text-lg font-semibold mb-2">🚀 Direct Functions</h3>
            <p className="text-muted mb-4">
              Traditional functions that execute transactions immediately - perfect for simple, single-operation use
              cases.
            </p>
            <div className="text-sm text-gray-600">
              <strong>Best for:</strong> Simple operations, quick prototypes, single transactions
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-2">⚡ Instruction Functions</h3>
            <p className="text-muted mb-4">
              Instruction-based functions that return TransactionBuilder objects for advanced transaction composition,
              batching, and custom fee handling.
            </p>
            <div className="text-sm text-gray-600">
              <strong>Best for:</strong> Complex workflows, batch operations, gas optimization
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="doc-section">
        <h2>Core Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="card">
            <h3 className="text-lg font-semibold mb-2">🎯 Core Loyalty System</h3>
            <p className="text-muted mb-4">
              Create loyalty programs with custom tiers, issue NFT passes, track XP progression, and manage points with
              automatic tier updates.
            </p>
            <Link href="/create-program" className="text-blue-600 text-sm font-medium">
              Learn more →
            </Link>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-2">🎫 Voucher Management</h3>
            <p className="text-muted mb-4">
              Complete voucher lifecycle management with collections, validation, redemption, and analytics. Support for
              multiple voucher types.
            </p>
            <Link href="/create-voucher-collection" className="text-blue-600 text-sm font-medium">
              Learn more →
            </Link>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-2">💬 Communication & Messaging</h3>
            <p className="text-muted mb-4">
              Direct messaging between programs and pass holders, program-wide broadcasts with targeted delivery, and
              read status tracking.
            </p>
            <Link href="/messaging" className="text-blue-600 text-sm font-medium">
              Learn more →
            </Link>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-2">⚡ Advanced Transaction Composition</h3>
            <p className="text-muted mb-4">
              Instruction-based functions for advanced transaction batching, custom fee handling, and gas optimization
              with built-in protocol fees.
            </p>
            <Link href="/" className="text-blue-600 text-sm font-medium">
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
            <h4 className="font-semibold text-gray-900 mb-2">Core Loyalty Functions</h4>
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
            <h4 className="font-semibold text-gray-900 mb-2">Voucher Management</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <code className="inline-code">createVoucherCollection</code>
                <Link href="/create-voucher-collection" className="text-blue-600 text-sm">
                  View docs
                </Link>
              </div>
              <div className="flex items-center justify-between">
                <code className="inline-code">mintVoucher</code>
                <Link href="/mint-voucher" className="text-blue-600 text-sm">
                  View docs
                </Link>
              </div>
              <div className="flex items-center justify-between">
                <code className="inline-code">validateVoucher</code>
                <Link href="/validate-voucher" className="text-blue-600 text-sm">
                  View docs
                </Link>
              </div>
              <div className="flex items-center justify-between">
                <code className="inline-code">redeemVoucher</code>
                <Link href="/redeem-voucher" className="text-blue-600 text-sm">
                  View docs
                </Link>
              </div>
              <div className="flex items-center justify-between">
                <code className="inline-code">extendVoucherExpiry</code>
                <Link href="/extend-voucher-expiry" className="text-blue-600 text-sm">
                  View docs
                </Link>
              </div>
              <div className="flex items-center justify-between">
                <code className="inline-code">cancelVoucher</code>
                <Link href="/cancel-voucher" className="text-blue-600 text-sm">
                  View docs
                </Link>
              </div>
              <div className="flex items-center justify-between">
                <code className="inline-code">getUserVouchers</code>
                <Link href="/get-user-vouchers" className="text-blue-600 text-sm">
                  View docs
                </Link>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Communication</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <code className="inline-code">sendMessage</code>
                <Link href="/messaging" className="text-blue-600 text-sm">
                  View docs
                </Link>
              </div>
              <div className="flex items-center justify-between">
                <code className="inline-code">sendBroadcast</code>
                <Link href="/broadcasts" className="text-blue-600 text-sm">
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
                <code className="inline-code">getUserVouchers</code>
                <Link href="/get-user-vouchers" className="text-blue-600 text-sm">
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
            <Link href="/" className="btn btn-secondary">
              Learn Instruction Functions
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
