'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { mintVoucher } from '@verxioprotocol/core'
import { generateSigner, publicKey } from '@metaplex-foundation/umi'
import { VerxioForm, VerxioFormSection, VerxioFormField } from './base/VerxioForm'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Alert, AlertDescription } from '../ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Upload, Link, Calendar, Hash } from 'lucide-react'

const mintVoucherSchema = z.object({
  collectionAddress: z.string().min(1, 'Collection address is required'),
  voucherName: z.string().min(1, 'Voucher name is required'),
  recipient: z.string().min(1, 'Recipient address is required'),
  metadataUri: z.string().optional(),
  imageBuffer: z.any().optional(),
  imageFilename: z.string().optional(),
  imageContentType: z.string().optional(),
  voucherData: z.object({
    type: z.enum(['percentage_off', 'fixed_verxio_credits', 'free_item', 'buy_one_get_one', 'custom_reward']),
    value: z.number().min(0, 'Value must be positive'),
    maxUses: z.number().min(1, 'Max uses must be at least 1'),
    expiryDate: z.string().min(1, 'Expiry date is required'),
    description: z.string().min(1, 'Description is required'),
    merchantId: z.string().min(1, 'Merchant ID is required'),
    conditions: z.array(z.string()).optional(),
  }),
})

type MintVoucherFormData = z.infer<typeof mintVoucherSchema>

interface MintVoucherFormProps {
  context: any
  signer: any
  onSuccess?: (result: any) => void
  onError?: (error: any) => void
}

