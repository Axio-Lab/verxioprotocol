'use client'

import { useEffect, useState, use } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ProgramCard from '@/components/loyalty/ProgramCard'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletButton } from '@/components/layout/buttonConfig'
import { getImageFromMetadata } from '@/lib/getImageFromMetadata'
import { SuccessModal } from '@/components/ui/success-modal'
import { toast } from 'sonner'
import { useNetwork } from '@/lib/network-context'
import { getProgramDetails, ProgramDetails } from '@/app/actions/program'
import { issuePasses } from '@/app/actions/manage-program'

export default function PublicProgramPage({ params }: { params: Promise<{ programId: string }> }) {
  const resolvedParams = use(params)
  const [program, setProgram] = useState<ProgramDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [bannerImage, setBannerImage] = useState<string | null>(null)
  const { connected, publicKey: address } = useWallet()
  const { network } = useNetwork()
  const qrCodeUrl = program ? `${window.location.origin}/program/${program.collectionAddress}` : ''
  const [isMinting, setIsMinting] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successData, setSuccessData] = useState<{ title: string; message: string; signature?: string } | null>(null)

  useEffect(() => {
    let isMounted = true

    async function fetchProgram() {
      if (!network) {
        setIsLoading(false)
        return
      }

      try {
        setError(null)
        const details = await getProgramDetails(resolvedParams.programId)

        if (isMounted) {
          setProgram(details)
          // Fetch the image URL from metadata
          if (details.uri) {
            const imageUrl = await getImageFromMetadata(details.uri)
            setBannerImage(imageUrl)
          }
        }
      } catch (error) {
        console.error('Error fetching program details:', error)
        if (isMounted) {
          setError('Failed to load program details. Please try again later.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchProgram()

    return () => {
      isMounted = false
    }
  }, [resolvedParams.programId, network])

  const handleMintPass = async () => {
    if (!address) {
      toast.error('Please connect your wallet first')
      return
    }

    if (!program) {
      toast.error('Program not found')
      return
    }

    if (!network) {
      toast.error('Network not selected')
      return
    }

    if (program.network !== network) {
      toast.error(`Please switch to ${program.network} network to mint this pass`)
      return
    }

    setIsMinting(true)
    try {
      const results = await issuePasses([
        {
          collectionAddress: program.collectionAddress,
          recipient: address.toString(),
          passName: program.name,
          passMetadataUri: program.uri,
          network,
        },
      ])

      if (results) {
        toast.success('Loyalty pass minted successfully!')
        setSuccessData({
          title: 'Pass Issued Successfully',
          message: 'Your loyalty pass has been issued successfully',
        })
        setShowSuccessModal(true)
      }
    } catch (error) {
      console.error('Error minting pass:', error)
      toast.error('Failed to mint loyalty pass')
    } finally {
      setIsMinting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-purple-950/20 to-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-verxio-purple mx-auto" />
          <p className="text-white/70 orbitron">Loading program details...</p>
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

  if (!program) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-purple-950/20 to-black flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md mx-auto px-4">
          <h2 className="text-xl font-semibold text-white orbitron">Program Not Found</h2>
          <p className="text-white/70">The program you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-950/20 to-black">
      <div className="fixed top-0 right-0 z-50 p-2 sm:p-4">
        <WalletButton style={{ fontFamily: 'orbitron' }} />
      </div>
      <div className="max-w-[1200px] mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">{program.name}</h1>
          <p className="text-sm sm:text-base text-white/70">Join our loyalty program and earn rewards!</p>
        </div>

        <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1fr_450px]">
          {/* Left Column - Program Details */}
          <div className="space-y-4 sm:space-y-6">
            <Card className="bg-black/20 backdrop-blur-sm border-slate-800/20">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">Program Details</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <p className="text-xs sm:text-sm text-white/50">Creator</p>
                    <p className="text-sm sm:text-base text-white font-mono">
                      {program.creator.slice(0, 8)}...{program.creator.slice(-6)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-white/50">Authority</p>
                    <p className="text-sm sm:text-base text-white font-mono">
                      {program.updateAuthority.slice(0, 8)}...{program.updateAuthority.slice(-6)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-white/50">Collection</p>
                    <p className="text-sm sm:text-base text-white font-mono">
                      {program.collectionAddress.slice(0, 8)}...{program.collectionAddress.slice(-6)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-white/50">Members</p>
                    <p className="text-sm sm:text-base text-white">{program.numMinted}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/20 backdrop-blur-sm border-slate-800/20">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">Reward Tiers</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-3 sm:space-y-4">
                  {program.tiers.map((tier, index) => (
                    <div key={index} className="p-3 sm:p-4 rounded-lg bg-black/40">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-base sm:text-lg font-semibold text-white">{tier.name}</h3>
                        <span className="text-xs sm:text-sm text-white/70">{tier.xpRequired} XP</span>
                      </div>
                      <ul className="list-disc list-inside text-sm sm:text-base text-white/70">
                        {tier.rewards.map((reward: string, i: number) => (
                          <li key={i}>{reward}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/20 backdrop-blur-sm border-slate-800/20">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">Points per Action</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-3 sm:space-y-4">
                  {Object.entries(program.pointsPerAction).map(([action, points], index) => (
                    <div key={index} className="flex justify-between items-center p-3 sm:p-4 rounded-lg bg-black/40">
                      <span className="text-sm sm:text-base text-white capitalize">{action}</span>
                      <span className="text-sm sm:text-base text-white/70">{points} points</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Program Card */}
          <div className="lg:sticky lg:top-6 flex flex-col items-center gap-4">
            <div className="w-full max-w-[350px] sm:max-w-[450px]">
              <ProgramCard
                programName={program.name}
                creator={program.creator}
                pointsPerAction={program.pointsPerAction}
                collectionAddress={program.collectionAddress}
                qrCodeUrl={qrCodeUrl}
                brandColor={program.metadata.brandColor}
                organizationName={program.metadata.organizationName}
                bannerImage={bannerImage}
              />
            </div>
            <Button
              onClick={handleMintPass}
              disabled={!connected || isMinting}
              className="w-full max-w-[350px] sm:max-w-[450px] bg-gradient-to-r from-[#00FFE0] via-[#0085FF] to-[#7000FF] text-white hover:opacity-90 orbitron disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isMinting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Minting Pass...
                </>
              ) : connected ? (
                'Mint Loyalty Pass'
              ) : (
                'Connect Wallet to Mint'
              )}
            </Button>
          </div>
        </div>
      </div>

      {successData && (
        <SuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          title={successData.title}
          message={successData.message}
          transactionSignature={successData.signature}
        />
      )}
    </div>
  )
}
