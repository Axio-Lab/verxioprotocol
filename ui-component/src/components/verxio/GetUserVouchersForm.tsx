'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { getUserVouchers } from '@verxioprotocol/core'
import { publicKey } from '@metaplex-foundation/umi'
import { VerxioForm, VerxioFormSection, VerxioFormField } from './base/VerxioForm'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Alert, AlertDescription } from '../ui/alert'
import { Badge } from '../ui/badge'
import { Users, Calendar, Filter, SortAsc, SortDesc } from 'lucide-react'

const getUserVouchersSchema = z.object({
  userAddress: z.string().min(1, 'User address is required'),
  filters: z
    .object({
      status: z.enum(['active', 'expired', 'fully_used']).optional(),
      type: z.string().optional(),
      minValue: z.number().optional(),
    })
    .optional(),
  sortBy: z.enum(['expiryDate', 'value', 'createdAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  limit: z.number().optional(),
})

type GetUserVouchersFormData = z.infer<typeof getUserVouchersSchema>

interface GetUserVouchersFormProps {
  context: any
  signer: any
  onSuccess?: (result: any) => void
  onError?: (error: any) => void
}

export default function GetUserVouchersForm({ context, signer, onSuccess, onError }: GetUserVouchersFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [vouchersResult, setVouchersResult] = useState<any>(null)

  const form = useForm<GetUserVouchersFormData>({
    resolver: zodResolver(getUserVouchersSchema),
    defaultValues: {
      userAddress: '',
      filters: {
        status: 'active',
        type: '',
        minValue: undefined,
      },
      sortBy: 'expiryDate',
      sortOrder: 'asc',
      limit: 10,
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = form

  const onSubmit = async (data: GetUserVouchersFormData) => {
    setIsLoading(true)
    try {
      // Prepare the request payload
      const payload: any = {
        userAddress: data.userAddress,
      }

      if (data.filters) {
        payload.filters = data.filters
      }

      if (data.sortBy) {
        payload.sortBy = data.sortBy
      }

      if (data.sortOrder) {
        payload.sortOrder = data.sortOrder
      }

      if (data.limit) {
        payload.limit = data.limit
      }

      // Call the backend API
      const response = await fetch('/api/get-user-vouchers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to get user vouchers')
      }

      const result = await response.json()
      setVouchersResult(result.result)
      onSuccess?.(result.result)
    } catch (error) {
      console.error('Error getting user vouchers:', error)
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
            Retrieve all vouchers for a specific user with filtering and sorting options.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <VerxioFormSection title="User Information">
            <VerxioFormField label="User Address" error={errors.userAddress?.message}>
              <Input {...register('userAddress')} placeholder="User wallet address" />
            </VerxioFormField>
          </VerxioFormSection>

          <VerxioFormSection title="Filters">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <VerxioFormField label="Status">
                <Select
                  onValueChange={(value) => setValue('filters.status', value as any)}
                  defaultValue={watch('filters.status')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="fully_used">Fully Used</SelectItem>
                  </SelectContent>
                </Select>
              </VerxioFormField>

              <VerxioFormField label="Voucher Type">
                <Input {...register('filters.type')} placeholder="percentage_off, fixed_credits, etc." />
              </VerxioFormField>

              <VerxioFormField label="Minimum Value">
                <Input type="number" {...register('filters.minValue', { valueAsNumber: true })} placeholder="10" />
              </VerxioFormField>

              <VerxioFormField label="Limit">
                <Input type="number" {...register('limit', { valueAsNumber: true })} placeholder="10" />
              </VerxioFormField>
            </div>
          </VerxioFormSection>

          <VerxioFormSection title="Sorting">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <VerxioFormField label="Sort By">
                <Select onValueChange={(value) => setValue('sortBy', value as any)} defaultValue={watch('sortBy')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select sort field" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expiryDate">Expiry Date</SelectItem>
                    <SelectItem value="value">Value</SelectItem>
                    <SelectItem value="createdAt">Created At</SelectItem>
                  </SelectContent>
                </Select>
              </VerxioFormField>

              <VerxioFormField label="Sort Order">
                <Select
                  onValueChange={(value) => setValue('sortOrder', value as any)}
                  defaultValue={watch('sortOrder')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select sort order" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Ascending</SelectItem>
                    <SelectItem value="desc">Descending</SelectItem>
                  </SelectContent>
                </Select>
              </VerxioFormField>
            </div>
          </VerxioFormSection>

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Fetching Vouchers...' : 'Get User Vouchers'}
            </Button>
          </div>

          {vouchersResult && (
            <VerxioFormSection title="User Vouchers">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  <span className="font-medium">Total Vouchers: {vouchersResult.total}</span>
                </div>

                {vouchersResult.expiringSoon && vouchersResult.expiringSoon.length > 0 && (
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-yellow-600" />
                      <span className="font-medium text-yellow-800">
                        Expiring Soon ({vouchersResult.expiringSoon.length} vouchers)
                      </span>
                    </div>
                    <div className="text-sm text-yellow-700">These vouchers will expire in the next 7 days</div>
                  </div>
                )}

                {vouchersResult.redeemable && vouchersResult.redeemable.length > 0 && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Filter className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-800">
                        Redeemable ({vouchersResult.redeemable.length} vouchers)
                      </span>
                    </div>
                    <div className="text-sm text-green-700">These vouchers are currently available for redemption</div>
                  </div>
                )}

                {vouchersResult.vouchers && vouchersResult.vouchers.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium">Voucher List</h4>
                    {vouchersResult.vouchers.map((voucher: any, index: number) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Voucher {index + 1}</span>
                          <Badge variant={voucher.status === 'active' ? 'default' : 'secondary'}>
                            {voucher.status.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="font-medium">Address:</span> {voucher.address}
                          </div>
                          <div>
                            <span className="font-medium">Type:</span> {voucher.type}
                          </div>
                          <div>
                            <span className="font-medium">Value:</span> {voucher.value}
                          </div>
                          <div>
                            <span className="font-medium">Uses:</span> {voucher.currentUses}/{voucher.maxUses}
                          </div>
                          <div>
                            <span className="font-medium">Expiry:</span>{' '}
                            {new Date(voucher.expiryDate).toLocaleDateString()}
                          </div>
                          <div>
                            <span className="font-medium">Collection:</span> {voucher.collection}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium">Description:</span> {voucher.description}
                        </div>
                        {voucher.conditions && voucher.conditions.length > 0 && (
                          <div>
                            <span className="font-medium">Conditions:</span>
                            <ul className="list-disc list-inside ml-2 text-sm">
                              {voucher.conditions.map((condition: string, condIndex: number) => (
                                <li key={condIndex}>{condition}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {(!vouchersResult.vouchers || vouchersResult.vouchers.length === 0) && (
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <span className="text-gray-600">No vouchers found for this user</span>
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
