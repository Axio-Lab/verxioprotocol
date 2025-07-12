'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { issueLoyaltyPass, VerxioContext } from '@verxioprotocol/core'
import { VerxioForm } from '@/components/verxio/base/VerxioForm'
import { VerxioFormSection } from '@/components/verxio/base/VerxioFormSection'
import { VerxioFormField } from '@/components/verxio/base/VerxioFormField'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { generateSigner, publicKey, KeypairSigner } from '@metaplex-foundation/umi'
import { useState } from 'react'

const formSchema = z.object({
  collectionAddress: z.string().min(1, 'Collection address is required'),
  recipientAddress: z.string().min(1, 'Recipient address is required'),
  passName: z.string().min(1, 'Pass name is required'),
  passMetadataUri: z.string().url('Must be a valid URL'),
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

export default function IssueLoyaltyPassForm({ 
  context,
  signer,
  onSuccess,
  onError 
}: IssueLoyaltyPassFormProps) {
  const [issuedPass, setIssuedPass] = useState<IssueLoyaltyPassResult | null>(null)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      collectionAddress: '',
      recipientAddress: '',
      passName: '',
      passMetadataUri: '',
    },
  })

  const onSubmit = async (data: FormData) => {
    try {
      // Debug form validation
      const validationResult = formSchema.safeParse(data)
      if (!validationResult.success) {
        console.error('Validation errors:', validationResult.error.format())
        form.setError('root', { 
          message: 'Please check all required fields are filled correctly' 
        })
        return
      }

      // Format data for issueLoyaltyPass
      const passData = {
        collectionAddress: publicKey(data.collectionAddress),
        recipient: publicKey(data.recipientAddress),
        passName: data.passName,
        passMetadataUri: data.passMetadataUri,
        assetSigner: generateSigner(context.umi),
        updateAuthority: signer,
      }

      const result = await issueLoyaltyPass(context, passData)
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
        <VerxioFormSection
          title=""
          description=""
        >
          <VerxioFormField
            form={form}
            name="collectionAddress"
            label="Collection Address"
            description="The address of the loyalty program collection"
          >
            <Input 
              placeholder="Enter the collection address"
              onChange={(e) => form.setValue('collectionAddress', e.target.value)}
              className="bg-gray-800 border-gray-700 text-gray-100"
            />
          </VerxioFormField>
        </VerxioFormSection>

        <VerxioFormSection
          title=""
          description=""
        >
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
                className="bg-gray-800 border-gray-700 text-gray-100"
              />
            </VerxioFormField>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <VerxioFormField
                form={form}
                name="passName"
                label="Pass Name"
                description="Name of the loyalty pass"
              >
                <Input 
                  placeholder="e.g., Coffee Rewards Pass"
                  onChange={(e) => form.setValue('passName', e.target.value)}
                  className="bg-gray-800 border-gray-700 text-gray-100"
                />
              </VerxioFormField>

              <VerxioFormField
                form={form}
                name="passMetadataUri"
                label="Metadata URI"
                description="URI containing the pass metadata"
              >
                <Input 
                  placeholder="https://arweave.net/..."
                  onChange={(e) => form.setValue('passMetadataUri', e.target.value)}
                  className="bg-gray-800 border-gray-700 text-gray-100"
                />
              </VerxioFormField>
            </div>
          </div>
        </VerxioFormSection>

        <div className="flex justify-center pt-8">
          <Button 
            type="submit" 
            disabled={form.formState.isSubmitting}
            className="px-12 py-4 text-lg font-bold bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
          >
            {form.formState.isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Issuing Pass...
              </>
            ) : (
              <>
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Issue Pass
              </>
            )}
          </Button>
        </div>

        {/* Error Display */}
        {form.formState.errors.root && (
          <div className="rounded-lg bg-red-900/50 p-4 mt-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-200">Error</h3>
                <div className="mt-2 text-sm text-red-300">
                  {form.formState.errors.root.message}
                </div>
              </div>
            </div>
          </div>
        )}
      </VerxioForm>

      {/* Transaction Result Display */}
      {issuedPass && (
        <div className="mt-8 p-6 bg-gray-800 rounded-xl shadow-lg border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-100">Pass Issued Successfully!</h2>
            <div className="px-3 py-1 bg-green-900/50 text-green-200 rounded-full text-sm font-medium">
              Transaction Confirmed
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Transaction Details */}
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-gray-300"><span className="font-medium">Transaction Signature:</span></p>
                <p className="font-mono text-sm break-all text-gray-400">{issuedPass.signature}</p>
              </div>
            </div>

            {/* Pass Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-100">Pass Details</h3>
              <div className="space-y-2">
                <p className="text-gray-300"><span className="font-medium">Pass Public Key:</span></p>
                <p className="font-mono text-sm break-all text-gray-400">{issuedPass.asset.publicKey}</p>
              </div>
            </div>

            {/* Next Steps */}
            <div className="md:col-span-2 space-y-4">
              <h3 className="text-lg font-semibold text-gray-100">Next Steps</h3>
              <div className="p-4 bg-blue-900/50 rounded-lg">
                <p className="text-blue-200">
                  Your loyalty pass has been issued successfully! You can now:
                </p>
                <ul className="mt-2 list-disc list-inside text-blue-300">
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
