'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { validateVoucher } from '@verxioprotocol/core'
import { publicKey } from '@metaplex-foundation/umi'
import { VerxioForm, VerxioFormSection, VerxioFormField } from './base/VerxioForm'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Alert, AlertDescription } from '../ui/alert'
import { Badge } from '../ui/badge'
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react'

const validateVoucherSchema = z.object({
  voucherAddress: z.string().min(1, 'Voucher address is required'),
  merchantId: z.string().min(1, 'Merchant ID is required'),
  purchaseAmount: z.number().optional(),
})

type ValidateVoucherFormData = z.infer<typeof validateVoucherSchema>

interface ValidateVoucherFormProps {
  context: any
  signer: any
  onSuccess?: (result: any) => void
  onError?: (error: any) => void
}

export default function ValidateVoucherForm({ context, signer, onSuccess, onError }: ValidateVoucherFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [validationResult, setValidationResult] = useState<any>(null)

  const form = useForm<ValidateVoucherFormData>({
    resolver: zodResolver(validateVoucherSchema),
    defaultValues: {
      voucherAddress: '',
      merchantId: '',
      purchaseAmount: undefined,
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = form

  const onSubmit = async (data: ValidateVoucherFormData) => {
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

      // Call the backend API
      const response = await fetch('/api/validate-voucher', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to validate voucher')
      }

      const result = await response.json()
      setValidationResult(result.result)
      onSuccess?.(result.result)
    } catch (error) {
      console.error('Error validating voucher:', error)
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
            Validate a voucher without redeeming it. This is useful for checking voucher status and calculating
            redemption value.
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

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Validating...' : 'Validate Voucher'}
            </Button>
          </div>

          {validationResult && (
            <VerxioFormSection title="Validation Results">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  {validationResult.isValid ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span className="font-medium">Status: {validationResult.isValid ? 'Valid' : 'Invalid'}</span>
                  <Badge variant={validationResult.isValid ? 'default' : 'destructive'}>
                    {validationResult.isValid ? 'VALID' : 'INVALID'}
                  </Badge>
                </div>

                {validationResult.redemptionValue && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Info className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-800">
                        Redemption Value: {validationResult.redemptionValue} credits
                      </span>
                    </div>
                  </div>
                )}

                {validationResult.voucherData && (
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <h4 className="font-medium">Voucher Details</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-medium">Type:</span> {validationResult.voucherData.type}
                      </div>
                      <div>
                        <span className="font-medium">Value:</span> {validationResult.voucherData.value}
                      </div>
                      <div>
                        <span className="font-medium">Current Uses:</span> {validationResult.voucherData.currentUses}
                      </div>
                      <div>
                        <span className="font-medium">Max Uses:</span> {validationResult.voucherData.maxUses}
                      </div>
                      <div>
                        <span className="font-medium">Expiry:</span>{' '}
                        {new Date(validationResult.voucherData.expiryDate).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-medium">Merchant ID:</span> {validationResult.voucherData.merchantId}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Description:</span> {validationResult.voucherData.description}
                    </div>
                  </div>
                )}

                {validationResult.errors && validationResult.errors.length > 0 && (
                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span className="font-medium text-red-800">Validation Errors</span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                      {validationResult.errors.map((error: string, index: number) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {validationResult.warnings && validationResult.warnings.length > 0 && (
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <span className="font-medium text-yellow-800">Warnings</span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-sm text-yellow-700">
                      {validationResult.warnings.map((warning: string, index: number) => (
                        <li key={index}>{warning}</li>
                      ))}
                    </ul>
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
