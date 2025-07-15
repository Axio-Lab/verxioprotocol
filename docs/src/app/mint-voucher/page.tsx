"use client"

export default function MintVoucherPage() {
  return (
    <div className="max-w-4xl">
      <div className="doc-section">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Mint Voucher</h1>
        <p>Create and distribute individual vouchers within a collection. You can either provide a pre-uploaded metadata URI or provide an image buffer and filename to auto-upload the image and generate metadata.</p>

        <h3>1. Using a Pre-uploaded Metadata URI</h3>
        <div className="code-block">
          <pre>{`import { mintVoucher } from '@verxioprotocol/core'
import { generateSigner, publicKey } from '@metaplex-foundation/umi'

const result = await mintVoucher(context, {
  collectionAddress: publicKey('COLLECTION_ADDRESS'),
  voucherName: 'Summer Sale Voucher',
  voucherMetadataUri: 'https://arweave.net/...', // Already uploaded metadata
  voucherData: {
    type: 'percentage_off',
    value: 15, // 15% off
    maxUses: 1,
    expiryDate: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days from now
    conditions: [{ type: 'minimum_purchase', value: 50, operator: 'greater_than' }],
    description: '15% off your next purchase',
    merchantId: 'coffee_brew_merchant_001', // String identifier for the merchant
  },
  recipient: publicKey('RECIPIENT_ADDRESS'),
  updateAuthority: generateSigner(context.umi),
})`}</pre>
        </div>

        <h3>2. Uploading an Image and Generating Metadata</h3>
        <div className="code-block">
          <pre>{`import { mintVoucher } from '@verxioprotocol/core'
import { generateSigner, publicKey } from '@metaplex-foundation/umi'
import fs from 'fs'

const imageBuffer = fs.readFileSync('voucher.png')
const result = await mintVoucher(context, {
  collectionAddress: publicKey('COLLECTION_ADDRESS'),
  voucherName: 'Summer Sale Voucher',
  imageBuffer, // Buffer of your image
  imageFilename: 'voucher.png',
  voucherData: {
    type: 'percentage_off',
    value: 15, // 15% off
    maxUses: 1,
    expiryDate: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days from now
    conditions: [{ type: 'minimum_purchase', value: 50, operator: 'greater_than' }],
    description: '15% off your next purchase',
    merchantId: 'coffee_brew_merchant_001', // String identifier for the merchant
  },
  recipient: publicKey('RECIPIENT_ADDRESS'),
  updateAuthority: generateSigner(context.umi),
})
// The protocol will upload the image, generate metadata, and use the resulting URI`}</pre>
        </div>

        <h3>Voucher Data Structure</h3>
        <table className="param-table">
          <thead>
            <tr>
              <th>Property</th>
              <th>Type</th>
              <th>Required</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><span className="param-name">type</span></td>
              <td><span className="param-type">string</span></td>
              <td>✅</td>
              <td>Voucher type: 'percentage_off', 'fixed_verxio_credits', 'free_item', 'buy_one_get_one', 'custom_reward'</td>
            </tr>
            <tr>
              <td><span className="param-name">value</span></td>
              <td><span className="param-type">number</span></td>
              <td>✅</td>
              <td>Voucher value (percentage, amount, etc.)</td>
            </tr>
            <tr>
              <td><span className="param-name">maxUses</span></td>
              <td><span className="param-type">number</span></td>
              <td>✅</td>
              <td>Maximum number of times the voucher can be used</td>
            </tr>
            <tr>
              <td><span className="param-name">expiryDate</span></td>
              <td><span className="param-type">number</span></td>
              <td>✅</td>
              <td>Expiration timestamp in milliseconds</td>
            </tr>
            <tr>
              <td><span className="param-name">conditions</span></td>
              <td><span className="param-type">Array</span></td>
              <td>❌</td>
              <td>Array of usage conditions</td>
            </tr>
            <tr>
              <td><span className="param-name">description</span></td>
              <td><span className="param-type">string</span></td>
              <td>✅</td>
              <td>Human-readable description of the voucher</td>
            </tr>
            <tr>
              <td><span className="param-name">merchantId</span></td>
              <td><span className="param-type">string</span></td>
              <td>✅</td>
              <td>String identifier for the merchant</td>
            </tr>
          </tbody>
        </table>

        <h3>Return Value</h3>
        <div className="code-block">
          <pre>{`{
  asset: KeypairSigner,  // Voucher signer
  signature: string,    // Transaction signature
  voucherAddress: PublicKey // Voucher public key
}`}</pre>
        </div>
      </div>
    </div>
  )
} 