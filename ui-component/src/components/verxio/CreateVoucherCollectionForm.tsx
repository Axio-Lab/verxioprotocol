'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createVoucherCollection } from '@verxioprotocol/core'
import { generateSigner } from '@metaplex-foundation/umi'
import { VerxioForm, VerxioFormSection, VerxioFormField } from './base/VerxioForm'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Alert, AlertDescription } from '../ui/alert'
import { Card, CardContent, CardDescription, CardHeader } from '../ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Upload, Link } from 'lucide-react'

const voucherCollectionSchema = z.object({
  voucherCollectionName: z.string().min(1, 'Collection name is required'),
  metadataUri: z.string().optional(),
  imageBuffer: z.any().optional(),
  imageFilename: z.string().optional(),
  imageContentType: z.string().optional(),
  description: z.string().optional(),
  metadata: z.object({
    merchantName: z.string().min(1, 'Merchant name is required'),
    merchantAddress: z.string().min(1, 'Merchant address is required'),
    voucherTypes: z.array(z.string()).min(1, 'At least one voucher type is required'),
    description: z.string().optional(),
    terms: z.string().optional(),
  }),
})

type VoucherCollectionFormData = z.infer<typeof voucherCollectionSchema>

interface CreateVoucherCollectionFormProps {
  context: any
  signer: any
  onSuccess?: (result: any) => void
  onError?: (error: any) => void
}

export default function CreateVoucherCollectionForm({
  context,
  signer,
  onSuccess,
  onError,
}: CreateVoucherCollectionFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [uploadMethod, setUploadMethod] = useState<'uri' | 'image'>('uri')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [createdCollection, setCreatedCollection] = useState<any>(null)

  const form = useForm<VoucherCollectionFormData>({
    resolver: zodResolver(voucherCollectionSchema),
    defaultValues: {
      voucherCollectionName: '',
      metadata: {
        merchantName: '',
        merchantAddress: '',
        voucherTypes: [],
        description: '',
        terms: '',
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

  const watchedVoucherTypes = watch('metadata.voucherTypes')

  const voucherTypeOptions = [
    'percentage_off',
    'fixed_verxio_credits',
    'free_item',
    'buy_one_get_one',
    'custom_reward',
  ]

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setValue('imageFilename', file.name)
      setValue('imageContentType', file.type)
    }
  }

  const handleVoucherTypeChange = (type: string, checked: boolean) => {
    const currentTypes = watchedVoucherTypes || []
    if (checked) {
      setValue('metadata.voucherTypes', [...currentTypes, type])
    } else {
      setValue(
        'metadata.voucherTypes',
        currentTypes.filter((t) => t !== type)
      )
    }
  }

  const onSubmit = async (data: VoucherCollectionFormData) => {
    setIsLoading(true)
    try {
      // Prepare the request payload
      const payload: any = {
        voucherCollectionName: data.voucherCollectionName,
        metadata: {
          merchantName: data.metadata.merchantName,
          merchantAddress: data.metadata.merchantAddress,
          voucherTypes: data.metadata.voucherTypes,
        },
        description: data.description || data.metadata.description || `Voucher collection for ${data.metadata.merchantName}`,
      }

      if (uploadMethod === 'uri' && data.metadataUri) {
        // Use pre-uploaded metadata URI
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
      const response = await fetch('/api/create-voucher-collection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create voucher collection')
      }

      const result = await response.json()
      setCreatedCollection(result)
      onSuccess?.(result)

      // Reset form after successful creation
      form.reset()
    } catch (error) {
      console.error('Error creating voucher collection:', error)
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
              Create a collection to organize vouchers by merchant and type. You can either provide a
              pre-uploaded metadata URI or upload an image to auto-generate metadata.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <VerxioFormSection title="Collection Details">
              <VerxioFormField label="Collection Name" error={errors.voucherCollectionName?.message}>
                <Input
                  {...register('voucherCollectionName')}
                  placeholder="Summer Sale Vouchers"
                />
              </VerxioFormField>

            </VerxioFormSection>
            
            <VerxioFormSection title="Metadata Upload Method">
              <Tabs value={uploadMethod} onValueChange={(value: string) => setUploadMethod(value as 'uri' | 'image')}>
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
                  <VerxioFormField label="Collection Image">
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

            <VerxioFormSection title="Merchant Information">
              <VerxioFormField label="Merchant Name" error={errors.metadata?.merchantName?.message}>
                <Input
                  {...register('metadata.merchantName')}
                  placeholder="Coffee Brew"
                />
              </VerxioFormField>

              <VerxioFormField label="Merchant Address" error={errors.metadata?.merchantAddress?.message}>
                <Input
                  {...register('metadata.merchantAddress')}
                  placeholder="coffee_brew_merchant_001"
                />
              </VerxioFormField>
            </VerxioFormSection>

            <VerxioFormSection title="Voucher Types">
              <div className="space-y-3">
                <Label>Select voucher types for this collection</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {voucherTypeOptions.map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={type}
                        checked={watchedVoucherTypes?.includes(type) || false}
                        onChange={(e) => handleVoucherTypeChange(type, e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor={type} className="text-sm font-medium">
                        {type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </Label>
                    </div>
                  ))}
                </div>
                {errors.metadata?.voucherTypes && (
                  <p className="text-sm text-red-600">{errors.metadata.voucherTypes.message}</p>
                )}
              </div>
            </VerxioFormSection>

            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creating Collection...' : 'Create Voucher Collection'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </VerxioForm>

      {/* Transaction Result Display */}
      {createdCollection && (
        <div className="mt-8 p-6 bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Collection Created Successfully!</h2>
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
                <p className="font-mono text-sm break-all">{createdCollection.signature}</p>
              </div>
            </div>

            {/* Collection Details */}
            <div className="space-y-4">
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Collection Public Key:</span>
                </p>
                <p className="font-mono text-sm break-all">{createdCollection.collection.publicKey}</p>
                                <p>
                  <span className="font-medium">Collection Secret Key:</span>
                </p>
                <p className="font-mono text-sm break-all">
                  {createdCollection.collection.secretKey}
                </p>
              </div>
            </div>

            {/* Update Authority Details */}
            {createdCollection.updateAuthority && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Update Authority Details</h3>
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">Update Authority Public Key:</span>
                  </p>
                  <p className="font-mono text-sm break-all">{createdCollection.updateAuthority.publicKey}</p>
                                      <p>
                      <span className="font-medium">Update Authority Secret Key:</span>
                    </p>
                    <p className="font-mono text-sm break-all">
                      {createdCollection.updateAuthority.secretKey }
                    </p>
                </div>
              </div>
            )}

            {/* Next Steps */}
            <div className="md:col-span-2 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Next Steps</h3>
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-blue-800">Your voucher collection has been created successfully! You can now:</p>
                <ul className="mt-2 list-disc list-inside text-blue-700">
                  <li>Use the collection address to mint individual vouchers</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 