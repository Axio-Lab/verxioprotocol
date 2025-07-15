"use client"

export default function ExtendVoucherExpiryPage() {
  return (
    <div className="max-w-4xl">
      <div className="doc-section">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Extend Voucher Expiry</h1>
        <p>Extend the expiration date of a voucher with a reason for tracking.</p>

        <div className="code-block">
          <pre>{`import { extendVoucherExpiry } from '@verxioprotocol/core'
import { publicKey, generateSigner } from '@metaplex-foundation/umi'

const result = await extendVoucherExpiry(context, {
  voucherAddress: publicKey('VOUCHER_ADDRESS'),
  newExpiryDate: Date.now() + 60 * 24 * 60 * 60 * 1000, // 60 days from now
  reason: 'Customer request',
  signer: generateSigner(context.umi),
})`}</pre>
        </div>

        <h3>Return Value</h3>
        <div className="code-block">
          <pre>{`{
  signature: string,
  newExpiryDate: number
}`}</pre>
        </div>
      </div>
    </div>
  )
} 