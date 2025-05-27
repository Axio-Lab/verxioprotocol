'use client'
import { useState } from 'react'
import { initializeVerxio } from '@verxioprotocol/core'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { useWallet } from '@solana/wallet-adapter-react'

export default function BroadcastsForm() {
  const { publicKey: walletPublicKey } = useWallet()
  const [messageContent, setMessageContent] = useState('')
  const [messageType, setMessageType] = useState('announcement')
  const [tierFilter, setTierFilter] = useState('all')
  const [isScheduled, setIsScheduled] = useState(false)
  const [scheduledTime, setScheduledTime] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{
    broadcastId: string
    signature: string
    recipientCount: number
    scheduledFor?: string
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
        broadcastId: 'demo-broadcast-id',
        signature: 'dummy-signature',
        recipientCount: 1250,
        ...(isScheduled && { scheduledFor: scheduledTime }),
      })
      setResult(result)
    } catch (error: unknown) {
      console.error(error)
      setError(error instanceof Error ? error.message : 'An error occurred while sending the broadcast')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-12 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-yellow-500/5 to-amber-500/5 blur-3xl"></div>
        <div className="relative">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-3xl mb-6 shadow-2xl transform hover:scale-110 transition-all duration-300">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
            <div className="absolute -inset-2 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-3xl blur opacity-30 animate-pulse"></div>
          </div>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Send announcements and messages to all loyalty program members
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Message Content */}
        <div className="card group hover:shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
          <div className="relative">
            <h4 className="text-xl font-bold text-slate-900 flex items-center gap-3 mb-6">
              <span className="w-3 h-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full shadow-lg"></span>
              Message Content
            </h4>

            <div className="space-y-6">
              <div className="form-group">
                <label className="form-label">Message Type</label>
                <select
                  value={messageType}
                  onChange={(e) => setMessageType(e.target.value)}
                  className="form-input"
                  required
                >
                  <option value="announcement">📢 Announcement</option>
                  <option value="promotion">🎯 Promotion</option>
                  <option value="reward_alert">🎁 Reward Alert</option>
                  <option value="system_update">⚙️ System Update</option>
                  <option value="event">🎪 Event Notification</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Message Content</label>
                <textarea
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  className="form-input form-textarea"
                  rows={6}
                  placeholder="Enter your broadcast message here..."
                  required
                />
                <p className="text-sm text-slate-500 mt-1">
                  Maximum 1000 characters. Keep messages clear and engaging.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Targeting & Scheduling */}
        <div className="card group hover:shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
          <div className="relative">
            <h4 className="text-xl font-bold text-slate-900 flex items-center gap-3 mb-6">
              <span className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-lg"></span>
              Targeting & Scheduling
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group">
                <label className="form-label">Target Audience</label>
                <select
                  value={tierFilter}
                  onChange={(e) => setTierFilter(e.target.value)}
                  className="form-input"
                  required
                >
                  <option value="all">👥 All Members</option>
                  <option value="bronze">🥉 Bronze Tier Only</option>
                  <option value="silver">🥈 Silver Tier Only</option>
                  <option value="gold">🥇 Gold Tier Only</option>
                  <option value="premium">💎 Premium Members</option>
                </select>
              </div>

              <div className="form-group">
                <div className="flex items-center gap-3 mb-3">
                  <input
                    type="checkbox"
                    id="scheduled"
                    checked={isScheduled}
                    onChange={(e) => setIsScheduled(e.target.checked)}
                    className="w-5 h-5 text-purple-600 border-2 border-slate-300 rounded focus:ring-purple-500 transition-colors"
                  />
                  <label htmlFor="scheduled" className="form-label !mb-0">
                    Schedule for Later
                  </label>
                </div>

                {isScheduled && (
                  <input
                    type="datetime-local"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="form-input"
                    min={new Date().toISOString().slice(0, 16)}
                    required={isScheduled}
                  />
                )}
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
            } transition-all duration-500 !bg-gradient-to-r !from-amber-500 !to-yellow-500 hover:!from-amber-600 hover:!to-yellow-600`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-yellow-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
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
                  {isScheduled ? 'Scheduling Broadcast...' : 'Sending Broadcast...'}
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
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                  {isScheduled ? 'Schedule Broadcast' : 'Send Broadcast'}
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
                <h4 className="font-bold text-red-600 text-lg">Error Sending Broadcast</h4>
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
                <h4 className="font-bold text-green-600 text-xl">
                  {isScheduled ? 'Broadcast Scheduled Successfully! 📅' : 'Broadcast Sent Successfully! 📢'}
                </h4>
                <p className="text-green-600 text-lg">
                  {isScheduled
                    ? `Scheduled for ${result.scheduledFor} - ${result.recipientCount} recipients`
                    : `Delivered to ${result.recipientCount} recipients`}
                </p>
                <p className="text-green-600 text-sm mt-1">
                  Broadcast ID: <code className="bg-green-100 px-2 py-1 rounded">{result.broadcastId}</code>
                </p>
              </div>
            </div>

            {/* Broadcast Details */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 mb-6">
              <h5 className="font-bold text-green-700 mb-3 text-lg flex items-center gap-2">📋 Broadcast Summary</h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Type:</span>
                  <div className="capitalize text-green-700">{messageType.replace('_', ' ')}</div>
                </div>
                <div>
                  <span className="font-medium">Target:</span>
                  <div className="capitalize text-green-700">
                    {tierFilter === 'all' ? 'All Members' : `${tierFilter} Tier`}
                  </div>
                </div>
                <div>
                  <span className="font-medium">Recipients:</span>
                  <div className="text-lg font-bold text-green-700">{result.recipientCount}</div>
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
