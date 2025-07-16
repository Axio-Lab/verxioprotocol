'use client'

export default function RedeemVoucherPage() {
  return (
    <div className="max-w-4xl">
      <div className="doc-section">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Redeem Voucher</h1>
        <p>
          Redeem a voucher for its value. This function performs comprehensive validation (merchant ID, expiry, usage
          limits, conditions) and executes the redemption with complete history tracking. Each redemption is recorded
          with timestamp, value, and transaction details.
        </p>

        <div className="code-block">
          <pre>{`import { redeemVoucher } from '@verxioprotocol/core'
import { publicKey, generateSigner } from '@metaplex-foundation/umi'

const result = await redeemVoucher(context, {
  voucherAddress: publicKey('VOUCHER_ADDRESS'),
  merchantId: 'coffee_brew_merchant_001', // String identifier for the merchant
  updateAuthority: generateSigner(context.umi), // Authority that can update the voucher
  redemptionAmount: 100, // Purchase amount for percentage-based vouchers
  redemptionDetails: {
    transactionId: 'tx_123',
    items: ['Coffee', 'Pastry'],
    totalAmount: 100,
    discountApplied: 25,
  },
})`}</pre>
        </div>

        <h3>Return Value</h3>
        <div className="code-block">
          <pre>{`{
  instruction: TransactionBuilder, // Transaction instruction for execution
  validation: {
    errors: string[], // Validation errors if any
    voucher: VoucherData // Voucher data after validation
  },
  redemptionValue: number, // Calculated redemption value
  updatedVoucher: VoucherData // Voucher data after redemption
}`}</pre>
        </div>

        <h3>Key Features</h3>
        <ul className="list-disc list-inside space-y-2 mt-4">
          <li>
            <strong>Merchant Validation:</strong> Ensures vouchers can only be redeemed by the correct merchant
          </li>
          <li>
            <strong>Comprehensive Validation:</strong> Checks expiry, usage limits, and conditions
          </li>
          <li>
            <strong>Redemption History:</strong> Records each redemption with timestamp, value, and transaction details
          </li>
          <li>
            <strong>Value Calculation:</strong> Automatically calculates redemption value based on voucher type and
            purchase amount
          </li>
        </ul>

        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="font-semibold text-green-900 mb-2">Redemption History</h4>
          <p className="text-green-800">
            Each redemption is automatically recorded in the voucher's history, providing a complete audit trail of all
            transactions. This includes transaction IDs, items purchased, total amounts, and discounts applied.
          </p>
        </div>
      </div>
    </div>
  )
}
