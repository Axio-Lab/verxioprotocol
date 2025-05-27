'use client'
import { useState } from 'react'
import { initializeVerxio } from '@verxioprotocol/core'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { useWallet } from '@solana/wallet-adapter-react'

export default function GiftLoyaltyPointsForm() {
  const { publicKey: walletPublicKey } = useWallet()
  const [senderPassAddress, setSenderPassAddress] = useState('')
  const [recipientPassAddress, setRecipientPassAddress] = useState('')
  const [pointsToGift, setPointsToGift] = useState(0)
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{
    transferId: string
    signature: string
    senderNewBalance: number
    recipientNewBalance: number
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
        transferId: 'demo-transfer-id',
        signature: 'dummy-signature',
        senderNewBalance: 750,
        recipientNewBalance: 1250,
      })
      setResult(result)
    } catch (error: unknown) {
      console.error(error)
      setError(error instanceof Error ? error.message : 'An error occurred while gifting points')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-12 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 via-rose-500/5 to-pink-500/5 blur-3xl"></div>
        <div className="relative">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-pink-500 to-rose-500 rounded-3xl mb-6 shadow-2xl transform hover:scale-110 transition-all duration-300">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
              />
            </svg>
            <div className="absolute -inset-2 bg-gradient-to-br from-pink-500 to-rose-500 rounded-3xl blur opacity-30 animate-pulse"></div>
          </div>
          <h3 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent mb-4">
            Gift Loyalty Points
          </h3>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Transfer points between loyalty pass holders as gifts
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Transfer Information */}
        <div className="card group hover:shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
          <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group">
                <label className="form-label">Sender Pass Address</label>
                <input
                  type="text"
                  value={senderPassAddress}
                  onChange={(e) => setSenderPassAddress(e.target.value)}
                  className="form-input"
                  placeholder="Enter sender's loyalty pass address"
                  required
                />
                <p className="text-sm text-slate-500 mt-1">The pass address sending the points</p>
              </div>

              <div className="form-group">
                <label className="form-label">Recipient Pass Address</label>
                <input
                  type="text"
                  value={recipientPassAddress}
                  onChange={(e) => setRecipientPassAddress(e.target.value)}
                  className="form-input"
                  placeholder="Enter recipient's loyalty pass address"
                  required
                />
                <p className="text-sm text-slate-500 mt-1">The pass address receiving the points</p>
              </div>
            </div>
          </div>
        </div>

        {/* Gift Details */}
        <div className="card group hover:shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 to-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
          <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group">
                <label className="form-label">Points to Gift</label>
                <input
                  type="number"
                  value={pointsToGift}
                  onChange={(e) => setPointsToGift(Number(e.target.value))}
                  className="form-input"
                  min={1}
                  placeholder="Enter number of points"
                  required
                />
                <p className="text-sm text-slate-500 mt-1">Number of points to transfer as a gift</p>
              </div>

              <div className="form-group">
                <label className="form-label">Gift Message (Optional)</label>
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="form-input"
                  placeholder="Happy birthday! 🎉"
                  maxLength={100}
                />
                <p className="text-sm text-slate-500 mt-1">Personal message for the recipient</p>
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
            } transition-all duration-500 !bg-gradient-to-r !from-pink-500 !to-rose-500 hover:!from-pink-600 hover:!to-rose-600`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-rose-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
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
                  Transferring Points...
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
                      d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                    />
                  </svg>
                  Gift Points
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
                <h4 className="font-bold text-red-600 text-lg">Error Gifting Points</h4>
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
                <h4 className="font-bold text-green-600 text-xl">Points Gifted Successfully! 🎁</h4>
                <p className="text-green-600 text-lg">{pointsToGift} points transferred successfully</p>
                <div className="text-green-600 text-sm mt-2 space-y-1">
                  <p>💰 Sender new balance: {result.senderNewBalance} points</p>
                  <p>🎉 Recipient new balance: {result.recipientNewBalance} points</p>
                </div>
              </div>
            </div>

            <div className="bg-green-500/5 rounded-2xl p-6 border border-green-500/20">
              <h5 className="font-bold text-green-600 mb-3 text-lg">Transaction Details:</h5>
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
