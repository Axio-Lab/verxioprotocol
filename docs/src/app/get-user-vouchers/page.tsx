"use client"

export default function GetUserVouchersPage() {
  return (
    <div className="max-w-4xl">
      <div className="doc-section">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Get User Vouchers</h1>
        <p>Retrieve all vouchers for a specific user with filtering and sorting options.</p>

        <div className="code-block">
          <pre>{`import { getUserVouchers } from '@verxioprotocol/core'
import { publicKey } from '@metaplex-foundation/umi'

const vouchers = await getUserVouchers(context, {
  userAddress: publicKey('USER_ADDRESS'),
  filters: {
    status: 'active', // 'active' | 'expired' | 'fully_used'
    type: 'percentage_off', // Optional: filter by voucher type
    minValue: 10, // Optional: minimum value
  },
  sortBy: 'expiryDate', // 'expiryDate' | 'value' | 'createdAt'
  sortOrder: 'asc', // 'asc' | 'desc'
  limit: 10, // Optional: limit results
})`}</pre>
        </div>

        <h3>Return Value</h3>
        <div className="code-block">
          <pre>{`{
  vouchers: Array<{
    address: string,
    type: string,
    value: number,
    currentUses: number,
    maxUses: number,
    expiryDate: number,
    status: string,
    description: string,
    conditions: string[],
    collection: string
  }>,
  total: number,
  expiringSoon: Array<string>, // Voucher addresses expiring in 7 days
  redeemable: Array<string>    // Voucher addresses that can be redeemed
}`}</pre>
        </div>
      </div>
    </div>
  )
} 