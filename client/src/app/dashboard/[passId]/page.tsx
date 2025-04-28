'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, ArrowLeft, Clock, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import LoyaltyCard from '@/components/loyalty/LoyaltyCard'
import { useVerxioProgram } from '@/lib/methods/initializeProgram'
import { getPassDetails } from '@/app/actions/loyalty'
import { PassDetails } from '@/app/pass/[passId]/page'
import { getImageFromMetadata } from '@/lib/getImageFromMetadata'

interface PageProps {
  params: Promise<{ passId: string }>
}

export default function LoyaltyPassDetails({ params }: PageProps) {
  const router = useRouter()
  const context = useVerxioProgram()
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [passId, setPassId] = useState<string>('')
  const [assetData, setAssetData] = useState<PassDetails | null>(null)
  const [bannerImage, setBannerImage] = useState<string | null>(null)

  useEffect(() => {
    const loadParams = async () => {
      const resolvedParams = await params
      setPassId(resolvedParams.passId)
    }
    loadParams()
  }, [params])

  useEffect(() => {
    async function fetchAssetData() {
      if (!context || !passId) return

      try {
        const data = await getPassDetails(passId)
        if (data) {
          setAssetData(data)
          // Fetch the image URL from metadata
          if (data.uri) {
            const imageUrl = await getImageFromMetadata(data.uri)
            setBannerImage(imageUrl)
          }
        }
      } catch (error) {
        console.error('Error fetching asset data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAssetData()
  }, [context, passId])

  // Calculate pagination
  const ACTIONS_PER_PAGE = 5
  const totalPages = assetData ? Math.ceil(assetData.actionHistory.length / ACTIONS_PER_PAGE) : 0
  const startIndex = (currentPage - 1) * ACTIONS_PER_PAGE
  const endIndex = startIndex + ACTIONS_PER_PAGE
  const currentActions = assetData?.actionHistory.slice(startIndex, endIndex) || []

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-purple-950/20 to-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-verxio-purple mx-auto" />
          <p className="text-white/70 orbitron">Loading loyalty pass details...</p>
        </div>
      </div>
    )
  }

  if (!assetData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-purple-950/20 to-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold text-white orbitron">Loyalty Pass Not Found</h2>
          <p className="text-white/70">The loyalty pass you're looking for doesn't exist or has been removed.</p>
          <Button variant="outline" className="text-white/70 hover:text-white" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-950/20 to-black">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button variant="ghost" className="mb-6 text-white/70 hover:text-white" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        {/* Top Section - Tiers and Card */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 mb-8">
          {/* Left Column - Tiers and History */}
          <div className="space-y-6">
            {/* Tiers Section */}
            <Card className="bg-black/20 backdrop-blur-sm border-slate-800/20 shadow-lg shadow-purple-500/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-white orbitron">Reward Tiers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {assetData.rewardTiers.map((tier, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-lg bg-black/40 border border-slate-800/20 hover:bg-black/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center"
                          style={{
                            background: `linear-gradient(135deg, #9d4edd40, #9d4edd20)`,
                            boxShadow: `0 0 15px #9d4edd40`,
                          }}
                        >
                          <Zap className="w-4 h-4 text-white" />
                        </div>
                        <h3 className="text-white font-semibold">{tier.name}</h3>
                        <span className="text-white/70 text-sm">({tier.xpRequired} XP)</span>
                      </div>
                      <div className="mt-2">
                        {tier.rewards.map((reward, i) => (
                          <div key={i} className="flex items-center gap-2 text-white/90">
                            <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
                            <span>{reward}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Action History Section */}
            <Card className="bg-black/20 backdrop-blur-sm border-slate-800/20 shadow-lg shadow-purple-500/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-white orbitron">Action History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentActions.map((action, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 rounded-lg bg-black/40 border border-slate-800/20 hover:bg-black/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center"
                          style={{
                            background: `linear-gradient(135deg, #9d4edd40, #9d4edd20)`,
                            boxShadow: `0 0 15px #9d4edd40`,
                          }}
                        >
                          <Clock className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-white/90 capitalize">{action.type}</p>
                          <p className="text-white/50 text-sm">
                            {new Date(action.timestamp * 1000).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span className="text-white font-semibold">+{action.points} XP</span>
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

          {/* Right Column - Loyalty Card */}
          <div className="flex justify-center">
            <div className="w-full max-w-[400px]">
              <LoyaltyCard
                programName={assetData.name}
                owner={assetData.owner}
                pointsPerAction={{}}
                organizationName={assetData.metadata.organizationName}
                brandColor={assetData.metadata.brandColor || '#9d4edd'}
                loyaltyPassAddress={passId}
                qrCodeUrl={`${window.location.origin}/pass/${passId}`}
                totalEarnedPoints={assetData.xp}
                tier={assetData.currentTier}
                lastAction={assetData.lastAction}
                rewards={assetData.rewards}
                bannerImage={bannerImage}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
