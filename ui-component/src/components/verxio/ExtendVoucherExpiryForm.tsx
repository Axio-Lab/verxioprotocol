'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { extendVoucherExpiry } from '@verxioprotocol/core'
import { publicKey, generateSigner } from '@metaplex-foundation/umi'
import { VerxioForm, VerxioFormSection, VerxioFormField } from './base/VerxioForm'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Alert, AlertDescription } from '../ui/alert'
import { Badge } from '../ui/badge'
import { Calendar, Clock, CheckCircle } from 'lucide-react'

const extendVoucherExpirySchema = z.object({
  voucherAddress: z.string().min(1, 'Voucher address is required'),
  newExpiryDate: z.string().min(1, 'New expiry date is required'),
  reason: z.string().min(1, 'Reason is required'),
})

type ExtendVoucherExpiryFormData = z.infer<typeof extendVoucherExpirySchema>

interface ExtendVoucherExpiryFormProps {
  context: any
  signer: any
  onSuccess?: (result: any) => void
  onError?: (error: any) => void
}

export default function ExtendVoucherExpiryForm({ context, signer, onSuccess, onError }: ExtendVoucherExpiryFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [extensionResult, setExtensionResult] = useState<any>(null)

  const form = useForm<ExtendVoucherExpiryFormData>({
    resolver: zodResolver(extendVoucherExpirySchema),
    defaultValues: {
      voucherAddress: '',
      newExpiryDate: '',
      reason: '',
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = form

  const onSubmit = async (data: ExtendVoucherExpiryFormData) => {
    setIsLoading(true)
    try {
      // Prepare the request payload
      const payload = {
        voucherAddress: data.voucherAddress,
        newExpiryDate: data.newExpiryDate,
        reason: data.reason,
      }

      // Call the backend API
      const response = await fetch('/api/extend-voucher-expiry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to extend voucher expiry')
      }

      const result = await response.json()
      setExtensionResult(result.result)
      onSuccess?.(result.result)
    } catch (error) {
      console.error('Error extending voucher expiry:', error)
      onError?.(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <VerxioForm form={form} onSubmit={onSubmit}>
      <Card>
        <CardHeader>
          <CardDescription>Extend the expiration date of a voucher with a reason for tracking.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <VerxioFormSection title="Voucher Information">
            <VerxioFormField label="Voucher Address" error={errors.voucherAddress?.message}>
              <Input {...register('voucherAddress')} placeholder="Voucher public key" />
            </VerxioFormField>
          </VerxioFormSection>

          <VerxioFormSection title="Extension Details">
            <VerxioFormField label="New Expiry Date" error={errors.newExpiryDate?.message}>
              <Input type="datetime-local" {...register('newExpiryDate')} />
              <p className="text-sm text-gray-500 mt-1">Select a new expiration date and time for the voucher</p>
            </VerxioFormField>

            <VerxioFormField label="Reason for Extension" error={errors.reason?.message}>
              <Textarea {...register('reason')} placeholder="Customer request, technical issue, etc." rows={3} />
              <p className="text-sm text-gray-500 mt-1">
                Provide a reason for extending the voucher expiry (required for tracking)
              </p>
            </VerxioFormField>
          </VerxioFormSection>

          <Alert>
            <AlertDescription>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>
                  Extending voucher expiry will update the voucher's expiration date. This action is tracked for audit
                  purposes.
                </span>
              </div>
            </AlertDescription>
          </Alert>

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Extending Expiry...' : 'Extend Voucher Expiry'}
            </Button>
          </div>

          {extensionResult && (
            <VerxioFormSection title="Extension Results">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="font-medium">Voucher Expiry Extended Successfully</span>
                  <Badge variant="default">EXTENDED</Badge>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-800">New Expiry Date</span>
                  </div>
                  <div className="text-sm text-green-700">
                    {new Date(extensionResult.newExpiryDate).toLocaleString()}
                  </div>
                </div>

                {extensionResult.previousExpiryDate && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-gray-600" />
                      <span className="font-medium text-gray-800">Previous Expiry Date</span>
                    </div>
                    <div className="text-sm text-gray-700">
                      {new Date(extensionResult.previousExpiryDate).toLocaleString()}
                    </div>
                  </div>
                )}

                {extensionResult.updatedVoucher && (
                  <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                    <h4 className="font-medium text-blue-800">Updated Voucher Details</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm text-blue-700">
                      <div>
                        <span className="font-medium">Type:</span> {extensionResult.updatedVoucher.type}
                      </div>
                      <div>
                        <span className="font-medium">Value:</span> {extensionResult.updatedVoucher.value}
                      </div>
                      <div>
                        <span className="font-medium">Current Uses:</span> {extensionResult.updatedVoucher.currentUses}
                      </div>
                      <div>
                        <span className="font-medium">Max Uses:</span> {extensionResult.updatedVoucher.maxUses}
                      </div>
                      <div>
                        <span className="font-medium">Status:</span> {extensionResult.updatedVoucher.status}
                      </div>
                      <div>
                        <span className="font-medium">Merchant ID:</span> {extensionResult.updatedVoucher.merchantId}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Description:</span> {extensionResult.updatedVoucher.description}
                    </div>
                  </div>
                )}

                {extensionResult.signature && (
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-purple-600" />
                      <span className="font-medium text-purple-800">
                        Transaction Signature: {extensionResult.signature}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </VerxioFormSection>
          )}
        </CardContent>
      </Card>
    </VerxioForm>
  )
}
