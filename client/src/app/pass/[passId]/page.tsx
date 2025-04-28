'use client'

import { useEffect, useState, use } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import LoyaltyCard from '@/components/loyalty/LoyaltyCard'
import { getImageFromMetadata } from '@/lib/getImageFromMetadata'
import { getPassDetails } from '@/app/actions/loyalty'

export interface PassDetails {
  xp: number
  lastAction: string | null
  actionHistory: Array<{
    type: string
    points: number
    timestamp: number
    newTotal: number
  }>
  currentTier: string
  tierUpdatedAt: number
  rewards: string[]
  name: string
  uri: string
  owner: string
  pass: string
  metadata: {
    organizationName: string
    brandColor?: string
    [key: string]: any
  }
  rewardTiers: Array<{
    name: string
    xpRequired: number
    rewards: string[]
  }>
}

export default function PublicPassPage({ params }: { params: Promise<{ passId: string }> }) {
  const resolvedParams = use(params)
  const [pass, setPass] = useState<PassDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [bannerImage, setBannerImage] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const ACTIONS_PER_PAGE = 5

  useEffect(() => {
    let isMounted = true

    async function fetchPass() {
      try {
        setError(null)
        const details = await getPassDetails(resolvedParams.passId)

        if (isMounted) {
          setPass(details)
          // Fetch the image URL from metadata
          if (details.uri) {
            const imageUrl = await getImageFromMetadata(details.uri)
            setBannerImage(imageUrl)
          }
        }
      } catch (error) {
        console.error('Error fetching pass details:', error)
        if (isMounted) {
          setError('Failed to load pass details. Please try again later.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchPass()

    return () => {
      isMounted = false
    }
  }, [resolvedParams.passId])

  // Calculate pagination
  const totalPages = pass ? Math.ceil(pass.actionHistory.length / ACTIONS_PER_PAGE) : 0
  const startIndex = (currentPage - 1) * ACTIONS_PER_PAGE
  const endIndex = startIndex + ACTIONS_PER_PAGE
  const currentActions = pass?.actionHistory.slice(startIndex, endIndex) || []

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-purple-950/20 to-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-verxio-purple mx-auto" />
          <p className="text-white/70 orbitron">Loading pass details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-purple-950/20 to-black flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md mx-auto px-4">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <span className="text-red-500 text-2xl">!</span>
          </div>
          <h2 className="text-xl font-semibold text-white orbitron">Something went wrong</h2>
          <p className="text-white/70">{error}</p>
        </div>
      </div>
    )
  }

  if (!pass) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-purple-950/20 to-black flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md mx-auto px-4">
          <h2 className="text-xl font-semibold text-white orbitron">Pass Not Found</h2>
          <p className="text-white/70">The pass you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-950/20 to-black">
      <div className="max-w-[1200px] mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1fr_450px]">
          {/* Left Column - Pass Details */}
          <div className="space-y-4 sm:space-y-6">
            <Card className="bg-black/20 backdrop-blur-sm border-slate-800/20">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-[#00FFE0] via-[#0085FF] to-[#7000FF] text-transparent bg-clip-text orbitron">
                  Loyalty Pass Detail
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <p className="text-xs sm:text-sm text-white/50">Owner</p>
                    <p className="text-sm sm:text-base text-white font-mono">
                      {pass.owner.slice(0, 6)}...{pass.owner.slice(-4)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-white/50">Current Tier</p>
                    <p className="text-sm sm:text-base text-white">{pass.currentTier}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-white/50">Total XP</p>
                    <p className="text-sm sm:text-base text-white">{pass.xp}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/20 backdrop-blur-sm border-slate-800/20">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">Action History</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-3 sm:space-y-4">
                  {currentActions.map((action, index) => (
                    <div key={index} className="p-3 sm:p-4 rounded-lg bg-black/40">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm sm:text-base text-white capitalize">{action.type}</p>
                          <p className="text-xs sm:text-sm text-white/50">
                            {new Date(action.timestamp * 1000).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="text-sm sm:text-base text-white/70">+{action.points} XP</span>
                      </div>
                    </div>
                  ))}

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="text-white/70 hover:text-white"
                      >
                        Previous
                      </Button>
                      <span className="text-white/70 text-sm">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="text-white/70 hover:text-white"
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Pass Card */}
          <div className="lg:sticky lg:top-6 flex flex-col items-center">
            <div className="w-full max-w-[350px] sm:max-w-[450px]">
              <LoyaltyCard
                programName={pass.name}
                owner={pass.owner}
                pointsPerAction={{}}
                loyaltyPassAddress={pass.pass}
                qrCodeUrl={`${window.location.origin}/pass/${resolvedParams.passId}`}
                brandColor={pass.metadata.brandColor}
                organizationName={pass.metadata.organizationName}
                totalEarnedPoints={pass.xp}
                tier={pass.currentTier}
                lastAction={pass.lastAction}
                rewards={pass.rewards}
                bannerImage={bannerImage}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
