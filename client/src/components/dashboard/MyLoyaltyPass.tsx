import { Card, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import LoyaltyCard from '@/components/loyalty/LoyaltyCard'
import { useRouter } from 'next/navigation'
import { useWallet } from '@solana/wallet-adapter-react'
import { useNetwork } from '@/lib/network-context'
import { getLoyaltyPasses, PassWithImage } from '@/app/actions/loyalty'

export default function MyLoyaltyPasses() {
  const router = useRouter()
  const { publicKey: walletPublicKey } = useWallet()
  const { network } = useNetwork()
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [loyaltyPasses, setLoyaltyPasses] = useState<PassWithImage[]>([])
  const isFetching = useRef(false)
  const mounted = useRef(true)

  const CARDS_PER_PAGE = 4
  const totalPages = Math.ceil(loyaltyPasses.length / CARDS_PER_PAGE)
  const startIndex = (currentPage - 1) * CARDS_PER_PAGE
  const endIndex = startIndex + CARDS_PER_PAGE
  const currentCards = loyaltyPasses.slice(startIndex, endIndex)

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  useEffect(() => {
    async function fetchPasses() {
      if (!walletPublicKey || !network || isFetching.current) return

      isFetching.current = true
      setIsLoading(true)

      try {
        const data = await getLoyaltyPasses(walletPublicKey.toString(), network)

        if (mounted.current) {
          setLoyaltyPasses(data)
        }
      } catch (error) {
        console.error('Error fetching passes:', error)
      } finally {
        if (mounted.current) {
          setIsLoading(false)
        }
        isFetching.current = false
      }
    }

    fetchPasses()
  }, [walletPublicKey, network])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-purple-950/20 to-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-verxio-purple mx-auto" />
          <p className="text-white/70 orbitron">Loading your loyalty cards...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
      {loyaltyPasses.length === 0 ? (
        <Card className="bg-black/20 backdrop-blur-sm border-slate-800/20">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h2 className="text-xl font-semibold text-white orbitron mb-2">No Loyalty Cards</h2>
            <p className="text-white/70 text-center max-w-md">
              You don't have any loyalty cards yet. Join a loyalty program to get started!
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-16">
            {currentCards.map(
              (pass, index) =>
                pass.details && (
                  <div
                    key={index}
                    className="flex justify-center cursor-pointer transform transition-transform hover:scale-105"
                    onClick={() => router.push(`/dashboard/${pass.details?.pass}`)}
                  >
                    <div className="w-full max-w-[400px]">
                      <LoyaltyCard
                        programName={pass.details.name}
                        owner={pass.details.owner}
                        pointsPerAction={{}}
                        organizationName={pass.details.metadata.organizationName}
                        brandColor={pass.details.metadata.brandColor || '#00adef'}
                        loyaltyPassAddress={pass.details.pass}
                        qrCodeUrl={
                          typeof window !== 'undefined' ? `${window.location.origin}/pass/${pass.details.pass}` : ''
                        }
                        totalEarnedPoints={pass.details.xp}
                        tier={pass.details.currentTier}
                        lastAction={pass.details.lastAction}
                        rewards={pass.details.rewards}
                        bannerImage={pass.bannerImage || ''}
                      />
                    </div>
                  </div>
                ),
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <button
                className="bg-black/20 border border-verxio-purple/20 text-white px-4 py-2 rounded-lg hover:bg-black/30 transition-colors"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span className="text-white/70 text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <button
                className="bg-black/20 border border-verxio-purple/20 text-white px-4 py-2 rounded-lg hover:bg-black/30 transition-colors"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
