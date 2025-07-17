'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { VerxioForm, VerxioFormSection, VerxioFormField } from './base/VerxioForm'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card, CardContent, CardDescription, CardHeader } from '../ui/card'
import { Badge } from '../ui/badge'
import { CheckCircle, DollarSign, ShoppingCart } from 'lucide-react'

const redeemVoucherSchema = z.object({
  voucherAddress: z.string().min(1, 'Voucher address is required'),
  merchantId: z.string().min(1, 'Merchant ID is required'),
  redemptionAmount: z.number().optional(),
})

type RedeemVoucherFormData = z.infer<typeof redeemVoucherSchema>

interface RedeemVoucherFormProps {
  onSuccess?: (result: any) => void
  onError?: (error: any) => void
}

export default function RedeemVoucherForm({ onSuccess, onError }: RedeemVoucherFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [redemptionResult, setRedemptionResult] = useState<any>(null)

  const form = useForm<RedeemVoucherFormData>({
    resolver: zodResolver(redeemVoucherSchema),
    defaultValues: {
      voucherAddress: '',
      merchantId: '',
      redemptionAmount: undefined,
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form

  const onSubmit = async (data: RedeemVoucherFormData) => {
    setIsLoading(true)
    try {
      // Prepare the request payload
      const payload: any = {
        voucherAddress: data.voucherAddress,
        merchantId: data.merchantId,
      }

      if (data.redemptionAmount) {
        payload.redemptionAmount = data.redemptionAmount
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
            Redeem a voucher for its value. This performs comprehensive validation (merchant ID, expiry, usage limits,
            conditions) and executes the redemption with complete history tracking.
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

            <VerxioFormField label="Redemption Amount">
              <Input type="number" {...register('redemptionAmount', { valueAsNumber: true })} placeholder="100" />
              <p className="text-sm text-gray-500 mt-1">
                Required for percentage-based vouchers to calculate redemption value
              </p>
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
                        <span className="font-medium">Type:</span>{' '}
                        {redemptionResult.updatedVoucher.type.replace('_', ' ')}
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
                        <span className="font-medium">Merchant:</span> {redemptionResult.updatedVoucher.merchantId}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Description:</span> {redemptionResult.updatedVoucher.description}
                    </div>

                    {redemptionResult.updatedVoucher.redemptionHistory &&
                      redemptionResult.updatedVoucher.redemptionHistory.length > 0 && (
                        <div className="mt-4">
                          <h5 className="font-medium text-sm mb-2">Redemption History</h5>
                          <div className="space-y-2">
                            {redemptionResult.updatedVoucher.redemptionHistory.map((redemption: any, index: number) => (
                              <div key={index} className="bg-white p-2 rounded border text-xs">
                                <div className="flex justify-between">
                                  <span>Redemption #{index + 1}</span>
                                  <span>{new Date(redemption.timestamp).toLocaleDateString()}</span>
                                </div>
                                <div>Value: {redemption.redemptionValue}</div>
                                {redemption.transactionId && <div>Transaction: {redemption.transactionId}</div>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
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
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-blue-800">Transaction Signature</span>
                    </div>
                    <div className="bg-white p-3 rounded border border-blue-200">
                      <code className="text-xs text-blue-700 break-all font-mono">{redemptionResult.signature}</code>
                    </div>
                    <p className="text-xs text-blue-600 mt-2">This voucher has been redeemed!</p>
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
