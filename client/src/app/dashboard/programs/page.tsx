'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Users, Gift, FileText, Key, Loader2, Copy, Check } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useNetwork } from '@/lib/network-context'
import { getPrograms, ProgramWithDetails } from '@/app/actions/program'
import { toast } from 'sonner'

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<ProgramWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [copiedProgramId, setCopiedProgramId] = useState<string | null>(null)
  const { publicKey: walletPublicKey } = useWallet()
  const { network } = useNetwork()

  const PROGRAMS_PER_PAGE = 9
  const totalPages = Math.ceil(programs.length / PROGRAMS_PER_PAGE)
  const startIndex = (currentPage - 1) * PROGRAMS_PER_PAGE
  const endIndex = startIndex + PROGRAMS_PER_PAGE
  const currentPrograms = programs.slice(startIndex, endIndex)

  const copyToClipboard = async (text: string, programId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedProgramId(programId)
      setTimeout(() => setCopiedProgramId(null), 2000)
      toast.success('Address copied to clipboard')
    } catch (err) {
      toast.error('Failed to copy address')
    }
  }

  useEffect(() => {
    async function fetchPrograms() {
      if (!walletPublicKey || !network) return

      setIsLoading(true)
      try {
        const data = await getPrograms(walletPublicKey.toString(), network)
        setPrograms(data)
      } catch (error) {
        console.error('Error fetching programs:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPrograms()
  }, [walletPublicKey, network])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-purple-950/20 to-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-verxio-purple mx-auto" />
          <p className="text-white/70 orbitron">Loading your programs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 ">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#00FFE0] via-[#0085FF] to-[#7000FF] text-transparent bg-clip-text orbitron">
          Loyalty Programs
        </h1>
        <Link href="/dashboard/programs/new">
          <Button className="bg-gradient-to-r from-[#00FFE0] via-[#0085FF] to-[#7000FF] text-white hover:opacity-90 orbitron">
            <Plus className="mr-2 h-4 w-4" />
            Create Program
          </Button>
        </Link>
      </div>

      {programs.length === 0 ? (
        <Card className="bg-black/20 backdrop-blur-sm border-slate-800/20">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Gift className="h-12 w-12 text-[#00FFE0] mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No Programs Yet</h3>
            <p className="text-white/70 mb-6">Create your first loyalty program to start rewarding your customers</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {currentPrograms.map((program) => (
              <Link
                href={`/dashboard/programs/${program.details.collectionAddress}`}
                key={program.details.collectionAddress}
              >
                <Card className="bg-black/20 backdrop-blur-sm border-slate-800/20 hover:border-slate-700/40 transition-all cursor-pointer">
                  <CardHeader className="flex flex-col items-center space-y-2 pb-2">
                    <CardTitle className="text-xl text-white text-center">{program.details.name}</CardTitle>
                    <p className="text-sm text-white/50">
                      {program.details.creator.slice(0, 4)}...{program.details.creator.slice(-4)}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Key className="h-4 w-4 text-[#7000FF]" />
                          <span className="text-sm text-white/70">Fee Address</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white">
                            {program.details.feeAddress.slice(0, 6)}...{program.details.feeAddress.slice(-4)}
                          </span>
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              copyToClipboard(program.details.feeAddress, program.details.collectionAddress)
                            }}
                            className="p-1 hover:bg-white/10 rounded-md transition-colors"
                          >
                            {copiedProgramId === program.details.collectionAddress ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4 text-white/70" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-[#0085FF]" />
                          <span className="text-sm text-white/70">Total Members</span>
                        </div>
                        <span className="text-sm font-medium text-white">{program.details.numMinted}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-[#00FFE0]" />
                          <span className="text-sm text-white/70">URI</span>
                        </div>
                        <span className="text-sm font-medium text-white">{program.details.uri.slice(0, 10)}...</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Key className="h-4 w-4 text-[#7000FF]" />
                          <span className="text-sm text-white/70">Authority</span>
                        </div>
                        <span className="text-sm font-medium text-white">
                          {program.details.updateAuthority.slice(0, 4)}...{program.details.updateAuthority.slice(-4)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-10">
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
