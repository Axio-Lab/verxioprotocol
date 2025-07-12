'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { giftLoyaltyPoints, VerxioContext } from '@verxioprotocol/core'
import { VerxioForm } from '@/components/verxio/base/VerxioForm'
import { VerxioFormSection } from '@/components/verxio/base/VerxioFormSection'
import { VerxioFormField } from '@/components/verxio/base/VerxioFormField'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { publicKey, KeypairSigner } from '@metaplex-foundation/umi'
import { useState } from 'react'

const formSchema = z.object({
  collectionAddress: z.string().min(1, 'Collection address is required'),
  passAddress: z.string().min(1, 'Pass address is required'),
  pointsToGift: z.number().min(1, 'Points must be at least 1'),
  action: z.string().min(1, 'Action name is required'),
})

type FormData = z.infer<typeof formSchema>

interface GiftLoyaltyPointsResult {
  points: number
  signature: string
  newTier: {
    name: string
    xpRequired: number
    rewards: string[]
  }
}

interface GiftLoyaltyPointsFormProps {
  context: VerxioContext
  signer: KeypairSigner
  onSuccess?: (result: GiftLoyaltyPointsResult) => void
  onError?: (error: Error) => void
}

export default function GiftLoyaltyPointsForm({ 
  context,
  signer,
  onSuccess,
  onError 
}: GiftLoyaltyPointsFormProps) {
  const [giftResult, setGiftResult] = useState<GiftLoyaltyPointsResult | null>(null)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      collectionAddress: '',
      passAddress: '',
      pointsToGift: 0,
      action: '',
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

      // Format data for giftLoyaltyPoints
      const giftData = {
        passAddress: publicKey(data.passAddress),
        pointsToGift: data.pointsToGift,
        signer,
        action: data.action,
      }

      const result = await giftLoyaltyPoints(context, giftData)
      console.log('result', result)
      setGiftResult(result)
      onSuccess?.(result)
      
      // Reset form after successful gifting
      form.reset({
        collectionAddress: '',
        passAddress: '',
        pointsToGift: 0,
        action: '',
      })
    } catch (error) {
      console.error(error)
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while gifting points'
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
            />
          </VerxioFormField>
        </VerxioFormSection>

        <VerxioFormSection
          title=""
          description=""
        >
          <VerxioFormField
            form={form}
            name="passAddress"
            label="Pass Address"
            description="The unique address of the loyalty pass"
          >
            <Input 
              placeholder="Enter the loyalty pass address"
              onChange={(e) => form.setValue('passAddress', e.target.value)}
            />
          </VerxioFormField>
        </VerxioFormSection>

        <VerxioFormSection
          title=""
          description=""
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <VerxioFormField
              form={form}
              name="pointsToGift"
              label="Points to Gift"
              description="Number of points to gift"
            >
              <Input 
                type="number" 
                min={1}
                placeholder="Enter number of points"
                onChange={(e) => form.setValue('pointsToGift', parseInt(e.target.value) || 0)}
              />
            </VerxioFormField>

            <VerxioFormField
              form={form}
              name="action"
              label="Action Name"
              description="Custom action name for the gift (e.g., birthday_bonus)"
            >
              <Input 
                placeholder="e.g., birthday_bonus" 
                onChange={(e) => form.setValue('action', e.target.value)}
              />
            </VerxioFormField>
          </div>
        </VerxioFormSection>

        <div className="flex justify-center pt-8">
          <Button 
            type="submit" 
            disabled={form.formState.isSubmitting}
            className="px-12 py-4 text-lg font-bold bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
          >
            {form.formState.isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Gifting Points...
              </>
            ) : (
              <>
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                  />
                </svg>
                Gift Points
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
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  {form.formState.errors.root.message}
                </div>
              </div>
            </div>
          </div>
        )}
      </VerxioForm>

      {/* Transaction Result Display */}
      {giftResult && (
        <div className="mt-8 p-6 bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Points Gifted Successfully!</h2>
            <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              Transaction Confirmed
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Transaction Details */}
            <div className="space-y-4">
              <div className="space-y-2">
                <p><span className="font-medium">Transaction Signature:</span></p>
                <p className="font-mono text-sm break-all">{giftResult.signature}</p>
              </div>
            </div>

            {/* Points Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Points Details</h3>
              <div className="space-y-2">
                <p><span className="font-medium">New Total Points:</span> {giftResult.points}</p>
                {giftResult.newTier && (
                  <>
                    <p><span className="font-medium">New Tier:</span> {giftResult.newTier.name}</p>
                    <p><span className="font-medium">Tier XP Required:</span> {giftResult.newTier.xpRequired}</p>
                    <div className="mt-2">
                      <p className="font-medium">Tier Rewards:</p>
                      <ul className="list-disc list-inside text-sm text-gray-600">
                        {giftResult.newTier.rewards.map((reward, index) => (
                          <li key={index}>{reward}</li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
