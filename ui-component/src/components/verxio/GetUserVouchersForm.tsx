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
  onSuccess?: (result: any) => void
  onError?: (error: any) => void
}

export default function GetUserVouchersForm({ onSuccess, onError }: GetUserVouchersFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [vouchersResult, setVouchersResult] = useState<any>(null)
  const [expandedIndexes, setExpandedIndexes] = useState<number[]>([])

  const form = useForm<GetUserVouchersFormData>({
    resolver: zodResolver(getUserVouchersSchema),
    defaultValues: {
      userAddress: '',
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
      // console.log(result)
      setVouchersResult(result.result)
      form.reset()
      onSuccess?.(result.result)
    } catch (error) {
      console.error('Error getting user vouchers:', error)
      onError?.(error)
    } finally {
      setIsLoading(false)
    }
  }

  function getVoucherStatus(voucher: any): string {
    if (voucher.voucherData?.status) return voucher.voucherData.status.toUpperCase()
    if (voucher.isExpired) return 'EXPIRED'
    if (voucher.canRedeem) return 'ACTIVE'
    if (voucher.remainingUses === 0) return 'USED'
    return 'INACTIVE'
  }

  // Helper to format ms duration as human readable string
  function formatDuration(ms: number): string {
    if (!ms || isNaN(ms) || ms <= 0) return 'Expired'
    const totalSeconds = Math.floor(ms / 1000)
    const days = Math.floor(totalSeconds / (60 * 60 * 24))
    const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60))
    const minutes = Math.floor((totalSeconds % (60 * 60)) / 60)
    const parts = []
    if (days > 0) parts.push(`${days} day${days > 1 ? 's' : ''}`)
    if (hours > 0) parts.push(`${hours} hour${hours > 1 ? 's' : ''}`)
    if (minutes > 0) parts.push(`${minutes} minute${minutes > 1 ? 's' : ''}`)
    if (parts.length === 0) return '< 1 minute'
    return parts.join(', ')
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

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Fetching Vouchers...' : 'Get User Vouchers'}
            </Button>
          </div>

          {vouchersResult && (
            <>
              {/* Summary Section */}
              {vouchersResult.summary && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <span className="font-medium">Total:</span> {vouchersResult.summary.totalCount}
                  </div>
                  <div>
                    <span className="font-medium">Active:</span> {vouchersResult.summary.activeVouchers}
                  </div>
                  <div>
                    <span className="font-medium">Used:</span> {vouchersResult.summary.usedVouchers}
                  </div>
                  <div>
                    <span className="font-medium">Expired:</span> {vouchersResult.summary.expiredVouchers}
                  </div>
                  <div>
                    <span className="font-medium">Cancelled:</span> {vouchersResult.summary.cancelledVouchers}
                  </div>
                  <div>
                    <span className="font-medium">Total Value:</span> {vouchersResult.summary.totalValue}
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium">By Merchant:</span>
                    <ul className="ml-2">
                      {(Object.entries(vouchersResult.summary.byMerchant || {}) as [string, number][]).map(
                        ([merchant, count]) => (
                          <li key={merchant}>
                            {merchant}: {count}
                          </li>
                        ),
                      )}
                    </ul>
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium">By Type:</span>
                    <ul className="ml-2">
                      {(Object.entries(vouchersResult.summary.byType || {}) as [string, number][]).map(
                        ([type, count]) => (
                          <li key={type}>
                            {type}: {count}
                          </li>
                        ),
                      )}
                    </ul>
                  </div>
                </div>
              )}

              {/* Voucher List Section */}
              {vouchersResult.vouchers && vouchersResult.vouchers.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium">Voucher List</h4>
                  {vouchersResult.vouchers.map((voucher: any, index: number) => {
                    const expanded = expandedIndexes.includes(index)
                    return (
                      <div key={index} className="bg-gray-50 rounded-lg border border-gray-200">
                        <button
                          type="button"
                          className="w-full flex items-center justify-between px-4 py-3 focus:outline-none hover:bg-gray-100 rounded-t-lg"
                          onClick={() => {
                            setExpandedIndexes((prev) =>
                              prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
                            )
                          }}
                        >
                          <span className="font-medium text-left">{voucher.name || `Voucher ${index + 1}`}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant={getVoucherStatus(voucher) === 'ACTIVE' ? 'default' : 'secondary'}>
                              {getVoucherStatus(voucher)}
                            </Badge>
                            <span className={`transition-transform ${expanded ? 'rotate-90' : ''}`}>▶</span>
                          </div>
                        </button>
                        {expanded && (
                          <div className="px-4 pb-4 pt-2 space-y-2 border-t border-gray-200">
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="font-medium">Address:</span> {voucher.voucherAddress}
                              </div>
                              <div>
                                <span className="font-medium">Type:</span> {voucher.voucherData?.type}
                              </div>
                              <div>
                                <span className="font-medium">Value:</span> {voucher.voucherData?.value}
                              </div>
                              <div>
                                <span className="font-medium">Uses:</span> {voucher.voucherData?.currentUses}/
                                {voucher.voucherData?.maxUses}
                              </div>
                              <div>
                                <span className="font-medium">Issued At:</span>{' '}
                                {voucher.voucherData?.issuedAt
                                  ? new Date(voucher.voucherData.issuedAt).toLocaleDateString()
                                  : 'N/A'}
                              </div>
                              <div>
                                <span className="font-medium">Expiry Date:</span>{' '}
                                {voucher.voucherData?.expiryDate
                                  ? new Date(voucher.voucherData.expiryDate).toLocaleDateString()
                                  : 'N/A'}
                              </div>
                            </div>
                            <div>
                              <span className="font-medium">Description:</span> {voucher.voucherData?.description}
                            </div>
                            {voucher.voucherData?.conditions && voucher.voucherData.conditions.length > 0 && (
                              <div>
                                <span className="font-medium">Conditions:</span>
                                <ul className="list-disc list-inside ml-2 text-sm">
                                  {voucher.voucherData.conditions.map((condition: string, condIndex: number) => (
                                    <li key={condIndex}>{condition}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            <div>
                              <span className="font-medium">Can Redeem:</span> {voucher.canRedeem ? 'Yes' : 'No'}
                            </div>
                            <div>
                              <span className="font-medium">Remaining Uses:</span> {voucher.remainingUses}
                            </div>
                            <div>
                              <span className="font-medium">Time Until Expiry:</span>{' '}
                              {voucher.voucherData?.expiryDate
                                ? formatDuration(voucher.voucherData.expiryDate - Date.now())
                                : 'N/A'}
                            </div>
                            <div>
                              <span className="font-medium">URI:</span>{' '}
                              <a
                                href={voucher.uri}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 underline"
                              >
                                {voucher.uri}
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* No Vouchers Case */}
              {(!vouchersResult.vouchers || vouchersResult.vouchers.length === 0) && (
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <span className="text-gray-600">No vouchers found for this user</span>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </VerxioForm>
  )
}
