'use client'

export default function CreateProgramPage() {
  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Create Loyalty Program</h1>
        <p className="text-lg text-gray-600">
          Create a new loyalty program with custom tiers, rewards, and point configurations. This function initializes a
          new collection on the blockchain that will manage all loyalty passes for your program.
        </p>
      </div>

      {/* Function Overview */}
      <div className="doc-section">
        <h2>Overview</h2>
        <p>
          The <code className="inline-code">createLoyaltyProgram</code> function creates a new loyalty program as a
          Metaplex CORE collection. This collection will hold all loyalty passes issued for your program and define the
          tier structure, rewards, and point allocation rules.
        </p>
        <p className="mt-4 text-gray-600">
          <strong>Note:</strong> You can either provide a pre-uploaded metadata URI or provide an image buffer and filename to auto-upload the image and generate metadata.
        </p>
      </div>

      {/* Usage Examples */}
      <div className="doc-section">
        <h2>Usage Examples</h2>

        <h3>1. Using a Pre-uploaded Metadata URI</h3>
        <p>If you already have metadata uploaded to Arweave or another storage service:</p>

        <div className="code-block">
          <pre>{`import { createLoyaltyProgram } from '@verxioprotocol/core'
import { generateSigner } from '@metaplex-foundation/umi'

const result = await createLoyaltyProgram(context, {
  loyaltyProgramName: 'Coffee Brew Rewards',
  metadataUri: 'https://arweave.net/...', // Already uploaded metadata
  programAuthority: context.programAuthority,
  updateAuthority: generateSigner(context.umi), // Optional: Provide custom update authority
  metadata: {
    organizationName: 'Coffee Brew', // Required: Name of the host/organization
    brandColor: '#FF5733', // Optional: Brand color for UI customization
  },
  tiers: [
    {
      name: 'Bronze',
      xpRequired: 500,
      rewards: ['2% cashback'],
    },
    {
      name: 'Silver',
      xpRequired: 1000,
      rewards: ['5% cashback'],
    },
  ],
  pointsPerAction: {
    purchase: 100,
    review: 50,
  },
})`}</pre>
        </div>

        <h3>2. Uploading an Image and Generating Metadata</h3>
        <p>If you want the protocol to handle image upload and metadata generation:</p>

        <div className="code-block">
          <pre>{`import { createLoyaltyProgram } from '@verxioprotocol/core'
import { generateSigner } from '@metaplex-foundation/umi'
import fs from 'fs'

const imageBuffer = fs.readFileSync('logo.png')
const result = await createLoyaltyProgram(context, {
  loyaltyProgramName: 'Coffee Brew Rewards',
  imageBuffer, // Buffer of your image
  imageFilename: 'logo.png',
  programAuthority: context.programAuthority,
  updateAuthority: generateSigner(context.umi), // Optional: Provide custom update authority
  metadata: {
    organizationName: 'Coffee Brew', // Required: Name of the host/organization
    brandColor: '#FF5733', // Optional: Brand color for UI customization
  },
  tiers: [
    {
      name: 'Bronze',
      xpRequired: 500,
      rewards: ['2% cashback'],
    },
    {
      name: 'Silver',
      xpRequired: 1000,
      rewards: ['5% cashback'],
    },
  ],
  pointsPerAction: {
    purchase: 100,
    review: 50,
  },
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
                <span className="param-name">loyaltyProgramName</span>
              </td>
              <td>
                <span className="param-type">string</span>
              </td>
              <td>✅</td>
              <td>Display name for your loyalty program</td>
            </tr>
            <tr>
              <td>
                <span className="param-name">metadataUri</span>
              </td>
              <td>
                <span className="param-type">string</span>
              </td>
              <td>❌</td>
              <td>URI pointing to the program's metadata JSON (if not providing imageBuffer)</td>
            </tr>
            <tr>
              <td>
                <span className="param-name">imageBuffer</span>
              </td>
              <td>
                <span className="param-type">Buffer</span>
              </td>
              <td>❌</td>
              <td>Buffer of your image file (if not providing metadataUri)</td>
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
                <span className="param-name">programAuthority</span>
              </td>
              <td>
                <span className="param-type">Signer</span>
              </td>
              <td>✅</td>
              <td>The authority that can manage this program</td>
            </tr>
            <tr>
              <td>
                <span className="param-name">updateAuthority</span>
              </td>
              <td>
                <span className="param-type">Signer</span>
              </td>
              <td>❌</td>
              <td>Authority for program updates (optional)</td>
            </tr>
            <tr>
              <td>
                <span className="param-name">metadata.organizationName</span>
              </td>
              <td>
                <span className="param-type">string</span>
              </td>
              <td>✅</td>
              <td>Name of your organization</td>
            </tr>
            <tr>
              <td>
                <span className="param-name">metadata.brandColor</span>
              </td>
              <td>
                <span className="param-type">string</span>
              </td>
              <td>❌</td>
              <td>Hex color code for UI customization</td>
            </tr>
            <tr>
              <td>
                <span className="param-name">tiers</span>
              </td>
              <td>
                <span className="param-type">Array&lt;Tier&gt;</span>
              </td>
              <td>✅</td>
              <td>Array of tier definitions with names, XP requirements, and rewards</td>
            </tr>
            <tr>
              <td>
                <span className="param-name">pointsPerAction</span>
              </td>
              <td>
                <span className="param-type">Record&lt;string, number&gt;</span>
              </td>
              <td>✅</td>
              <td>Points awarded for different user actions</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Tier Object */}
      <div className="doc-section">
        <h3>Tier Object Structure</h3>
        <p>
          Each tier in the <code className="inline-code">tiers</code> array should follow this structure:
        </p>

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
                <span className="param-name">name</span>
              </td>
              <td>
                <span className="param-type">string</span>
              </td>
              <td>Display name for the tier (e.g., "Bronze", "Silver")</td>
            </tr>
            <tr>
              <td>
                <span className="param-name">xpRequired</span>
              </td>
              <td>
                <span className="param-type">number</span>
              </td>
              <td>Points required to reach this tier</td>
            </tr>
            <tr>
              <td>
                <span className="param-name">rewards</span>
              </td>
              <td>
                <span className="param-type">string[]</span>
              </td>
              <td>Array of reward descriptions for this tier</td>
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
  collection: KeypairSigner,      // The collection signer for the program
  signature: string,              // Transaction signature
  updateAuthority?: KeypairSigner // Update authority (if provided)
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
                <span className="param-name">collection</span>
              </td>
              <td>
                <span className="param-type">KeypairSigner</span>
              </td>
              <td>The generated collection keypair that represents your loyalty program</td>
            </tr>
            <tr>
              <td>
                <span className="param-name">signature</span>
              </td>
              <td>
                <span className="param-type">string</span>
              </td>
              <td>The transaction signature confirming the program creation</td>
            </tr>
            <tr>
              <td>
                <span className="param-name">updateAuthority</span>
              </td>
              <td>
                <span className="param-type">KeypairSigner</span>
              </td>
              <td>The update authority for the loyalty program (if provided)</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Error Handling */}
      <div className="doc-section">
        <h2>Error Handling</h2>
        <p>The function will throw errors in the following cases:</p>

        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li><strong>Invalid configuration:</strong> Missing required parameters or invalid parameter values</li>
          <li><strong>Image upload failure:</strong> If using imageBuffer and the upload fails</li>
          <li><strong>Metadata generation failure:</strong> If metadata cannot be generated from the provided data</li>
          <li><strong>Transaction failure:</strong> If the blockchain transaction fails</li>
          <li><strong>Insufficient funds:</strong> If the fee payer doesn't have enough SOL for the transaction</li>
        </ul>

        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-semibold text-yellow-800 mb-2">Important Notes</h4>
          <ul className="text-yellow-700 text-sm space-y-1">
            <li>• You must provide either <code className="inline-code">metadataUri</code> OR <code className="inline-code">imageBuffer</code> with <code className="inline-code">imageFilename</code></li>
            <li>• The <code className="inline-code">organizationName</code> in metadata is required</li>
            <li>• At least one tier must be defined in the <code className="inline-code">tiers</code> array</li>
            <li>• The protocol fee for creating a loyalty program is 0.002 SOL</li>
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
                <a href="/issue-pass" className="text-blue-600 hover:underline">
                  Issue Loyalty Pass
                </a>
                - Create loyalty passes for users
              </li>
              <li>
                <a href="/update-program" className="text-blue-600 hover:underline">
                  Update Loyalty Program
                </a>
                - Modify tiers and point values
              </li>
              <li>
                <a href="/award-points" className="text-blue-600 hover:underline">
                  Award Points
                </a>
                - Give points to users for actions
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
                <a href="/create-voucher-collection" className="text-blue-600 hover:underline">
                  Voucher Management
                </a>
                - Create and manage vouchers
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
