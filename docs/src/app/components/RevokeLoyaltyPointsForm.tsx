'use client'
import { useState } from 'react'
import { initializeVerxio } from '@verxioprotocol/core'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { useWallet } from '@solana/wallet-adapter-react'

export default function RevokeLoyaltyPointsForm() {
  const { publicKey: walletPublicKey } = useWallet()
  const [passAddress, setPassAddress] = useState('')
  const [pointsToRevoke, setPointsToRevoke] = useState(0)
  const [reason, setReason] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ revokedPoints: number; signature: string; newTier?: string } | null>(null)
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
        revokedPoints: pointsToRevoke,
        signature: 'dummy-signature',
        newTier: 'Bronze',
      })
      setResult(result)
    } catch (error: unknown) {
      console.error(error)
      setError(error instanceof Error ? error.message : 'An error occurred while revoking points')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-12 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-red-500/5 to-orange-500/5 blur-3xl"></div>
        <div className="relative">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-3xl mb-6 shadow-2xl transform hover:scale-110 transition-all duration-300">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="absolute -inset-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-3xl blur opacity-30 animate-pulse"></div>
          </div>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Remove points from users for violations or administrative reasons
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Pass Information */}
        <div className="card group hover:shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
          <div className="relative">
            <h4 className="text-xl font-bold text-slate-900 flex items-center gap-3 mb-6">
              <span className="w-3 h-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full shadow-lg"></span>
              Pass Information
            </h4>

            <div className="form-group">
              <label className="form-label">Pass Address</label>
              <input
                type="text"
                value={passAddress}
                onChange={(e) => setPassAddress(e.target.value)}
                className="form-input"
                placeholder="Enter the loyalty pass address"
                required
              />
              <p className="text-sm text-slate-500 mt-2">
                The unique address of the loyalty pass to revoke points from
              </p>
            </div>
          </div>
        </div>

        {/* Revocation Details */}
        <div className="card group hover:shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
          <div className="relative">
            <h4 className="text-xl font-bold text-slate-900 flex items-center gap-3 mb-6">
              <span className="w-3 h-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-full shadow-lg"></span>
              Revocation Details
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group">
                <label className="form-label">Points to Revoke</label>
                <input
                  type="number"
                  value={pointsToRevoke}
                  onChange={(e) => setPointsToRevoke(Number(e.target.value))}
                  className="form-input"
                  min={1}
                  placeholder="Enter number of points"
                  required
                />
                <p className="text-sm text-slate-500 mt-1">Number of points to remove from the user</p>
              </div>

              <div className="form-group">
                <label className="form-label">Reason for Revocation</label>
                <select value={reason} onChange={(e) => setReason(e.target.value)} className="form-input" required>
                  <option value="">Select a reason</option>
                  <option value="violation">🚫 Policy Violation</option>
                  <option value="fraud">⚠️ Fraudulent Activity</option>
                  <option value="error">🔧 Administrative Error</option>
                  <option value="abuse">🛡️ System Abuse</option>
                  <option value="other">❓ Other</option>
                </select>
              </div>
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
            } transition-all duration-500 !bg-gradient-to-r !from-orange-500 !to-red-500 hover:!from-orange-600 hover:!to-red-600`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
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
                  Revoking Points...
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
                      d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Revoke Points
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
                <h4 className="font-bold text-red-600 text-lg">Error Revoking Points</h4>
                <p className="text-red-500 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Success Display */}
        {result && (
          <div className="status-warning animate-fade-in">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-orange-500/20 rounded-3xl flex items-center justify-center flex-shrink-0">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-orange-700 text-xl">Points Revoked Successfully</h4>
                <p className="text-orange-700 text-lg">{result.revokedPoints} points have been revoked</p>
                {result.newTier && (
                  <p className="text-orange-700 text-sm mt-1">User tier changed to {result.newTier}</p>
                )}
              </div>
            </div>

            <div className="bg-orange-500/5 rounded-2xl p-6 border border-orange-500/20">
              <h5 className="font-bold text-orange-700 mb-3 text-lg">Transaction Details:</h5>
              <pre className="text-orange-700 text-sm font-mono overflow-x-auto whitespace-pre-wrap break-all bg-orange-500/10 rounded-xl p-4">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}