export default function MintVoucherForm({
  context,
  signer,
  onSuccess,
  onError,
}: MintVoucherFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [uploadMethod, setUploadMethod] = useState<'uri' | 'image'>('uri')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [conditions, setConditions] = useState<string[]>([])
  const [mintedVoucher, setMintedVoucher] = useState<any>(null)

  const form = useForm<MintVoucherFormData>({
    resolver: zodResolver(mintVoucherSchema),
    defaultValues: {
      voucherName: '',
      recipient: '',
      voucherData: {
        type: 'percentage_off',
        value: 0,
        maxUses: 1,
        expiryDate: '',
        description: '',
        merchantId: '',
        conditions: [],
      },
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = form

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setValue('imageFilename', file.name)
      setValue('imageContentType', file.type)
    }
  }

  const addCondition = () => {
    setConditions([...conditions, ''])
  }

  const updateCondition = (index: number, value: string) => {
    const newConditions = [...conditions]
    newConditions[index] = value
    setConditions(newConditions)
    setValue('voucherData.conditions', newConditions.filter(c => c.trim() !== ''))
  }

  const removeCondition = (index: number) => {
    const newConditions = conditions.filter((_, i) => i !== index)
    setConditions(newConditions)
    setValue('voucherData.conditions', newConditions)
  }

  const onSubmit = async (data: MintVoucherFormData) => {
    setIsLoading(true)
    try {
      // Prepare the request payload
      const payload: any = {
        collectionAddress: data.collectionAddress,
        voucherName: data.voucherName,
        recipient: data.recipient,
        voucherData: {
          ...data.voucherData,
          expiryDate: data.voucherData.expiryDate,
        },
      }

      if (uploadMethod === 'uri' && data.metadataUri) {
        payload.metadataUri = data.metadataUri
      } else if (uploadMethod === 'image' && selectedFile) {
        // Convert file to base64 buffer for API transmission
        const arrayBuffer = await selectedFile.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const base64Buffer = buffer.toString('base64')
        
        payload.imageBuffer = base64Buffer
        payload.imageFilename = selectedFile.name
        payload.imageContentType = selectedFile.type
      } else {
        throw new Error('Either metadata URI or image file must be provided')
      }

      // Call the backend API
      const response = await fetch('/api/mint-voucher', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to mint voucher')
      }

      const result = await response.json()
      setMintedVoucher(result)
      onSuccess?.(result)

      // Reset form after successful minting
      form.reset()
    } catch (error) {
      console.error('Error minting voucher:', error)
      onError?.(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <VerxioForm form={form} onSubmit={onSubmit}>
        <Card>
          <CardHeader>
            <CardDescription>
              Create and distribute individual vouchers within a collection. You can either provide a
              pre-uploaded metadata URI or upload an image to auto-generate metadata.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <VerxioFormSection title="">
              <VerxioFormField label="Voucher Collection Address" error={errors.collectionAddress?.message}>
                <Input
                  {...register('collectionAddress')}
                  placeholder="Collection public key"
                />
              </VerxioFormField>

              <VerxioFormField label="Voucher Name" error={errors.voucherName?.message}>
                <Input
                  {...register('voucherName')}
                  placeholder="Summer Sale Voucher"
                />
              </VerxioFormField>

              <VerxioFormField label="Recipient Address" error={errors.recipient?.message}>
                <Input
                  {...register('recipient')}
                  placeholder="Recipient wallet address"
                />
              </VerxioFormField>
            </VerxioFormSection>

            <VerxioFormSection title="Metadata Upload Method">
              <Tabs value={uploadMethod} onValueChange={(value) => setUploadMethod(value as 'uri' | 'image')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="uri" className="flex items-center gap-2">
                    <Link className="h-4 w-4" />
                    Pre-uploaded URI
                  </TabsTrigger>
                  <TabsTrigger value="image" className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Upload Image
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="uri" className="space-y-4">
                  <VerxioFormField label="Metadata URI" error={errors.metadataUri?.message}>
                    <Input
                      {...register('metadataUri')}
                      placeholder="https://arweave.net/..."
                    />
                  </VerxioFormField>
                  <Alert>
                    <AlertDescription>
                      Provide a pre-uploaded metadata URI. The image and metadata should already be
                      uploaded to Arweave or another decentralized storage.
                    </AlertDescription>
                  </Alert>
                </TabsContent>

                <TabsContent value="image" className="space-y-4">
                  <VerxioFormField label="Voucher Image">
                    <div className="flex items-center gap-4">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="flex-1"
                      />
                      {selectedFile && (
                        <div className="text-sm text-gray-600">
                          Selected: {selectedFile.name}
                        </div>
                      )}
                    </div>
                  </VerxioFormField>
                  <Alert>
                    <AlertDescription>
                      Upload an image file. The protocol will automatically upload it to Irys and
                      generate metadata.
                    </AlertDescription>
                  </Alert>
                </TabsContent>
              </Tabs>
            </VerxioFormSection>

            <VerxioFormSection title="Voucher Configuration">
              <VerxioFormField label="Voucher Type" error={(errors.voucherData?.type as any)?.message}>
                <Select
                  onValueChange={(value) => setValue('voucherData.type', value as any)}
                  defaultValue={watch('voucherData.type')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select voucher type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage_off">Percentage Off</SelectItem>
                    <SelectItem value="fixed_verxio_credits">Fixed Credits</SelectItem>
                    <SelectItem value="free_item">Free Item</SelectItem>
                    <SelectItem value="buy_one_get_one">Buy One Get One</SelectItem>
                    <SelectItem value="custom_reward">Custom Reward</SelectItem>
                  </SelectContent>
                </Select>
              </VerxioFormField>

              <VerxioFormField label="Value" error={errors.voucherData?.value?.message}>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    {...register('voucherData.value', { valueAsNumber: true })}
                    placeholder="15"
                  />
                  <span className="text-sm text-gray-500">
                    {watch('voucherData.type') === 'percentage_off' ? '%' : 'credits'}
                  </span>
                </div>
              </VerxioFormField>

              <VerxioFormField label="Max Uses" error={errors.voucherData?.maxUses?.message}>
                <Input
                  type="number"
                  {...register('voucherData.maxUses', { valueAsNumber: true })}
                  placeholder="1"
                />
              </VerxioFormField>

              <VerxioFormField label="Expiry Date" error={errors.voucherData?.expiryDate?.message}>
                <Input
                  type="datetime-local"
                  {...register('voucherData.expiryDate')}
                />
              </VerxioFormField>

              <VerxioFormField label="Description" error={errors.voucherData?.description?.message}>
                <Textarea
                  {...register('voucherData.description')}
                  placeholder="15% off your next purchase"
                  rows={2}
                />
              </VerxioFormField>

              <VerxioFormField label="Merchant ID" error={errors.voucherData?.merchantId?.message}>
                <Input
                  {...register('voucherData.merchantId')}
                  placeholder="coffee_brew_merchant_001"
                />
              </VerxioFormField>
            </VerxioFormSection>

            <VerxioFormSection title="Conditions (Optional)">
              <div className="space-y-3">
                <Label>Add conditions for voucher usage</Label>
                {conditions.map((condition, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={condition}
                      onChange={(e) => updateCondition(index, e.target.value)}
                      placeholder="Minimum purchase: $50"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeCondition(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addCondition}
                  className="w-full"
                >
                  Add Condition
                </Button>
              </div>
            </VerxioFormSection>

            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Minting Voucher...' : 'Mint Voucher'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </VerxioForm>

      {/* Transaction Result Display */}
      {mintedVoucher && (
        <div className="mt-8 p-6 bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Voucher Minted Successfully!</h2>
            <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              Transaction Confirmed
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Transaction Details */}
            <div className="space-y-4">
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Transaction Signature:</span>
                </p>
                <p className="font-mono text-sm break-all">{mintedVoucher.signature}</p>
              </div>
            </div>

            {/* Voucher Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Voucher Details</h3>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Voucher Public Key:</span>
                </p>
                <p className="font-mono text-sm break-all">{mintedVoucher.asset.publicKey}</p>
                <p>
                  {/* <span className="font-medium">Voucher Address:</span> */}
                </p>
                {/* <p className="font-mono text-sm break-all">{mintedVoucher.voucherAddress}</p> */}
              </div>
            </div>

            {/* Next Steps */}
            <div className="md:col-span-2 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Next Steps</h3>
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-blue-800">Your voucher has been minted successfully! You can now:</p>
                <ul className="mt-2 list-disc list-inside text-blue-700">
                  <li>Validate the voucher using the ValidateVoucher form</li>
                  <li>Redeem the voucher when ready to use</li>
                  <li>Transfer the voucher to another wallet if transferable</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 