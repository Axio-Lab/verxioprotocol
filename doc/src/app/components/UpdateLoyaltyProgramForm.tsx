'use client'
import { useState } from 'react'
import { initializeVerxio } from '@verxioprotocol/core'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { useWallet } from '@solana/wallet-adapter-react'

interface Tier {
  name: string
  xpRequired: number
  rewards: string[]
}

export default function UpdateLoyaltyProgramForm() {
  const { publicKey: walletPublicKey } = useWallet()
  const [collectionAddress, setCollectionAddress] = useState('')
  const [newPointsPerAction, setNewPointsPerAction] = useState({ purchase: 100, review: 50 })
  const [newTiers, setNewTiers] = useState<Tier[]>([
    { name: 'Bronze', xpRequired: 500, rewards: ['2% cashback'] },
    { name: 'Silver', xpRequired: 1000, rewards: ['5% cashback'] },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ signature: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleAddTier = () => {
    setNewTiers([...newTiers, { name: '', xpRequired: 0, rewards: [''] }])
  }

  const handleRemoveTier = (index: number) => {
    if (newTiers.length > 1) {
      setNewTiers(newTiers.filter((_, i) => i !== index))
    }
  }

  const handleTierChange = (index: number, field: keyof Tier, value: string | number | string[]) => {
    const updatedTiers = [...newTiers]
    updatedTiers[index] = { ...updatedTiers[index], [field]: value }
    setNewTiers(updatedTiers)
  }

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
      const result = await Promise.resolve({ signature: 'dummy-signature' })
      setResult(result)
    } catch (error: unknown) {
      console.error(error)
      setError(error instanceof Error ? error.message : 'An error occurred while updating the loyalty program')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-12 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-purple-500/5 blur-3xl"></div>
        <div className="relative">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl mb-6 shadow-2xl transform hover:scale-110 transition-all duration-300">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            <div className="absolute -inset-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl blur opacity-30 animate-pulse"></div>
          </div>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Modify your existing loyalty program settings and configurations
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Collection Address */}
        <div className="card group hover:shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
          <div className="relative">
            <h4 className="text-xl font-bold text-slate-900 flex items-center gap-3 mb-6">
              <span className="w-3 h-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full shadow-lg"></span>
              Program Identification
            </h4>

            <div className="form-group">
              <label className="form-label">Collection Address</label>
              <input
                type="text"
                value={collectionAddress}
                onChange={(e) => setCollectionAddress(e.target.value)}
                className="form-input"
                placeholder="Enter the collection address of your loyalty program"
                required
              />
              <p className="text-sm text-slate-500 mt-2">
                The unique identifier for your existing loyalty program collection
              </p>
            </div>
          </div>
        </div>

        {/* Points Per Action */}
        <div className="card group hover:shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
          <div className="relative">
            <h4 className="text-xl font-bold text-slate-900 flex items-center gap-3 mb-6">
              <span className="w-3 h-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full shadow-lg"></span>
              Update Points Per Action
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group">
                <label className="form-label flex items-center gap-2">
                  <span className="text-2xl">🛒</span> Purchase Points
                </label>
                <input
                  type="number"
                  value={newPointsPerAction.purchase}
                  onChange={(e) => setNewPointsPerAction({ ...newPointsPerAction, purchase: parseInt(e.target.value) })}
                  className="form-input"
                  min={0}
                />
              </div>

              <div className="form-group">
                <label className="form-label flex items-center gap-2">
                  <span className="text-2xl">⭐</span> Review Points
                </label>
                <input
                  type="number"
                  value={newPointsPerAction.review}
                  onChange={(e) => setNewPointsPerAction({ ...newPointsPerAction, review: parseInt(e.target.value) })}
                  className="form-input"
                  min={0}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tiers */}
        <div className="card group hover:shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                <span className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-lg"></span>
                Update Tiers
              </h4>
              <button type="button" onClick={handleAddTier} className="btn-secondary px-4 py-2 text-sm group/btn">
                <span className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 transition-transform duration-300 group-hover/btn:rotate-90"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Tier
                </span>
              </button>
            </div>

            <div className="space-y-6">
              {newTiers.map((tier, index) => (
                <div
                  key={index}
                  className="card bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200 animate-fade-in group/tier hover:shadow-lg"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 opacity-0 group-hover/tier:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-lg">
                          {index + 1}
                        </div>
                        <h5 className="font-semibold">Tier {index + 1}</h5>
                      </div>
                      {newTiers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTier(index)}
                          className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="form-group">
                        <label className="form-label text-sm">Tier Name</label>
                        <input
                          type="text"
                          value={tier.name}
                          onChange={(e) => handleTierChange(index, 'name', e.target.value)}
                          className="form-input text-sm"
                          placeholder="e.g., Bronze"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label text-sm">XP Required</label>
                        <input
                          type="number"
                          value={tier.xpRequired}
                          onChange={(e) => handleTierChange(index, 'xpRequired', parseInt(e.target.value))}
                          className="form-input text-sm"
                          placeholder="500"
                          min={0}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label text-sm">Rewards</label>
                        <input
                          type="text"
                          value={tier.rewards.join(', ')}
                          onChange={(e) =>
                            handleTierChange(
                              index,
                              'rewards',
                              e.target.value.split(',').map((r) => r.trim()),
                            )
                          }
                          className="form-input text-sm"
                          placeholder="2% cashback, Free item"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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
            } transition-all duration-500`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
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
                  Updating Program...
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
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Update Loyalty Program
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
                <h4 className="font-bold text-red-600 text-lg">Error Updating Program</h4>
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
                <h4 className="font-bold text-green-600 text-xl">Program Updated Successfully! 🎉</h4>
                <p className="text-green-600 text-lg">Your loyalty program has been updated on the blockchain</p>
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
