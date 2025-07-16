'use client'

export default function ValidateVoucherPage() {
  return (
    <div className="max-w-4xl">
      <div className="doc-section">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Validate Voucher</h1>
        <p>
          Fetch voucher data for inspection and display. This function returns voucher details without performing
          validation checks - validation happens during redemption. This approach provides better UX by allowing
          applications to display voucher details without requiring redemption context.
        </p>

        <div className="code-block">
          <pre>{`import { validateVoucher } from '@verxioprotocol/core'
import { publicKey } from '@metaplex-foundation/umi'

const validation = await validateVoucher(context, {
  voucherAddress: publicKey('VOUCHER_ADDRESS'),
})`}</pre>
        </div>

        <h3>Return Value</h3>
        <div className="code-block">
          <pre>{`{
  voucher: {
    type: string,
    value: number,
    currentUses: number,
    maxUses: number,
    expiryDate: number,
    conditions: Array<{
      type: string,
      value: number,
      operator: string
    }>,
    description: string,
    merchantId: string,
    status: string,
    redemptionHistory: Array<{
      timestamp: number,
      value: number,
      transactionId: string,
      items: string[],
      totalAmount: number,
      discountApplied: number
    }>
  },
  errors: string[] // Empty array if voucher found successfully
}`}</pre>
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">Important Note</h4>
          <p className="text-blue-800">
            Merchant validation and business logic validation (expiry, usage limits, etc.) are performed during the
            <code className="bg-blue-100 px-1 rounded">redeemVoucher</code> operation, not during validation. This
            separation allows for better user experience where voucher details can be displayed without requiring
            redemption context.
          </p>
        </div>
      </div>
    </div>
  )
}
