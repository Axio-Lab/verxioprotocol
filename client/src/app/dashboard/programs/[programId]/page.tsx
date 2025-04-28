'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useVerxioProgram } from '@/lib/methods/initializeProgram'
import { getProgramDetails } from '@verxioprotocol/core'
import { publicKey } from '@metaplex-foundation/umi'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'
import ProgramCard from '@/components/loyalty/ProgramCard'
import { ProgramActions } from '@/components/program/ProgramActions'
import { getImageFromMetadata } from '@/lib/getImageFromMetadata'

interface ProgramTier {
  name: string
  xpRequired: number
  rewards: string[]
}

interface ProgramDetails {
  name: string
  uri: string
  collectionAddress: string
  updateAuthority: string
  numMinted: number
  creator: string
  tiers: ProgramTier[]
  pointsPerAction: Record<string, number>
  metadata: {
    organizationName: string
    brandColor?: string
    [key: string]: any
  }
}

export default function ProgramPage() {
  const { programId } = useParams()
  const [program, setProgram] = useState<ProgramDetails | null>(null)
  const [bannerImage, setBannerImage] = useState<string | null>(null)
  const context = useVerxioProgram()
  const qrCodeUrl = program ? `${window.location.origin}/program/${program.collectionAddress}` : ''

  useEffect(() => {
    async function fetchProgram() {
      if (context && programId) {
        context.collectionAddress = publicKey(programId as string)
        try {
          const details = await getProgramDetails(context)
          setProgram(details)
          // Fetch the image URL from metadata
          if (details.uri) {
            const imageUrl = await getImageFromMetadata(details.uri)
            setBannerImage(imageUrl)
          }
        } catch (error) {
          console.error('Error fetching program details:', error)
        }
      }
    }

    fetchProgram()
  }, [context, programId])

  if (!program) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-purple-950/20 to-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-verxio-purple mx-auto" />
          <p className="text-white/70 orbitron">Loading program details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/programs">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-6 w-6" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-white">{program.name}</h1>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_450px]">
        {/* Left Column - Program Details */}
        <div className="space-y-6">
          <Card className="bg-black/20 backdrop-blur-sm border-slate-800/20">
            <CardHeader>
              <CardTitle>Reward Tiers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {program.tiers.map((tier, index) => (
                  <div key={index} className="p-4 rounded-lg bg-black/40">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-semibold text-white">{tier.name}</h3>
                      <span className="text-sm text-white/70">{tier.xpRequired} XP</span>
                    </div>
                    <ul className="list-disc list-inside text-white/70">
                      {tier.rewards.map((reward, i) => (
                        <li key={i}>{reward}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <ProgramActions
            programId={programId as string}
            pointsPerAction={program.pointsPerAction}
            programName={program.name}
            programUri={program.uri}
          />
        </div>

        {/* Right Column - Program Card */}
        <div className="lg:sticky lg:top-6 flex justify-center">
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
      </div>
    </div>
  )
}
