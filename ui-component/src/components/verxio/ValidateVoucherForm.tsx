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
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react'

const validateVoucherSchema = z.object({
  voucherAddress: z.string().min(1, 'Voucher address is required'),
})

type ValidateVoucherFormData = z.infer<typeof validateVoucherSchema>

interface ValidateVoucherFormProps {
  onSuccess?: (result: any) => void
  onError?: (error: any) => void
}

export default function ValidateVoucherForm({ onSuccess, onError }: ValidateVoucherFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [validationResult, setValidationResult] = useState<any>(null)

  const form = useForm<ValidateVoucherFormData>({
    resolver: zodResolver(validateVoucherSchema),
    defaultValues: {
      voucherAddress: '',
    },
  })

  const {
    register,
    formState: { errors },
  } = form

  const onSubmit = async (data: ValidateVoucherFormData) => {
    setIsLoading(true)
    try {
      // Call the get voucher details API
      const response = await fetch('/api/validate-voucher', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          voucherAddress: data.voucherAddress,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch voucher details')
      }

      const result = await response.json()

      const voucherData = result.result.voucher

      // Create a display-friendly result object
      const displayResult = {
        voucherData,
        conditions: voucherData.conditions || [],
        warnings: [] as string[],
        errors: [] as string[],
      }

      // Add warnings for expiry and usage
      if (voucherData.expiryDate <= Date.now()) {
        displayResult.warnings.push('Voucher has expired')
      } else if (voucherData.expiryDate - Date.now() < 24 * 60 * 60 * 1000) {
        displayResult.warnings.push('Voucher expires within 24 hours')
      }

      if (voucherData.currentUses >= voucherData.maxUses) {
        displayResult.warnings.push('Voucher has reached maximum usage limit')
      }

      if (voucherData.status !== 'active') {
        displayResult.warnings.push(`Voucher status: ${voucherData.status}`)
      }

      setValidationResult(displayResult)
      form.reset()
      onSuccess?.(displayResult)
    } catch (error) {
      console.error('Error fetching voucher details:', error)
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
            This retrieves the voucher data for inspection and displays basic properties like expiry, usage limits, and
            conditions. Merchant validation happens during redemption.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <VerxioFormSection title="Voucher Information">
            <VerxioFormField label="Voucher Address" error={errors.voucherAddress?.message}>
              <Input {...register('voucherAddress')} placeholder="Voucher public key" />
            </VerxioFormField>
          </VerxioFormSection>

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Fetching...' : 'Fetch Voucher Details'}
            </Button>
          </div>

          {validationResult && (
            <VerxioFormSection title="Voucher Details">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="font-medium">Voucher Found</span>
                  <Badge variant="default">ACTIVE</Badge>
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
                        <span className="font-medium">Type:</span> {validationResult.voucherData.type.replace('_', ' ')}
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
                        <span className="font-medium">Status:</span> {validationResult.voucherData.status}
                      </div>
                      <div>
                        <span className="font-medium">Transferable:</span>{' '}
                        {validationResult.voucherData.transferable ? 'Yes' : 'No'}
                      </div>
                      <div>
                        <span className="font-medium">Expiry:</span>{' '}
                        {new Date(validationResult.voucherData.expiryDate).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-medium">Issued:</span>{' '}
                        {new Date(validationResult.voucherData.issuedAt).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-medium">Merchant:</span> {validationResult.voucherData.merchantId}
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

                {validationResult.conditions && validationResult.conditions.length > 0 && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-800">Redemption Conditions</span>
                    </div>
                    <div className="space-y-2">
                      {validationResult.conditions.map((condition: string, index: number) => (
                        <div key={index} className="bg-white p-3 rounded border border-blue-200">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              Condition {index + 1}
                            </Badge>
                          </div>
                          <p className="text-sm text-blue-800 mt-1">{condition}</p>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-blue-600 mt-2">
                      These conditions will be validated during redemption with proper context.
                    </p>
                  </div>
                )}

                {validationResult.voucherData.redemptionHistory &&
                  validationResult.voucherData.redemptionHistory.length > 0 && (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Info className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-green-800">Redemption History</span>
                      </div>
                      <div className="space-y-2">
                        {validationResult.voucherData.redemptionHistory.map((redemption: any, index: number) => (
                          <div key={index} className="bg-white p-3 rounded border border-green-200">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-green-900">Redemption #{index + 1}</span>
                              <span className="text-xs text-green-600">
                                {new Date(redemption.timestamp).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="text-sm text-green-800 space-y-1">
                              <div>Value: {redemption.redemptionValue}</div>
                              {redemption.transactionId && <div>Transaction: {redemption.transactionId}</div>}
                              {redemption.totalAmount && <div>Total Amount: ${redemption.totalAmount}</div>}
                              {redemption.discountApplied && <div>Discount Applied: ${redemption.discountApplied}</div>}
                            </div>
                          </div>
                        ))}
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
