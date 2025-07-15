'use client'

export default function CancelVoucherPage() {
  return (
    <div className="max-w-4xl">
      <div className="doc-section">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Cancel Voucher</h1>
        <p>Cancel a voucher with a reason for tracking.</p>

        <div className="code-block">
          <pre>{`import { cancelVoucher } from '@verxioprotocol/core'
import { publicKey, generateSigner } from '@metaplex-foundation/umi'

const result = await cancelVoucher(context, {
  voucherAddress: publicKey('VOUCHER_ADDRESS'),
  reason: 'Customer refund',
  signer: generateSigner(context.umi),
})`}</pre>
        </div>

        <h3>Return Value</h3>
        <div className="code-block">
          <pre>{`{
  signature: string,
  status: 'cancelled'
}`}</pre>
        </div>
      </div>
    </div>
  )
}
