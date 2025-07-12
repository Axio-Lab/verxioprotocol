'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { sendBroadcast, VerxioContext } from '@verxioprotocol/core'
import { VerxioForm } from './base/VerxioForm'
import { VerxioFormSection } from './base/VerxioFormSection'
import { VerxioFormField } from './base/VerxioFormField'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { publicKey, KeypairSigner } from '@metaplex-foundation/umi'
import { useState } from 'react'

const formSchema = z.object({
  collectionAddress: z.string().min(1, 'Collection address is required'),
  message: z.string().min(1, 'Message is required').max(500, 'Message must be less than 500 characters'),
})

type FormData = z.infer<typeof formSchema>

interface BroadcastResult {
  signature: string
}

interface BroadcastsFormProps {
  context: VerxioContext
  signer: KeypairSigner
  onSuccess?: (result: BroadcastResult) => void
  onError?: (error: Error) => void
}

export default function BroadcastsForm({ context, signer, onSuccess, onError }: BroadcastsFormProps) {
  const [broadcastResult, setBroadcastResult] = useState<BroadcastResult | null>(null)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      collectionAddress: '',
      message: '',
    },
  })

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

      // Format data for sendBroadcast
      const broadcastData = {
        collectionAddress: publicKey(data.collectionAddress),
        message: data.message,
        sender: context.programAuthority,
        signer,
      }

      const result = await sendBroadcast(context, broadcastData)
      setBroadcastResult(result)
      onSuccess?.(result)
      // Reset form after successful broadcast
      form.reset({
        collectionAddress: '',
        message: '',
      })
    } catch (error) {
      console.error(error)
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while sending the broadcast'
      form.setError('root', { message: errorMessage })
      onError?.(error instanceof Error ? error : new Error(errorMessage))
    }
  }

  return (
    <div className="space-y-8">
      <VerxioForm form={form} onSubmit={onSubmit} className="space-y-8">
        <VerxioFormSection title="Program Information" description="Specify the program for the broadcast">
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

        <VerxioFormSection title="Broadcast Message" description="Compose your message to all pass holders">
          <VerxioFormField
            form={form}
            name="message"
            label="Message Content"
            description="The message to broadcast to all pass holders (max 500 characters)"
          >
            <textarea
              className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Enter your broadcast message..."
              value={form.watch('message')}
              onChange={(e) => form.setValue('message', e.target.value)}
              maxLength={500}
            />
          </VerxioFormField>
        </VerxioFormSection>

        <div className="flex justify-center pt-8">
          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="px-12 py-4 text-lg font-bold bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600"
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
                Sending Broadcast...
              </>
            ) : (
              <>
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
                  />
                </svg>
                Send Broadcast
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
      {broadcastResult && (
        <div className="mt-8 p-6 bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Broadcast Sent Successfully!</h2>
            <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              Transaction Confirmed
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <p>
                <span className="font-medium">Transaction Signature:</span>
              </p>
              <p className="font-mono text-sm break-all">{broadcastResult.signature}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
