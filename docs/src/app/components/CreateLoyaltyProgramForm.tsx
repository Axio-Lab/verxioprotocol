'use client'
import { useState } from 'react'
import { initializeVerxio, createLoyaltyProgram } from '@verxioprotocol/core'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { useWallet } from '@solana/wallet-adapter-react'
import { generateSigner } from '@metaplex-foundation/umi'

interface Tier {
  name: string
  points: number
  rewards: string[]
}

export default function CreateLoyaltyProgramForm() {
  const { publicKey: walletPublicKey } = useWallet()
  const [programName, setProgramName] = useState('')
  const [metadataUri, setMetadataUri] = useState('')
  const [organizationName, setOrganizationName] = useState('')
  const [brandColor, setBrandColor] = useState('#00adef')
  const [tiers, setTiers] = useState<Tier[]>([
    { name: 'Bronze', points: 1000, rewards: ['2% cashback'] },
    { name: 'Silver', points: 5000, rewards: ['5% cashback'] },
    { name: 'Gold', points: 10000, rewards: ['10% cashback'] },
  ])
  const [pointsPerAction, setPointsPerAction] = useState({
    purchase: 100,
    review: 50,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ signature: string; collection: any; updateAuthority?: any } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleAddTier = () => {
    setTiers([...tiers, { name: '', points: 0, rewards: [''] }])
  }

  const handleRemoveTier = (index: number) => {
    if (tiers.length > 1) {
      setTiers(tiers.filter((_, i) => i !== index))
    }
  }

  const handleTierChange = (index: number, field: keyof Tier, value: string | number | string[]) => {
    const newTiers = [...tiers]
    newTiers[index] = { ...newTiers[index], [field]: value }
    setTiers(newTiers)
  }

  const handlePointsPerActionChange = (action: string, value: number) => {
    setPointsPerAction((prev) => ({
      ...prev,
      [action]: value,
    }))
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

      // Create the loyalty program using the SDK
      const result = await createLoyaltyProgram(context, {
        loyaltyProgramName: programName,
        metadataUri,
        programAuthority: context.programAuthority,
        updateAuthority: generateSigner(umi),
        metadata: {
          organizationName,
          brandColor,
        },
        tiers: tiers.map((tier) => ({
          name: tier.name,
          xpRequired: tier.points,
          rewards: tier.rewards,
        })),
        pointsPerAction,
      })

      setResult(result)
    } catch (error: unknown) {
      console.error(error)
      setError(error instanceof Error ? error.message : 'An error occurred while creating the loyalty program')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-12 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-cyan-500/5 to-blue-500/5 blur-3xl"></div>
        <div className="relative">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl mb-6 shadow-2xl transform hover:scale-110 transition-all duration-300">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
              />
            </svg>
            <div className="absolute -inset-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl blur opacity-30 animate-pulse"></div>
          </div>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Launch your program with custom rewards and tier structure
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="card group hover:shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
          <div className="relative">
            <h4 className="text-xl font-bold text-slate-900 flex items-center gap-3 mb-6">
              <span className="w-3 h-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full shadow-lg"></span>
              Basic Information
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group">
                <label className="form-label">Program Name</label>
                <input
                  type="text"
                  value={programName}
                  onChange={(e) => setProgramName(e.target.value)}
                  className="form-input"
                  placeholder="e.g., Coffee Rewards Program"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Organization Name</label>
                <input
                  type="text"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  className="form-input"
                  placeholder="e.g., Coffee Brew Co."
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 form-group">
                <label className="form-label">Metadata URI</label>
                <input
                  type="url"
                  value={metadataUri}
                  onChange={(e) => setMetadataUri(e.target.value)}
                  className="form-input"
                  placeholder="https://arweave.net/..."
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Brand Color</label>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <input
                      type="color"
                      value={brandColor}
                      onChange={(e) => setBrandColor(e.target.value)}
                      className="w-14 h-14 rounded-xl border-2 border-slate-200 cursor-pointer shadow-lg hover:shadow-xl transition-shadow duration-300"
                    />
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl blur opacity-25"></div>
                  </div>
                  <input
                    type="text"
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    className="form-input flex-1"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Points Per Action */}
        <div className="card group hover:shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
          <div className="relative">
            <h4 className="text-xl font-bold text-slate-900 flex items-center gap-3 mb-6">
              <span className="w-3 h-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full shadow-lg"></span>
              Points Per Action
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group">
                <label className="form-label flex items-center gap-2">
                  <span className="text-2xl">🛒</span> Purchase Points
                </label>
                <input
                  type="number"
                  value={pointsPerAction.purchase}
                  onChange={(e) => handlePointsPerActionChange('purchase', parseInt(e.target.value))}
                  className="form-input"
                  required
                  min={0}
                />
              </div>

              <div className="form-group">
                <label className="form-label flex items-center gap-2">
                  <span className="text-2xl">⭐</span> Review Points
                </label>
                <input
                  type="number"
                  value={pointsPerAction.review}
                  onChange={(e) => handlePointsPerActionChange('review', parseInt(e.target.value))}
                  className="form-input"
                  required
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
              <h4 className="text-xl font-bold flex items-center gap-3">
                <span className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-lg"></span>
                Reward Tiers
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
              {tiers.map((tier, index) => (
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
                      {tiers.length > 1 && (
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
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label text-sm">Points Required</label>
                        <input
                          type="number"
                          value={tier.points}
                          onChange={(e) => handleTierChange(index, 'points', parseInt(e.target.value))}
                          className="form-input text-sm"
                          placeholder="1000"
                          required
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
                          required
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
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
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
                  Creating Program...
                </>
              ) : (
                <>
                  <svg
                    className="w-6 h-6 transition-transform duration-300 group-hover:scale-110"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Create Loyalty Program
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
                <h4 className="font-bold text-red-600 text-lg">Error Creating Program</h4>
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
                <h4 className="font-bold text-green-600 text-xl">Program Created Successfully! 🎉</h4>
                <p className="text-green-600 text-lg">Your loyalty program is now live on the blockchain</p>
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
