"use client"

export default function ValidateVoucherPage() {
  return (
    <div className="max-w-4xl">
      <div className="doc-section">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Validate Voucher</h1>
        <p>Validate a voucher without redeeming it. This is useful for checking voucher status and calculating redemption value.</p>

        <div className="code-block">
          <pre>{`import { validateVoucher } from '@verxioprotocol/core'
import { publicKey } from '@metaplex-foundation/umi'

const validation = await validateVoucher(context, {
  voucherAddress: publicKey('VOUCHER_ADDRESS'),
  merchantId: 'coffee_brew_merchant_001', // String identifier for the merchant
  purchaseAmount: 100, // Optional: for percentage-based vouchers
})`}</pre>
        </div>

        <h3>Return Value</h3>
        <div className="code-block">
          <pre>{`{
  isValid: boolean,
  errors: string[],
  warnings: string[],
  voucherData: {
    type: string,
    value: number,
    currentUses: number,
    maxUses: number,
    expiryDate: number,
    conditions: string[],
    description: string,
    merchantId: string
  },
  redemptionValue: number
}`}</pre>
        </div>
      </div>
    </div>
  )
} 