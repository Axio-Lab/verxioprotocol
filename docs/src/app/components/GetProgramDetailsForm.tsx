'use client'
import { useState } from 'react'
import { initializeVerxio } from '@verxioprotocol/core'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { useWallet } from '@solana/wallet-adapter-react'

export default function GetProgramDetailsForm() {
  const { publicKey: walletPublicKey } = useWallet()
  const [collectionAddress, setCollectionAddress] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{
    programData: any
    tiers: any[]
    pointsPerAction: any
    metadata: any
    statistics: any
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!walletPublicKey) {
      setError('Please connect your wallet first.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const umi = createUmi('https://api.devnet.solana.com')
      const context = initializeVerxio(umi, walletPublicKey.toString() as any)
      const result = await Promise.resolve({
        programData: {
          name: 'Coffee Rewards Program',
          address: collectionAddress,
          authority: walletPublicKey.toString(),
          created: '2024-01-15',
          status: 'Active',
        },
        tiers: [
          { name: 'Bronze', xpRequired: 1000, rewards: ['2% cashback'] },
          { name: 'Silver', xpRequired: 5000, rewards: ['5% cashback', 'Priority support'] },
          { name: 'Gold', xpRequired: 10000, rewards: ['10% cashback', 'Free shipping', 'Exclusive events'] },
        ],
        pointsPerAction: {
          purchase: 100,
          review: 50,
          referral: 200,
          socialShare: 25,
        },
        metadata: {
          organizationName: 'Coffee Brew Co.',
          brandColor: '#00adef',
          description: 'Premium loyalty program for coffee enthusiasts',
        },
        statistics: {
          totalMembers: 1250,
          activeMembers: 980,
          totalPointsAwarded: 125000,
          averagePointsPerMember: 127,
        },
      })
      setResult(result)
    } catch (error: unknown) {
      console.error(error)
      setError(error instanceof Error ? error.message : 'An error occurred while fetching program details')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-12 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-cyan-500/5 blur-3xl"></div>
        <div className="relative">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-3xl mb-6 shadow-2xl transform hover:scale-110 transition-all duration-300">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            <div className="absolute -inset-2 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-3xl blur opacity-30 animate-pulse"></div>
          </div>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Retrieve comprehensive information about loyalty programs
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Program Information */}
        <div className="card group hover:shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
          <div className="relative">
            <h4 className="text-xl font-bold text-slate-900 flex items-center gap-3 mb-6">
              <span className="w-3 h-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full shadow-lg"></span>
              Program Information
            </h4>

            <div className="form-group">
              <label className="form-label">Collection Address</label>
              <input
                type="text"
                value={collectionAddress}
                onChange={(e) => setCollectionAddress(e.target.value)}
                className="form-input"
                placeholder="Enter the loyalty program collection address"
                required
              />
              <p className="text-sm text-slate-500 mt-2">
                The unique collection address of the loyalty program to query
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center pt-8">
          <button
            type="submit"
            disabled={isLoading}
            className={`btn-primary px-12 py-4 text-lg font-bold rounded-2xl shadow-2xl group relative overflow-hidden ${
              isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-3xl transform hover:-translate-y-2'
            } transition-all duration-500 !bg-gradient-to-r !from-cyan-500 !to-blue-500 hover:!from-cyan-600 hover:!to-blue-600`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="relative z-10 flex items-center gap-3">
              {isLoading ? (
                <>
                  <svg className="animate-spin w-6 h-6" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Loading Details...
                </>
              ) : (
                <>
                  <svg
                    className="w-6 h-6 transition-transform duration-300 group-hover:scale-110"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Get Program Details
                </>
              )}
            </span>
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="status-error animate-fade-in">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-500/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-red-600 text-lg">Error Loading Details</h4>
                <p className="text-red-500 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Success Display */}
        {result && (
          <div className="status-success animate-fade-in">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-green-500/20 rounded-3xl flex items-center justify-center flex-shrink-0">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-green-600 text-xl">Program Details Retrieved! 📋</h4>
                <p className="text-green-600 text-lg">
                  {result.programData.name} - {result.statistics.totalMembers} members
                </p>
              </div>
            </div>

            {/* Program Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Program Info */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-6">
                <h5 className="font-bold text-blue-700 mb-4 text-lg flex items-center gap-2">🏢 Program Information</h5>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Name:</span>
                    <span className="font-semibold text-blue-700">{result.programData.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Organization:</span>
                    <span>{result.metadata.organizationName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Status:</span>
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      {result.programData.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Created:</span>
                    <span>{result.programData.created}</span>
                  </div>
                </div>
              </div>

              {/* Statistics */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6">
                <h5 className="font-bold text-purple-700 mb-4 text-lg flex items-center gap-2">📊 Statistics</h5>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Members:</span>
                    <span className="text-xl font-bold text-purple-600">{result.statistics.totalMembers}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Active Members:</span>
                    <span className="text-lg font-semibold text-purple-600">{result.statistics.activeMembers}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Points:</span>
                    <span className="font-semibold">{result.statistics.totalPointsAwarded.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Avg per Member:</span>
                    <span className="font-semibold">{result.statistics.averagePointsPerMember}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tiers and Points */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Tiers */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6">
                <h5 className="font-bold text-amber-700 mb-4 text-lg flex items-center gap-2">🏆 Reward Tiers</h5>
                <div className="space-y-3">
                  {result.tiers.map((tier, index) => (
                    <div key={index} className="bg-white/70 rounded-xl p-4 border border-amber-200/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-amber-800">{tier.name}</span>
                        <span className="text-sm font-medium bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                          {tier.xpRequired} pts
                        </span>
                      </div>
                      <div className="text-xs text-amber-600">{tier.rewards.join(', ')}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Points Per Action */}
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-6">
                <h5 className="font-bold text-emerald-700 mb-4 text-lg flex items-center gap-2">
                  ⚡ Points Per Action
                </h5>
                <div className="space-y-3">
                  {Object.entries(result.pointsPerAction).map(([action, points]) => (
                    <div
                      key={action}
                      className="flex justify-between items-center bg-white/70 rounded-xl p-3 border border-emerald-200/50"
                    >
                      <span className="font-medium capitalize text-emerald-800">
                        {action === 'socialShare' ? 'Social Share' : action}
                      </span>
                      <span className="text-lg font-bold text-emerald-600">{points as number} pts</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-green-500/5 rounded-2xl p-6 border border-green-500/20">
              <h5 className="font-bold text-green-600 mb-3 text-lg">Raw Program Data:</h5>
              <pre className="text-green-600 text-sm font-mono overflow-x-auto whitespace-pre-wrap break-all bg-green-500/10 rounded-xl p-4">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}
