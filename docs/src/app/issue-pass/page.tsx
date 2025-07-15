'use client'

export default function IssuePassPage() {
  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Issue Loyalty Pass</h1>
        <p className="text-lg text-gray-600">
          Create and distribute loyalty passes as NFTs to users. Each pass represents a user's membership in your
          loyalty program and tracks their points, tier status, and activity history.
        </p>
      </div>

      {/* Function Overview */}
      <div className="doc-section">
        <h2>Overview</h2>
        <p>
          The <code className="inline-code">issueLoyaltyPass</code> function creates a new NFT loyalty pass for a
          specific user within your loyalty program. The pass serves as the user's digital membership card and stores
          all their loyalty data on-chain.
        </p>
        <p className="mt-4 text-gray-600">
          <strong>Note:</strong> You can either provide a pre-uploaded metadata URI or provide an image buffer and
          filename to auto-upload the image and generate metadata.
        </p>
      </div>

      {/* Usage Examples */}
      <div className="doc-section">
        <h2>Usage Examples</h2>

        <h3>1. Using a Pre-uploaded Metadata URI</h3>
        <p>If you already have pass metadata uploaded to Arweave or another storage service:</p>

        <div className="code-block">
          <pre>{`import { issueLoyaltyPass } from '@verxioprotocol/core'
import { generateSigner, publicKey } from '@metaplex-foundation/umi'

const result = await issueLoyaltyPass(context, {
  collectionAddress: context.collectionAddress,
  recipient: publicKey('RECIPIENT_ADDRESS'),
  passName: 'Coffee Rewards Pass',
  passMetadataUri: 'https://arweave.net/...', // Already uploaded metadata
  assetSigner: generateSigner(context.umi), // Optional: Provide a signer for the pass
  updateAuthority: programAuthority, // Required: Program authority of the Loyalty Program
  organizationName: 'Coffee Brew',
})`}</pre>
        </div>

        <h3>2. Uploading an Image and Generating Metadata</h3>
        <p>If you want the protocol to handle image upload and metadata generation:</p>

        <div className="code-block">
          <pre>{`import { issueLoyaltyPass } from '@verxioprotocol/core'
import { generateSigner, publicKey } from '@metaplex-foundation/umi'
import fs from 'fs'

const imageBuffer = fs.readFileSync('pass.png')
const result = await issueLoyaltyPass(context, {
  collectionAddress: context.collectionAddress,
  recipient: publicKey('RECIPIENT_ADDRESS'),
  passName: 'Coffee Rewards Pass',
  imageBuffer, // Buffer of your image
  imageFilename: 'pass.png',
  updateAuthority: programAuthority, // Required: Program authority of the Loyalty Program
  organizationName: 'Coffee Brew',
})
// The protocol will upload the image, generate metadata, and use the resulting URI`}</pre>
        </div>
      </div>

      {/* Parameters */}
      <div className="doc-section">
        <h2>Parameters</h2>
        <p>The function accepts a context object and a configuration object with the following parameters:</p>

        <table className="param-table">
          <thead>
            <tr>
              <th>Parameter</th>
              <th>Type</th>
              <th>Required</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <span className="param-name">context</span>
              </td>
              <td>
                <span className="param-type">VerxioContext</span>
              </td>
              <td>✅</td>
              <td>The initialized Verxio context object</td>
            </tr>
            <tr>
              <td>
                <span className="param-name">collectionAddress</span>
              </td>
              <td>
                <span className="param-type">PublicKey</span>
              </td>
              <td>✅</td>
              <td>The collection address of your loyalty program</td>
            </tr>
            <tr>
              <td>
                <span className="param-name">recipient</span>
              </td>
              <td>
                <span className="param-type">PublicKey</span>
              </td>
              <td>✅</td>
              <td>Wallet address of the user receiving the pass</td>
            </tr>
            <tr>
              <td>
                <span className="param-name">passName</span>
              </td>
              <td>
                <span className="param-type">string</span>
              </td>
              <td>✅</td>
              <td>Display name for the loyalty pass NFT</td>
            </tr>
            <tr>
              <td>
                <span className="param-name">passMetadataUri</span>
              </td>
              <td>
                <span className="param-type">string</span>
              </td>
              <td>❌</td>
              <td>URI pointing to the pass's metadata JSON (if not providing imageBuffer)</td>
            </tr>
            <tr>
              <td>
                <span className="param-name">imageBuffer</span>
              </td>
              <td>
                <span className="param-type">Buffer</span>
              </td>
              <td>❌</td>
              <td>Buffer of your image file (if not providing passMetadataUri)</td>
            </tr>
            <tr>
              <td>
                <span className="param-name">imageFilename</span>
              </td>
              <td>
                <span className="param-type">string</span>
              </td>
              <td>❌</td>
              <td>Name of your image file (required if providing imageBuffer)</td>
            </tr>
            <tr>
              <td>
                <span className="param-name">imageContentType</span>
              </td>
              <td>
                <span className="param-type">string</span>
              </td>
              <td>❌</td>
              <td>MIME type of your image (e.g., "image/png")</td>
            </tr>
            <tr>
              <td>
                <span className="param-name">assetSigner</span>
              </td>
              <td>
                <span className="param-type">Signer</span>
              </td>
              <td>❌</td>
              <td>Custom signer for the pass (auto-generated if not provided)</td>
            </tr>
            <tr>
              <td>
                <span className="param-name">updateAuthority</span>
              </td>
              <td>
                <span className="param-type">Signer</span>
              </td>
              <td>✅</td>
              <td>Program authority required for issuing passes</td>
            </tr>
            <tr>
              <td>
                <span className="param-name">organizationName</span>
              </td>
              <td>
                <span className="param-type">string</span>
              </td>
              <td>✅</td>
              <td>Name of the organization (required for metadata generation)</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Return Value */}
      <div className="doc-section">
        <h2>Return Value</h2>
        <p>The function returns a Promise that resolves to an object containing:</p>

        <div className="code-block">
          <pre>{`{
  asset: KeypairSigner,    // The generated pass NFT signer
  signature: string        // Transaction signature
}`}</pre>
        </div>

        <table className="param-table">
          <thead>
            <tr>
              <th>Property</th>
              <th>Type</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <span className="param-name">asset</span>
              </td>
              <td>
                <span className="param-type">KeypairSigner</span>
              </td>
              <td>The generated loyalty pass NFT keypair</td>
            </tr>
            <tr>
              <td>
                <span className="param-name">signature</span>
              </td>
              <td>
                <span className="param-type">string</span>
              </td>
              <td>The transaction signature confirming pass creation</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Error Handling */}
      <div className="doc-section">
        <h2>Error Handling</h2>
        <p>The function will throw errors in the following cases:</p>

        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>
            <strong>Invalid configuration:</strong> Missing required parameters or invalid parameter values
          </li>
          <li>
            <strong>Image upload failure:</strong> If using imageBuffer and the upload fails
          </li>
          <li>
            <strong>Metadata generation failure:</strong> If metadata cannot be generated from the provided data
          </li>
          <li>
            <strong>Transaction failure:</strong> If the blockchain transaction fails
          </li>
          <li>
            <strong>Insufficient funds:</strong> If the fee payer doesn't have enough SOL for the transaction
          </li>
          <li>
            <strong>Invalid authority:</strong> If the updateAuthority is not the program authority
          </li>
        </ul>

        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-semibold text-yellow-800 mb-2">Important Notes</h4>
          <ul className="text-yellow-700 text-sm space-y-1">
            <li>
              • You must provide either <code className="inline-code">passMetadataUri</code> OR{' '}
              <code className="inline-code">imageBuffer</code> with <code className="inline-code">imageFilename</code>
            </li>
            <li>
              • The <code className="inline-code">organizationName</code> is required for metadata generation
            </li>
            <li>
              • The <code className="inline-code">updateAuthority</code> must be the program authority from the loyalty
              program creation
            </li>
            <li>• The protocol fee for issuing a loyalty pass is 0.001 SOL</li>
          </ul>
        </div>
      </div>

      {/* Related Functions */}
      <div className="doc-section">
        <h2>Related Functions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Next Steps</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/award-points" className="text-blue-600 hover:underline">
                  Award Points
                </a>
                - Give points to users for actions
              </li>
              <li>
                <a href="/get-asset-data" className="text-blue-600 hover:underline">
                  Get Asset Data
                </a>
                - Retrieve pass data and user information
              </li>
              <li>
                <a href="/messaging" className="text-blue-600 hover:underline">
                  Send Message
                </a>
                - Send direct messages to pass holders
              </li>
            </ul>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Advanced Usage</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/instruction-functions" className="text-blue-600 hover:underline">
                  Instruction Functions
                </a>
                - Use transaction composition
              </li>
              <li>
                <a href="/approve-transfer" className="text-blue-600 hover:underline">
                  Approve Transfer
                </a>
                - Allow pass transfers between users
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
