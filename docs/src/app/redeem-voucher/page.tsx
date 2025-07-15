'use client'

export default function RedeemVoucherPage() {
  return (
    <div className="max-w-4xl">
      <div className="doc-section">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Redeem Voucher</h1>
        <p>Redeem a voucher for its value. This will mark the voucher as used and update its usage count.</p>

        <div className="code-block">
          <pre>{`import { redeemVoucher } from '@verxioprotocol/core'
import { publicKey, generateSigner } from '@metaplex-foundation/umi'

const result = await redeemVoucher(context, {
  voucherAddress: publicKey('VOUCHER_ADDRESS'),
  merchantId: 'coffee_brew_merchant_001', // String identifier for the merchant
  purchaseAmount: 100, // Optional: for percentage-based vouchers
  updateAuthority: generateSigner(context.umi), // Authority that can update the voucher
})`}</pre>
        </div>

        <h3>Return Value</h3>
        <div className="code-block">
          <pre>{`{
  success: boolean,
  signature: string,
  redemptionValue: number,
  updatedVoucher: VoucherData,
  errors: string[]
}`}</pre>
        </div>
      </div>
    </div>
  )
}
