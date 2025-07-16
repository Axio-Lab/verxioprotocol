'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { issueLoyaltyPass, VerxioContext } from '@verxioprotocol/core'
import { VerxioForm } from './base/VerxioForm'
import { VerxioFormSection } from './base/VerxioFormSection'
import { VerxioFormField } from './base/VerxioFormField'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { generateSigner, publicKey, KeypairSigner } from '@metaplex-foundation/umi'
import { Upload, Link } from 'lucide-react'
import { useState } from 'react'

const formSchema = z.object({
  collectionAddress: z.string().min(1, 'Collection address is required'),
  recipientAddress: z.string().min(1, 'Recipient address is required'),
  passName: z.string().min(1, 'Pass name is required'),
  organizationName: z.string().min(1, 'Organization name is required'),
  passMetadataUri: z.string().optional(),
  imageBuffer: z.any().optional(),
  imageFilename: z.string().optional(),
  imageContentType: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

interface IssueLoyaltyPassResult {
  asset: KeypairSigner
  signature: string
}

interface IssueLoyaltyPassFormProps {
  context: VerxioContext
  signer: KeypairSigner
  onSuccess?: (result: IssueLoyaltyPassResult) => void
  onError?: (error: Error) => void
}

export default function IssueLoyaltyPassForm({ context, signer, onSuccess, onError }: IssueLoyaltyPassFormProps) {
  const [issuedPass, setIssuedPass] = useState<IssueLoyaltyPassResult | null>(null)
  const [uploadMethod, setUploadMethod] = useState<'uri' | 'image'>('uri')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      collectionAddress: '',
      recipientAddress: '',
      passName: '',
      organizationName: '',
      passMetadataUri: '',
    },
  })

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      form.setValue('imageFilename', file.name)
      form.setValue('imageContentType', file.type)
    }
  }

  const onSubmit = async (data: FormData) => {
    try {
      // Debug form validation
      const validationResult = formSchema.safeParse(data)
      if (!validationResult.success) {
        console.error('Validation errors:', validationResult.error.format())
        form.setError('root', {
          message: 'Please check all required fields are filled correctly',
        })
        return
      }

      // Prepare the request payload
      const payload: any = {
        collectionAddress: data.collectionAddress,
        recipientAddress: data.recipientAddress,
        passName: data.passName,
        organizationName: data.organizationName,
      }

      // Add metadata based on upload method
      if (uploadMethod === 'uri' && data.passMetadataUri) {
        payload.passMetadataUri = data.passMetadataUri
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
      const response = await fetch('/api/issue-loyalty-pass', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to issue loyalty pass')
      }

      const result = await response.json()
      setIssuedPass(result)
      onSuccess?.(result)

      // Reset form after successful issuance
      form.reset()
    } catch (error) {
      console.error(error)
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while issuing the loyalty pass'
      form.setError('root', { message: errorMessage })
      onError?.(error instanceof Error ? error : new Error(errorMessage))
    }
  }

  return (
    <div className="space-y-8">
      <VerxioForm form={form} onSubmit={onSubmit} className="space-y-8">
        <VerxioFormSection title="Program Information" description="Specify the loyalty program collection">
          <VerxioFormField
            form={form}
            name="collectionAddress"
            label="Collection Address"
            description="The address of the loyalty program collection"
          >
            <Input
              placeholder="Enter the collection address"
              onChange={(e) => form.setValue('collectionAddress', e.target.value)}
            />
          </VerxioFormField>
        </VerxioFormSection>

        <VerxioFormSection title="Pass Details" description="Configure the new loyalty pass details">
          <div className="space-y-6">
            <VerxioFormField
              form={form}
              name="recipientAddress"
              label="Recipient Address"
              description="The wallet address that will receive the loyalty pass"
            >
              <Input
                placeholder="Enter the wallet address of the recipient"
                onChange={(e) => form.setValue('recipientAddress', e.target.value)}
              />
            </VerxioFormField>

            <VerxioFormField form={form} name="passName" label="Pass Name" description="Name of the loyalty pass">
              <Input
                placeholder="e.g., Coffee Rewards Pass"
                onChange={(e) => form.setValue('passName', e.target.value)}
              />
            </VerxioFormField>

            <VerxioFormField
              form={form}
              name="organizationName"
              label="Organization Name"
              description="Your organization's name"
            >
              <Input
                placeholder="e.g., Coffee Brew Co."
                onChange={(e) => form.setValue('organizationName', e.target.value)}
              />
            </VerxioFormField>
          </div>
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
              <VerxioFormField
                form={form}
                name="passMetadataUri"
                label="Metadata URI"
                description="URI containing the pass metadata"
              >
                <Input
                  placeholder="https://arweave.net/..."
                  onChange={(e) => form.setValue('passMetadataUri', e.target.value)}
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
              <div className="space-y-2">
                <label className="text-sm font-medium">Pass Image</label>
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
              </div>
              <Alert>
                <AlertDescription>
                  Upload an image file. The protocol will automatically upload it to Irys and
                  generate metadata.
                </AlertDescription>
              </Alert>
            </TabsContent>
          </Tabs>
        </VerxioFormSection>

        <div className="flex justify-center pt-8">
          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="px-12 py-4 text-lg font-bold bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
          >
            {form.formState.isSubmitting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Issuing Pass...
              </>
            ) : (
              <>
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
                Issue Pass
              </>
            )}
          </Button>
        </div>

        {/* Error Display */}
        {form.formState.errors.root && (
          <div className="rounded-lg bg-red-50 p-4 mt-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">{form.formState.errors.root.message}</div>
              </div>
            </div>
          </div>
        )}
      </VerxioForm>

      {/* Transaction Result Display */}
      {issuedPass && (
        <div className="mt-8 p-6 bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Pass Issued Successfully!</h2>
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
                <p className="font-mono text-sm break-all">{issuedPass.signature}</p>
              </div>
            </div>

            {/* Pass Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Pass Details</h3>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Pass Public Key:</span>
                </p>
                <p className="font-mono text-sm break-all">{issuedPass.asset.publicKey}</p>
              </div>
            </div>

            {/* Next Steps */}
            <div className="md:col-span-2 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Next Steps</h3>
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-blue-800">Your loyalty pass has been issued successfully! You can now:</p>
                <ul className="mt-2 list-disc list-inside text-blue-700">
                  <li>View pass details using the GetAssetData</li>
                  <li>Transfer the pass to another wallet if needed</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
