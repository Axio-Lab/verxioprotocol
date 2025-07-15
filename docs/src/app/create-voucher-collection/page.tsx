"use client"

export default function CreateVoucherCollectionPage() {
  return (
    <div className="max-w-4xl">
      <div className="doc-section">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Create Voucher Collection</h1>
        <p>Create a collection to organize vouchers by merchant and type. You can either provide a pre-uploaded metadata URI or provide an image buffer and filename to auto-upload the image and generate metadata.</p>

        <h3>1. Using a Pre-uploaded Metadata URI</h3>
        <div className="code-block">
          <pre>{`import { createVoucherCollection } from '@verxioprotocol/core'
import { generateSigner } from '@metaplex-foundation/umi'

const result = await createVoucherCollection(context, {
  collectionName: 'Summer Sale Vouchers',
  collectionMetadataUri: 'https://arweave.net/...', // Already uploaded metadata
  updateAuthority: generateSigner(context.umi),
  metadata: {
    merchantName: 'Coffee Brew',
    description: 'Summer sale vouchers for loyal customers',
    terms: 'Valid until August 31st, 2024',
  },
})`}</pre>
        </div>

        <h3>2. Uploading an Image and Generating Metadata</h3>
        <div className="code-block">
          <pre>{`import { createVoucherCollection } from '@verxioprotocol/core'
import { generateSigner } from '@metaplex-foundation/umi'
import fs from 'fs'

const imageBuffer = fs.readFileSync('voucher-collection.png')
const result = await createVoucherCollection(context, {
  collectionName: 'Summer Sale Vouchers',
  imageBuffer, // Buffer of your image
  imageFilename: 'voucher-collection.png',
  updateAuthority: generateSigner(context.umi),
  metadata: {
    merchantName: 'Coffee Brew',
    description: 'Summer sale vouchers for loyal customers',
    terms: 'Valid until August 31st, 2024',
  },
})
// The protocol will upload the image, generate metadata, and use the resulting URI`}</pre>
        </div>

        <h3>Return Value</h3>
        <div className="code-block">
          <pre>{`{
  collection: KeypairSigner,  // Collection signer
  signature: string,         // Transaction signature
  updateAuthority: KeypairSigner // Update authority for the collection
}`}</pre>
        </div>
      </div>

      {/* Merchant Identification */}
      <div className="doc-section">
        <h2>Merchant Identification</h2>
        <p>
          In the voucher system, merchants are identified using a <code className="inline-code">merchantId</code> string rather than a blockchain address. This provides flexibility for:
        </p>

        <ul className="list-disc list-inside space-y-2 text-gray-700 mt-4">
          <li><strong>Off-chain Integration:</strong> Merchants can use their existing business identifiers</li>
          <li><strong>Multi-chain Support:</strong> Same merchant can operate across different networks</li>
          <li><strong>Privacy:</strong> Merchant identity can be managed separately from blockchain addresses</li>
          <li><strong>Scalability:</strong> No need to manage multiple wallet addresses per merchant</li>
        </ul>

        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="font-semibold text-green-800 mb-2">Example Merchant IDs</h4>
          <div className="text-green-700 text-sm space-y-1">
            <div>• <code className="inline-code">coffee_brew_merchant_001</code> - Coffee shop chain</div>
            <div>• <code className="inline-code">retail_store_main_street</code> - Local retail store</div>
            <div>• <code className="inline-code">online_shop_electronics</code> - Online electronics store</div>
            <div>• <code className="inline-code">restaurant_franchise_west</code> - Restaurant franchise location</div>
          </div>
        </div>
      </div>
    </div>
  )
  
} 

