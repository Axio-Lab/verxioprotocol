'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { redeemVoucher } from '@verxioprotocol/core'
import { publicKey, generateSigner } from '@metaplex-foundation/umi'
import { VerxioForm, VerxioFormSection, VerxioFormField } from './base/VerxioForm'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Alert, AlertDescription } from '../ui/alert'
import { Badge } from '../ui/badge'
import { CheckCircle, DollarSign, ShoppingCart } from 'lucide-react'

const redeemVoucherSchema = z.object({
  voucherAddress: z.string().min(1, 'Voucher address is required'),
  merchantId: z.string().min(1, 'Merchant ID is required'),
  purchaseAmount: z.number().optional(),
  redemptionDetails: z
    .object({
      transactionId: z.string().optional(),
      items: z.string().optional(),
      totalAmount: z.number().optional(),
      discountApplied: z.number().optional(),
    })
    .optional(),
})

type RedeemVoucherFormData = z.infer<typeof redeemVoucherSchema>

interface RedeemVoucherFormProps {
  context: any
  signer: any
  onSuccess?: (result: any) => void
  onError?: (error: any) => void
}

export default function RedeemVoucherForm({ context, signer, onSuccess, onError }: RedeemVoucherFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [redemptionResult, setRedemptionResult] = useState<any>(null)

  const form = useForm<RedeemVoucherFormData>({
    resolver: zodResolver(redeemVoucherSchema),
    defaultValues: {
      voucherAddress: '',
      merchantId: '',
      purchaseAmount: undefined,
      redemptionDetails: {
        transactionId: '',
        items: '',
        totalAmount: undefined,
        discountApplied: undefined,
      },
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = form

  const onSubmit = async (data: RedeemVoucherFormData) => {
    setIsLoading(true)
    try {
      // Prepare the request payload
      const payload: any = {
        voucherAddress: data.voucherAddress,
        merchantId: data.merchantId,
      }

      if (data.purchaseAmount) {
        payload.purchaseAmount = data.purchaseAmount
      }

      if (data.redemptionDetails) {
        payload.redemptionDetails = data.redemptionDetails
      }

      // Call the backend API
      const response = await fetch('/api/redeem-voucher', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to redeem voucher')
      }

      const result = await response.json()
      setRedemptionResult(result.result)
      onSuccess?.(result.result)
    } catch (error) {
      console.error('Error redeeming voucher:', error)
      onError?.(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <VerxioForm form={form} onSubmit={onSubmit}>
      <Card>
        <CardHeader>
          <CardDescription>
            Redeem a voucher for its value. This will mark the voucher as used and update its usage count.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <VerxioFormSection title="Voucher Information">
            <VerxioFormField label="Voucher Address" error={errors.voucherAddress?.message}>
              <Input {...register('voucherAddress')} placeholder="Voucher public key" />
            </VerxioFormField>

            <VerxioFormField label="Merchant ID" error={errors.merchantId?.message}>
              <Input {...register('merchantId')} placeholder="coffee_brew_merchant_001" />
            </VerxioFormField>

            <VerxioFormField label="Purchase Amount (Optional)">
              <Input type="number" {...register('purchaseAmount', { valueAsNumber: true })} placeholder="100" />
              <p className="text-sm text-gray-500 mt-1">
                Required for percentage-based vouchers to calculate redemption value
              </p>
            </VerxioFormField>
          </VerxioFormSection>

          <VerxioFormSection title="Redemption Details (Optional)">
            <VerxioFormField label="Transaction ID">
              <Input {...register('redemptionDetails.transactionId')} placeholder="tx_123456" />
            </VerxioFormField>

            <VerxioFormField label="Items Purchased">
              <Textarea {...register('redemptionDetails.items')} placeholder="Coffee, Pastry, Sandwich" rows={2} />
            </VerxioFormField>

            <VerxioFormField label="Total Amount">
              <Input
                type="number"
                {...register('redemptionDetails.totalAmount', { valueAsNumber: true })}
                placeholder="150"
              />
            </VerxioFormField>

            <VerxioFormField label="Discount Applied">
              <Input
                type="number"
                {...register('redemptionDetails.discountApplied', { valueAsNumber: true })}
                placeholder="25"
              />
            </VerxioFormField>
          </VerxioFormSection>

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Redeeming...' : 'Redeem Voucher'}
            </Button>
          </div>

          {redemptionResult && (
            <VerxioFormSection title="Redemption Results">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  {redemptionResult.success ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <CheckCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span className="font-medium">
                    Status: {redemptionResult.success ? 'Successfully Redeemed' : 'Redemption Failed'}
                  </span>
                  <Badge variant={redemptionResult.success ? 'default' : 'destructive'}>
                    {redemptionResult.success ? 'REDEEMED' : 'FAILED'}
                  </Badge>
                </div>

                {redemptionResult.redemptionValue && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-800">
                        Redemption Value: {redemptionResult.redemptionValue} credits
                      </span>
                    </div>
                  </div>
                )}

                {redemptionResult.updatedVoucher && (
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <h4 className="font-medium">Updated Voucher Details</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-medium">Type:</span> {redemptionResult.updatedVoucher.type}
                      </div>
                      <div>
                        <span className="font-medium">Value:</span> {redemptionResult.updatedVoucher.value}
                      </div>
                      <div>
                        <span className="font-medium">Current Uses:</span> {redemptionResult.updatedVoucher.currentUses}
                      </div>
                      <div>
                        <span className="font-medium">Max Uses:</span> {redemptionResult.updatedVoucher.maxUses}
                      </div>
                      <div>
                        <span className="font-medium">Status:</span> {redemptionResult.updatedVoucher.status}
                      </div>
                      <div>
                        <span className="font-medium">Merchant ID:</span> {redemptionResult.updatedVoucher.merchantId}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Description:</span> {redemptionResult.updatedVoucher.description}
                    </div>
                  </div>
                )}

                {redemptionResult.errors && redemptionResult.errors.length > 0 && (
                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-red-600" />
                      <span className="font-medium text-red-800">Redemption Errors</span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                      {redemptionResult.errors.map((error: string, index: number) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {redemptionResult.signature && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-800">
                        Transaction Signature: {redemptionResult.signature}
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
