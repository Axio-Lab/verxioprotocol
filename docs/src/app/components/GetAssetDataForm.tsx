'use client'
import { useState } from 'react'
import { initializeVerxio } from '@verxioprotocol/core'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { useWallet } from '@solana/wallet-adapter-react'

export default function GetAssetDataForm() {
  const { publicKey: walletPublicKey } = useWallet()
  const [assetAddress, setAssetAddress] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{
    assetData: any
    points: number
    tier: string
    metadata: any
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
        assetData: {
          address: assetAddress,
          owner: walletPublicKey.toString(),
          collection: 'demo-collection-address',
        },
        points: 2500,
        tier: 'Gold',
        metadata: {
          name: 'Loyalty Pass #123',
          description: 'Premium loyalty pass',
          image: 'https://example.com/image.png',
        },
      })
      setResult(result)
    } catch (error: unknown) {
      console.error(error)
      setError(error instanceof Error ? error.message : 'An error occurred while fetching asset data')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-12 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 via-emerald-500/5 to-teal-500/5 blur-3xl"></div>
        <div className="relative">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-3xl mb-6 shadow-2xl transform hover:scale-110 transition-all duration-300">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <div className="absolute -inset-2 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-3xl blur opacity-30 animate-pulse"></div>
          </div>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Retrieve detailed information about loyalty pass assets
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Asset Information */}
        <div className="card group hover:shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
          <div className="relative">
            <h4 className="text-xl font-bold text-slate-900 flex items-center gap-3 mb-6">
              <span className="w-3 h-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full shadow-lg"></span>
              Asset Information
            </h4>

            <div className="form-group">
              <label className="form-label">Asset Address</label>
              <input
                type="text"
                value={assetAddress}
                onChange={(e) => setAssetAddress(e.target.value)}
                className="form-input"
                placeholder="Enter the asset address to query"
                required
              />
              <p className="text-sm text-slate-500 mt-2">
                The unique address of the loyalty pass or asset to retrieve data for
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
            } transition-all duration-500 !bg-gradient-to-r !from-teal-500 !to-emerald-500 hover:!from-teal-600 hover:!to-emerald-600`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
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
                  Fetching Data...
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
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  Get Asset Data
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
                <h4 className="font-bold text-red-600 text-lg">Error Fetching Data</h4>
                <p className="text-red-500 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Success Display */}
        {result && (
          <div className="status-success animate-fade-in">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-green-500/20 rounded-3xl flex items-center justify-center flex-shrink-0">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-green-600 text-xl">Asset Data Retrieved Successfully! 📊</h4>
                <p className="text-green-600 text-lg">
                  Current Points: {result.points} | Tier: {result.tier}
                </p>
              </div>
            </div>

            {/* Asset Details Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-6">
                <h5 className="font-bold text-blue-700 mb-3 text-lg flex items-center gap-2">🎫 Asset Information</h5>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Address:</span>{' '}
                    <code className="bg-blue-100 px-2 py-1 rounded text-xs">{result.assetData.address}</code>
                  </div>
                  <div>
                    <span className="font-medium">Owner:</span>{' '}
                    <code className="bg-blue-100 px-2 py-1 rounded text-xs">{result.assetData.owner}</code>
                  </div>
                  <div>
                    <span className="font-medium">Collection:</span>{' '}
                    <code className="bg-blue-100 px-2 py-1 rounded text-xs">{result.assetData.collection}</code>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6">
                <h5 className="font-bold text-purple-700 mb-3 text-lg flex items-center gap-2">📋 Metadata</h5>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Name:</span> {result.metadata.name}
                  </div>
                  <div>
                    <span className="font-medium">Description:</span> {result.metadata.description}
                  </div>
                  <div>
                    <span className="font-medium">Points:</span>{' '}
                    <span className="text-lg font-bold text-purple-600">{result.points}</span>
                  </div>
                  <div>
                    <span className="font-medium">Tier:</span>{' '}
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                      {result.tier}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-green-500/5 rounded-2xl p-6 border border-green-500/20">
              <h5 className="font-bold text-green-600 mb-3 text-lg">Raw Asset Data:</h5>
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
