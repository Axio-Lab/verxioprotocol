'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { VerxioForm } from './base/VerxioForm'
import { VerxioFormSection } from './base/VerxioFormSection'
import { VerxioFormField } from './base/VerxioFormField'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

const formSchema = z.object({
  collectionAddress: z.string().min(1, 'Collection address is required'),
  passAddress: z.string().min(1, 'Pass address is required'),
  newOwner: z.string().min(1, 'New owner address is required'),
})

type FormData = z.infer<typeof formSchema>

interface ApproveTransferFormProps {
  onError?: (error: Error) => void
}

export default function ApproveTransferForm({ onError }: ApproveTransferFormProps) {
  const [isSuccess, setIsSuccess] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      collectionAddress: '',
      passAddress: '',
      newOwner: '',
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

      // Prepare the request payload
      const payload = {
        collectionAddress: data.collectionAddress,
        passAddress: data.passAddress,
        newOwner: data.newOwner,
      }

      // Call the backend API
      const response = await fetch('/api/approve-transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to approve transfer')
      }

      const result = await response.json()
      setIsSuccess(true)

      // Reset form after successful approval
      form.reset({
        collectionAddress: '',
        passAddress: '',
        newOwner: '',
      })
    } catch (error) {
      console.error(error)
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while approving transfer'
      form.setError('root', { message: errorMessage })
      onError?.(error instanceof Error ? error : new Error(errorMessage))
    }
  }

  return (
    <div className="space-y-8">
      <VerxioForm form={form} onSubmit={onSubmit} className="space-y-8">
        <VerxioFormSection title="Transfer Information" description="Enter the details of the loyalty pass transfer">
          <div className="space-y-6">
            <VerxioFormField
              form={form}
              name="collectionAddress"
              label="Collection Address"
              description="The address of the voucher or pass collection"
            >
              <Input
                placeholder="Enter the collection address"
                onChange={(e) => form.setValue('collectionAddress', e.target.value)}
              />
            </VerxioFormField>
            <VerxioFormField
              form={form}
              name="passAddress"
              label="Pass Address"
              description="The unique address of the loyalty pass being transferred"
            >
              <Input
                placeholder="Enter the loyalty pass address to transfer"
                onChange={(e) => form.setValue('passAddress', e.target.value)}
              />
            </VerxioFormField>

            <VerxioFormField
              form={form}
              name="newOwner"
              label="New Owner Address"
              description="The wallet address that will receive the loyalty pass"
            >
              <Input
                placeholder="Enter the new owner's wallet address"
                onChange={(e) => form.setValue('newOwner', e.target.value)}
              />
            </VerxioFormField>
          </div>
        </VerxioFormSection>

        <div className="flex justify-center pt-8">
          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="px-12 py-4 text-lg font-bold bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600"
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
                Approving Transfer...
              </>
            ) : (
              <>
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Approve Transfer
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
      {isSuccess && (
        <div className="mt-8 p-6 bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Transfer Approved Successfully!</h2>
            <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              Transaction Confirmed
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
