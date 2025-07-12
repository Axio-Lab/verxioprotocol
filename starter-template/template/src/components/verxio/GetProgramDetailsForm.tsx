'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { getProgramDetails, VerxioContext } from '@verxioprotocol/core'
import { VerxioForm } from '@/components/verxio/base/VerxioForm'
import { VerxioFormSection } from '@/components/verxio/base/VerxioFormSection'
import { VerxioFormField } from '@/components/verxio/base/VerxioFormField'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { publicKey } from '@metaplex-foundation/umi'
import { useState } from 'react'

const formSchema = z.object({
  collectionAddress: z.string().min(1, 'Collection address is required'),
})

type FormData = z.infer<typeof formSchema>

interface ProgramDetails {
  name: string
  uri: string
  collectionAddress: string
  updateAuthority: string
  numMinted: number
  creator: string
  metadata: {
    brandColor?: string
    organizationName?: string
  }
  pointsPerAction: Record<string, number>
  tiers: Array<{
    name: string
    xpRequired: number
    rewards: string[]
  }>
  transferAuthority: string
  broadcasts: {
    broadcasts: Array<{
      content: string
      id: string
      read: boolean
      sender: string
      timestamp: number
    }>
    totalBroadcasts: number
  }
}

interface GetProgramDetailsFormProps {
  context: VerxioContext
  onSuccess?: (result: ProgramDetails) => void
  onError?: (error: Error) => void
}

export default function GetProgramDetailsForm({ 
  context,
  onSuccess,
  onError 
}: GetProgramDetailsFormProps) {
  const [programDetails, setProgramDetails] = useState<ProgramDetails | null>(null)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      collectionAddress: '',
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

      context.collectionAddress = publicKey(data.collectionAddress)
      const result = await getProgramDetails(context)
      setProgramDetails(result)
      onSuccess?.(result)

      // Reset form after successful fetching
      form.reset()
    } catch (error) {
      console.error(error)
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while fetching program details'
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
            description="The unique address of the loyalty program collection"
          >
            <Input 
              placeholder="Enter the collection address"
              onChange={(e) => form.setValue('collectionAddress', e.target.value)}
              className="bg-gray-800 border-gray-700 text-gray-100"
            />
          </VerxioFormField>
        </VerxioFormSection>

        <div className="flex justify-center pt-8">
          <Button 
            type="submit" 
            disabled={form.formState.isSubmitting}
            className="px-12 py-4 text-lg font-bold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
          >
            {form.formState.isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Fetching Details...
              </>
            ) : (
              <>
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Get Details
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

      {/* Program Details Display */}
      {programDetails && (
        <div className="mt-8 p-6 bg-gray-800 rounded-xl shadow-lg border border-gray-700">
          <h2 className="text-2xl font-bold mb-6 text-gray-100">{programDetails.name}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-100">Basic Information</h3>
              <div className="space-y-2">
                <p className="text-gray-300"><span className="font-medium">Organization:</span> {programDetails.metadata.organizationName}</p>
                <p className="text-gray-300"><span className="font-medium">Total Minted:</span> {programDetails.numMinted}</p>
                <p className="text-gray-300"><span className="font-medium">Brand Color:</span> 
                  <span className="inline-block w-4 h-4 ml-2 rounded-full" style={{ backgroundColor: programDetails.metadata.brandColor }}></span>
                </p>
              </div>
            </div>

            {/* Points Configuration */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-100">Points Per Action</h3>
              <div className="space-y-2">
                {Object.entries(programDetails.pointsPerAction).map(([action, points]) => (
                  <p key={action} className="text-gray-300">
                    <span className="font-medium capitalize">{action}:</span> {points} points
                  </p>
                ))}
              </div>
            </div>

            {/* Tiers */}
            <div className="md:col-span-2 space-y-4">
              <h3 className="text-lg font-semibold text-gray-100">Loyalty Tiers</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {programDetails.tiers.map((tier) => (
                  <div key={tier.name} className="p-4 bg-gray-700/50 rounded-lg">
                    <h4 className="font-medium text-lg mb-2 text-gray-100">{tier.name}</h4>
                    <p className="text-gray-300 mb-2">Required XP: {tier.xpRequired}</p>
                    <div className="space-y-1">
                      <p className="font-medium text-sm text-gray-200">Rewards:</p>
                      <ul className="list-disc list-inside text-sm text-gray-400">
                        {tier.rewards.map((reward, index) => (
                          <li key={index}>{reward}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Authority Information */}
            <div className="md:col-span-2 space-y-4">
              <h3 className="text-lg font-semibold text-gray-100">Authority Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Update Authority</p>
                  <p className="font-mono text-sm text-gray-300">{programDetails.updateAuthority}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Transfer Authority</p>
                  <p className="font-mono text-sm text-gray-300">{programDetails.transferAuthority}</p>
                </div>
              </div>
            </div>

            {/* Broadcasts */}
            <div className="md:col-span-2 space-y-4">
              <h3 className="text-lg font-semibold text-gray-100">Broadcasts</h3>
              <div className="space-y-4">
                {programDetails.broadcasts.broadcasts.map((broadcast) => (
                  <div key={broadcast.id} className="p-4 bg-gray-700/50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <p className="text-gray-100">{broadcast.content}</p>
                        <p className="text-sm text-gray-400">
                          From: {broadcast.sender}
                        </p>
                        <p className="text-sm text-gray-400">
                          {new Date(broadcast.timestamp).toLocaleString()}
                        </p>
                      </div>
                      {!broadcast.read && (
                        <span className="px-2 py-1 text-xs font-medium text-blue-200 bg-blue-900/50 rounded-full">
                          New
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {programDetails.broadcasts.broadcasts.length === 0 && (
                  <p className="text-gray-400 text-center py-4">No broadcasts yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
