'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Upload, Info, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { SuccessModal } from '@/components/ui/success-modal'
import { useNetwork } from '@/lib/network-context'
import {
  issuePasses,
  awardPointsToPasses,
  giftPointsToPasses,
  revokePointsFromPasses,
} from '@/app/actions/manage-program'
import {
  parseCsvFile,
  parseCsvFileWithActions,
  parseCsvFileWithGiftPoints,
  parseCsvFileWithPoints,
  downloadResultsAsCsv,
} from './parse-csv'

interface ProgramActionsProps {
  programId: string
  pointsPerAction: Record<string, number>
  programName: string
  programUri: string
}

interface InputState {
  address: string
  action?: string
  points?: number
  reason?: string
  signature?: string
}

export function ProgramActions({ programId, pointsPerAction, programName, programUri }: ProgramActionsProps) {
  const [activeTab, setActiveTab] = useState('issue')
  const [inputs, setInputs] = useState<InputState[]>([{ address: '' }])
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successData, setSuccessData] = useState<{ title: string; message: string; signature?: string } | null>(null)
  const { network } = useNetwork()

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setInputs([{ address: '' }])
    setCsvFile(null)
  }

  const handleAddInput = () => {
    if (inputs.length < 5) {
      setInputs([...inputs, { address: '' }])
    }
  }

  const handleRemoveInput = (index: number) => {
    setInputs(inputs.filter((_, i) => i !== index))
  }

  const handleInputChange = (index: number, field: keyof InputState, value: string | number) => {
    // Clear CSV file when manual input starts
    if (csvFile) {
      setCsvFile(null)
      // Clear the file input field
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      if (fileInput) {
        fileInput.value = ''
      }
    }
    const newInputs = [...inputs]
    newInputs[index] = { ...newInputs[index], [field]: value }
    setInputs(newInputs)
  }

  const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setCsvFile(file)
      switch (activeTab) {
        case 'issue':
          setInputs([{ address: '' }])
          break
        case 'award':
          setInputs([{ address: '', action: '' }])
          break
        case 'gift':
          setInputs([{ address: '', points: 0, reason: '' }])
          break
        case 'revoke':
          setInputs([{ address: '', points: 0 }])
          break
      }
    }
  }

  const handleIssuePass = async () => {
    setIsLoading(true)
    try {
      let addresses: string[] = []
      if (csvFile) {
        addresses = await parseCsvFile(csvFile)
      } else {
        addresses = inputs.map((input) => input.address).filter(Boolean)
      }

      const results = await issuePasses(
        addresses.map((recipient) => ({
          collectionAddress: programId,
          recipient,
          passName: programName,
          passMetadataUri: programUri,
          network,
        })),
      )

      const message =
        addresses.length === 1
          ? `Successfully issued loyalty pass to ${addresses[0].slice(0, 4)}...${addresses[0].slice(-4)}.`
          : `Successfully issued ${addresses.length} loyalty passes. Transaction details will be downloaded automatically.`

      setSuccessData({
        title: 'Passes Issued Successfully',
        message,
        signature: addresses.length === 1 ? results[0].signature : undefined,
      })
      setShowSuccessModal(true)
      setInputs([{ address: '' }])
      setCsvFile(null)

      // Only download CSV for multiple transactions
      if (addresses.length > 1) {
        downloadResultsAsCsv(
          results.map((r, i) => ({ address: addresses[i], signature: r.signature })),
          'issue',
        )
      }
    } catch (error) {
      console.error('Error issuing passes:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to issue passes')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAwardPoints = async () => {
    setIsLoading(true)
    try {
      let data: { address: string; action: string }[] = []
      if (csvFile) {
        data = await parseCsvFileWithActions(csvFile)
      } else {
        data = inputs
          .map((input) => ({ address: input.address, action: input.action || '' }))
          .filter((d) => d.address && d.action)
      }

      const results = await awardPointsToPasses(
        data.map((input) => ({
          passAddress: input.address,
          action: input.action,
          network,
        })),
      )

      const message =
        data.length === 1
          ? `Successfully awarded ${pointsPerAction[data[0].action]} points for ${data[0].action} to pass ${data[0].address.slice(0, 4)}...${data[0].address.slice(-4)}.`
          : `Successfully awarded points to ${data.length} loyalty passes. Transaction details will be downloaded automatically.`

      setSuccessData({
        title: 'Points Awarded Successfully',
        message,
        signature: data.length === 1 ? results[0].signature : undefined,
      })
      setShowSuccessModal(true)
      setInputs([{ address: '', action: '' }])
      setCsvFile(null)

      // Only download CSV for multiple transactions
      if (data.length > 1) {
        downloadResultsAsCsv(
          results.map((r, i) => ({ address: data[i].address, action: data[i].action, signature: r.signature })),
          'award',
        )
      }
    } catch (error) {
      console.error('Error awarding points:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to award points')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGiftPoints = async () => {
    setIsLoading(true)
    try {
      let data: { address: string; points: number; reason: string }[] = []
      if (csvFile) {
        data = await parseCsvFileWithGiftPoints(csvFile)
      } else {
        data = inputs
          .map((input) => ({
            address: input.address,
            points: input.points || 0,
            reason: input.reason || '',
          }))
          .filter((d) => d.address && d.points > 0 && d.reason)
      }

      const results = await giftPointsToPasses(
        data.map((input) => ({
          passAddress: input.address,
          pointsToGift: input.points,
          action: input.reason,
          network,
        })),
      )

      const message =
        data.length === 1
          ? `Successfully gifted ${data[0].points} points for "${data[0].reason}" to pass ${data[0].address.slice(0, 4)}...${data[0].address.slice(-4)}.`
          : `Successfully gifted points to ${data.length} loyalty passes. Transaction details will be downloaded automatically.`

      setSuccessData({
        title: 'Points Gifted Successfully',
        message,
        signature: data.length === 1 ? results[0].signature : undefined,
      })
      setShowSuccessModal(true)
      setInputs([{ address: '', points: 0, reason: '' }])
      setCsvFile(null)

      // Only download CSV for multiple transactions
      if (data.length > 1) {
        downloadResultsAsCsv(
          results.map((r, i) => ({
            address: data[i].address,
            points: data[i].points,
            reason: data[i].reason,
            signature: r.signature,
          })),
          'gift',
        )
      }
    } catch (error) {
      console.error('Error gifting points:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to gift points')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRevokePoints = async () => {
    setIsLoading(true)
    try {
      let data: { address: string; points: number }[] = []
      if (csvFile) {
        data = await parseCsvFileWithPoints(csvFile)
      } else {
        data = inputs
          .map((input) => ({
            address: input.address,
            points: input.points || 0,
          }))
          .filter((d) => d.address && d.points > 0)
      }

      const results = await revokePointsFromPasses(
        data.map((input) => ({
          passAddress: input.address,
          pointsToRevoke: input.points,
          network,
        })),
      )

      const message =
        data.length === 1
          ? `Successfully revoked ${data[0].points} points from pass ${data[0].address.slice(0, 4)}...${data[0].address.slice(-4)}.`
          : `Successfully revoked points from ${data.length} loyalty passes. Transaction details will be downloaded automatically.`

      setSuccessData({
        title: 'Points Revoked Successfully',
        message,
        signature: data.length === 1 ? results[0].signature : undefined,
      })
      setShowSuccessModal(true)
      setInputs([{ address: '', points: 0 }])
      setCsvFile(null)

      // Only download CSV for multiple transactions
      if (data.length > 1) {
        downloadResultsAsCsv(
          results.map((r, i) => ({
            address: data[i].address,
            points: data[i].points,
            signature: r.signature,
          })),
          'revoke',
        )
      }
    } catch (error) {
      console.error('Error revoking points:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to revoke points')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Card className="bg-black/20 backdrop-blur-sm border-slate-800/20">
        <CardHeader>
          <CardTitle className="text-lg">Program Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="issue">Issue Pass</TabsTrigger>
              <TabsTrigger value="award">Award Points</TabsTrigger>
              <TabsTrigger value="gift">Gift Points</TabsTrigger>
              <TabsTrigger value="revoke">Revoke Points</TabsTrigger>
            </TabsList>

            <TabsContent value="issue" className="space-y-4">
              {inputs.map((input, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Enter recipient wallet address"
                      value={input.address}
                      onChange={(e) => handleInputChange(index, 'address', e.target.value)}
                    />
                    {index > 0 && (
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveInput(index)}>
                        ×
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {inputs.length < 5 && (
                <Button variant="outline" onClick={handleAddInput}>
                  + Add Another Wallet
                </Button>
              )}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label className="orbitron text-xs text-white/50">Or Upload CSV</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-4 w-4 p-0">
                        <Info className="h-4 w-4 text-white/50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 bg-slate-900 border-slate-700/20">
                      <div className="space-y-2">
                        <h4 className="font-medium orbitron">CSV Format</h4>
                        <p className="text-sm text-white/90">Upload a CSV file with one wallet address per line.</p>
                        <p className="text-sm text-red-400">
                          Note: Do not include headers in your CSV file as they will be treated as data.
                        </p>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="flex items-center gap-2">
                  <Input type="file" accept=".csv" onChange={handleCsvUpload} />
                  <Button variant="outline" size="icon">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Button
                onClick={handleIssuePass}
                disabled={isLoading || (!csvFile && !inputs.some((input) => input.address))}
                className="w-full bg-gradient-to-r from-[#00FFE0] via-[#0085FF] to-[#7000FF] text-white hover:opacity-90 orbitron disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Issuing Passes...
                  </>
                ) : (
                  'Issue Loyalty Passes'
                )}
              </Button>
            </TabsContent>

            <TabsContent value="award" className="space-y-4">
              {inputs.map((input, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Enter loyalty pass address"
                      value={input.address}
                      onChange={(e) => handleInputChange(index, 'address', e.target.value)}
                    />
                    <Select value={input.action} onValueChange={(value) => handleInputChange(index, 'action', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select action" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(pointsPerAction).map(([action, points]) => (
                          <SelectItem key={action} value={action}>
                            {action} ({points} points)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {index > 0 && (
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveInput(index)}>
                        ×
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {inputs.length < 5 && (
                <Button variant="outline" onClick={handleAddInput}>
                  + Add Another Pass
                </Button>
              )}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label className="orbitron text-xs text-white/50">Or Upload CSV</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-4 w-4 p-0">
                        <Info className="h-4 w-4 text-white/50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 bg-slate-900 border-slate-700/20">
                      <div className="space-y-2">
                        <h4 className="font-medium orbitron">CSV Format</h4>
                        <p className="text-sm text-white/90">
                          Upload a CSV file with loyalty pass address and action per line.
                        </p>
                        <p className="text-sm text-red-400">
                          Note: Do not include headers in your CSV file as they will be treated as data.
                        </p>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="flex items-center gap-2">
                  <Input type="file" accept=".csv" onChange={handleCsvUpload} />
                  <Button variant="outline" size="icon">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Button
                onClick={handleAwardPoints}
                disabled={isLoading || (!csvFile && !inputs.some((input) => input.address && input.action))}
                className="w-full bg-gradient-to-r from-[#00FFE0] via-[#0085FF] to-[#7000FF] text-white hover:opacity-90 orbitron disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Awarding Points...
                  </>
                ) : (
                  'Award Loyalty Points'
                )}
              </Button>
            </TabsContent>

            <TabsContent value="gift" className="space-y-4">
              {inputs.map((input, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Enter loyalty pass address"
                      value={input.address}
                      onChange={(e) => handleInputChange(index, 'address', e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Points to gift"
                      value={input.points}
                      onChange={(e) => handleInputChange(index, 'points', parseInt(e.target.value) || 0)}
                    />
                    <Input
                      placeholder="Reason for gifting"
                      value={input.reason}
                      onChange={(e) => handleInputChange(index, 'reason', e.target.value)}
                    />
                    {index > 0 && (
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveInput(index)}>
                        ×
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {inputs.length < 5 && (
                <Button variant="outline" onClick={handleAddInput}>
                  + Add Another Pass
                </Button>
              )}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label className="orbitron text-xs text-white/50">Or Upload CSV</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-4 w-4 p-0">
                        <Info className="h-4 w-4 text-white/50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 bg-slate-900 border-slate-700/20">
                      <div className="space-y-2">
                        <h4 className="font-medium orbitron">CSV Format</h4>
                        <p className="text-sm text-white/90">
                          Upload a CSV file with loyalty pass address, points, and reason per line.
                        </p>
                        <p className="text-sm text-red-400">
                          Note: Do not include headers in your CSV file as they will be treated as data.
                        </p>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="flex items-center gap-2">
                  <Input type="file" accept=".csv" onChange={handleCsvUpload} />
                  <Button variant="outline" size="icon">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Button
                onClick={handleGiftPoints}
                disabled={
                  isLoading || (!csvFile && !inputs.some((input) => input.address && input.points && input.reason))
                }
                className="w-full bg-gradient-to-r from-[#00FFE0] via-[#0085FF] to-[#7000FF] text-white hover:opacity-90 orbitron disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gifting Points...
                  </>
                ) : (
                  'Gift Loyalty Points'
                )}
              </Button>
            </TabsContent>

            <TabsContent value="revoke" className="space-y-4">
              {inputs.map((input, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Enter loyalty pass address"
                      value={input.address}
                      onChange={(e) => handleInputChange(index, 'address', e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Points to revoke"
                      value={input.points}
                      onChange={(e) => handleInputChange(index, 'points', parseInt(e.target.value) || 0)}
                    />
                    {index > 0 && (
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveInput(index)}>
                        ×
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {inputs.length < 5 && (
                <Button variant="outline" onClick={handleAddInput}>
                  + Add Another Pass
                </Button>
              )}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label className="orbitron text-xs text-white/50">Or Upload CSV</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-4 w-4 p-0">
                        <Info className="h-4 w-4 text-white/50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 bg-slate-900 border-slate-700/20">
                      <div className="space-y-2">
                        <h4 className="font-medium orbitron">CSV Format</h4>
                        <p className="text-sm text-white/90">
                          Upload a CSV file with loyalty pass address and points per line.
                        </p>
                        <p className="text-sm text-red-400">
                          Note: Do not include headers in your CSV file as they will be treated as data.
                        </p>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="flex items-center gap-2">
                  <Input type="file" accept=".csv" onChange={handleCsvUpload} />
                  <Button variant="outline" size="icon">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Button
                onClick={handleRevokePoints}
                disabled={isLoading || (!csvFile && !inputs.some((input) => input.address && input.points))}
                className="w-full bg-gradient-to-r from-[#00FFE0] via-[#0085FF] to-[#7000FF] text-white hover:opacity-90 orbitron disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Revoking Points...
                  </>
                ) : (
                  'Revoke Loyalty Points'
                )}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {successData && (
        <SuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          title={successData.title}
          message={successData.message}
          transactionSignature={successData.signature}
          network={network}
        />
      )}
    </>
  )
}
