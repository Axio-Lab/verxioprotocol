'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { cancelVoucher } from '@verxioprotocol/core'
import { publicKey, generateSigner } from '@metaplex-foundation/umi'
import { VerxioForm, VerxioFormSection, VerxioFormField } from './base/VerxioForm'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Alert, AlertDescription } from '../ui/alert'
import { Badge } from '../ui/badge'
import { XCircle, AlertTriangle, CheckCircle } from 'lucide-react'

const cancelVoucherSchema = z.object({
  voucherAddress: z.string().min(1, 'Voucher address is required'),
  reason: z.string().min(1, 'Reason is required'),
})

type CancelVoucherFormData = z.infer<typeof cancelVoucherSchema>

interface CancelVoucherFormProps {
  context: any
  signer: any
  onSuccess?: (result: any) => void
  onError?: (error: any) => void
}

export default function CancelVoucherForm({ context, signer, onSuccess, onError }: CancelVoucherFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [cancellationResult, setCancellationResult] = useState<any>(null)

  const form = useForm<CancelVoucherFormData>({
    resolver: zodResolver(cancelVoucherSchema),
    defaultValues: {
      voucherAddress: '',
      reason: '',
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = form

  const onSubmit = async (data: CancelVoucherFormData) => {
    setIsLoading(true)
    try {
      // Prepare the request payload
      const payload = {
        voucherAddress: data.voucherAddress,
        reason: data.reason,
      }

      // Call the backend API
      const response = await fetch('/api/cancel-voucher', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to cancel voucher')
      }

      const result = await response.json()
      setCancellationResult(result.result)
      onSuccess?.(result.result)
    } catch (error) {
      console.error('Error canceling voucher:', error)
      onError?.(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <VerxioForm form={form} onSubmit={onSubmit}>
      <Card>
        <CardHeader>
          <CardDescription>Cancel a voucher with a reason for tracking. This action cannot be undone.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Warning:</strong> Canceling a voucher will permanently disable it. This action cannot be undone
              and the voucher will no longer be redeemable.
            </AlertDescription>
          </Alert>

          <VerxioFormSection title="Voucher Information">
            <VerxioFormField label="Voucher Address" error={errors.voucherAddress?.message}>
              <Input {...register('voucherAddress')} placeholder="Voucher public key" />
            </VerxioFormField>
          </VerxioFormSection>

          <VerxioFormSection title="Cancellation Details">
            <VerxioFormField label="Reason for Cancellation" error={errors.reason?.message}>
              <Textarea
                {...register('reason')}
                placeholder="Customer refund, merchant request, technical issue, etc."
                rows={4}
              />
              <p className="text-sm text-gray-500 mt-1">
                Provide a detailed reason for canceling the voucher (required for audit tracking)
              </p>
            </VerxioFormField>
          </VerxioFormSection>

          <Alert>
            <AlertDescription>
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4" />
                <span>
                  Canceling a voucher will mark it as cancelled and prevent any future redemptions. This action is
                  tracked for audit and compliance purposes.
                </span>
              </div>
            </AlertDescription>
          </Alert>

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading} variant="destructive">
              {isLoading ? 'Canceling Voucher...' : 'Cancel Voucher'}
            </Button>
          </div>

          {cancellationResult && (
            <VerxioFormSection title="Cancellation Results">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="font-medium">Voucher Cancelled Successfully</span>
                  <Badge variant="destructive">CANCELLED</Badge>
                </div>

                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <span className="font-medium text-red-800">Cancellation Status</span>
                  </div>
                  <div className="text-sm text-red-700">
                    The voucher has been permanently cancelled and is no longer redeemable.
                  </div>
                </div>

                {cancellationResult.updatedVoucher && (
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <h4 className="font-medium">Updated Voucher Details</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-medium">Type:</span> {cancellationResult.updatedVoucher.type}
                      </div>
                      <div>
                        <span className="font-medium">Value:</span> {cancellationResult.updatedVoucher.value}
                      </div>
                      <div>
                        <span className="font-medium">Current Uses:</span>{' '}
                        {cancellationResult.updatedVoucher.currentUses}
                      </div>
                      <div>
                        <span className="font-medium">Max Uses:</span> {cancellationResult.updatedVoucher.maxUses}
                      </div>
                      <div>
                        <span className="font-medium">Status:</span> {cancellationResult.updatedVoucher.status}
                      </div>
                      <div>
                        <span className="font-medium">Merchant ID:</span> {cancellationResult.updatedVoucher.merchantId}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Description:</span> {cancellationResult.updatedVoucher.description}
                    </div>
                  </div>
                )}

                {cancellationResult.signature && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-800">
                        Transaction Signature: {cancellationResult.signature}
                      </span>
                    </div>
                  </div>
                )}

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="font-medium text-yellow-800">Important Note</span>
                  </div>
                  <div className="text-sm text-yellow-700 mt-1">
                    The voucher cancellation has been recorded on the blockchain. The voucher is now permanently
                    disabled and cannot be reactivated or redeemed.
                  </div>
                </div>
              </div>
            </VerxioFormSection>
          )}
        </CardContent>
      </Card>
    </VerxioForm>
  )
}
