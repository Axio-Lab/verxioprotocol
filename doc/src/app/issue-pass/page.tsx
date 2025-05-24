'use client'

import IssueLoyaltyPassForm from '../components/IssueLoyaltyPassForm'

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

        <div className="code-block">
          <pre>{`import { issueLoyaltyPass } from '@verxioprotocol/core'

const result = await issueLoyaltyPass(context, {
  collectionAddress: publicKey('YOUR_COLLECTION_ADDRESS'),
  recipient: publicKey('USER_WALLET_ADDRESS'),
  passName: 'Coffee Rewards Pass',
  passMetadataUri: 'https://arweave.net/pass-metadata.json',
  assetSigner: generateSigner(context.umi),  // Optional
  updateAuthority: programAuthority
})`}</pre>
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
              <td>✅</td>
              <td>URI pointing to the pass's metadata JSON</td>
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
          </tbody>
        </table>
      </div>

      {/* Metadata Structure */}
      <div className="doc-section">
        <h3>Pass Metadata Structure</h3>
        <p>The loyalty pass metadata should follow this recommended structure:</p>

        <div className="code-block">
          <pre>{`{
  "name": "Coffee Rewards Pass",
  "description": "Premium membership pass for Brew's Coffee loyalty program",
  "image": "https://arweave.net/pass-image.png",
  "animation_url": "https://arweave.net/pass-animation.mp4", // Optional
  "attributes": [
    {
      "trait_type": "Program",
      "value": "Coffee Rewards"
    },
    {
      "trait_type": "Issue Date",
      "value": "2024-01-15"
    },
    {
      "trait_type": "Pass Type",
      "value": "Standard"
    }
  ],
  "properties": {
    "category": "utility",
    "creators": [
      {
        "address": "CREATOR_WALLET_ADDRESS",
        "share": 100
      }
    ]
  }
}`}</pre>
        </div>
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

      {/* Usage Examples */}
      <div className="doc-section">
        <h2>Usage Examples</h2>

        <h3>Basic Pass Issuance</h3>
        <p>Issue a standard loyalty pass to a new user:</p>
        <div className="code-block">
          <pre>{`import { issueLoyaltyPass } from '@verxioprotocol/core'
import { generateSigner, publicKey } from '@metaplex-foundation/umi'

const result = await issueLoyaltyPass(context, {
  collectionAddress: publicKey('YOUR_COLLECTION_ADDRESS'),
  recipient: publicKey('USER_WALLET_ADDRESS'),
  passName: 'VIP Coffee Pass',
  passMetadataUri: 'https://arweave.net/vip-pass-metadata.json',
  updateAuthority: programAuthority
})

console.log('Pass issued successfully!')
console.log('Pass address:', result.asset.publicKey.toString())
console.log('Transaction:', result.signature)`}</pre>
        </div>

        <h3>Bulk Pass Issuance</h3>
        <p>Issue multiple passes for a list of users:</p>
        <div className="code-block">
          <pre>{`const users = [
  { wallet: 'USER1_ADDRESS', name: 'Premium Pass #1' },
  { wallet: 'USER2_ADDRESS', name: 'Premium Pass #2' },
  { wallet: 'USER3_ADDRESS', name: 'Premium Pass #3' }
]

const results = []

for (const user of users) {
  try {
    const result = await issueLoyaltyPass(context, {
      collectionAddress: publicKey('YOUR_COLLECTION_ADDRESS'),
      recipient: publicKey(user.wallet),
      passName: user.name,
      passMetadataUri: 'https://arweave.net/standard-pass-metadata.json',
      updateAuthority: programAuthority
    })
    
    results.push({
      user: user.wallet,
      passAddress: result.asset.publicKey.toString(),
      signature: result.signature
    })
    
    console.log(\`Pass issued to \${user.wallet}\`)
  } catch (error) {
    console.error(\`Failed to issue pass to \${user.wallet}:\`, error)
  }
}

console.log('Bulk issuance completed:', results)`}</pre>
        </div>

        <h3>Custom Pass with Signer</h3>
        <p>Issue a pass with a predetermined address:</p>
        <div className="code-block">
          <pre>{`// Generate a specific signer for the pass
const customPassSigner = generateSigner(context.umi)

const result = await issueLoyaltyPass(context, {
  collectionAddress: publicKey('YOUR_COLLECTION_ADDRESS'),
  recipient: publicKey('USER_WALLET_ADDRESS'),
  passName: 'Founder Pass #001',
  passMetadataUri: 'https://arweave.net/founder-pass-metadata.json',
  assetSigner: customPassSigner,
  updateAuthority: programAuthority
})

// The pass will have the predetermined address
console.log('Predetermined pass address:', customPassSigner.publicKey.toString())
console.log('Actual pass address:', result.asset.publicKey.toString())
// These should match`}</pre>
        </div>
      </div>

      {/* Interactive Testing */}
      <div className="doc-section">
        <h2>Interactive Testing</h2>
        <p>
          Test issuing a loyalty pass using the form below. Make sure you have a valid collection address from a created
          loyalty program.
        </p>

        <div className="interactive-section">
          <h3>Issue Loyalty Pass</h3>
          <IssueLoyaltyPassForm />
        </div>
      </div>

      {/* Initial Pass State */}
      <div className="doc-section">
        <h2>Initial Pass State</h2>
        <p>When a loyalty pass is first issued, it starts with the following default values:</p>

        <div className="card">
          <h4 className="font-semibold mb-3 text-blue-600">📋 Default Pass Properties</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong className="text-gray-700">XP Points:</strong> 0
            </div>
            <div>
              <strong className="text-gray-700">Current Tier:</strong> Grind (lowest tier)
            </div>
            <div>
              <strong className="text-gray-700">Last Action:</strong> null
            </div>
            <div>
              <strong className="text-gray-700">Action History:</strong> Empty array
            </div>
            <div>
              <strong className="text-gray-700">Tier Updated At:</strong> Current timestamp
            </div>
            <div>
              <strong className="text-gray-700">Transfer Approval:</strong> Not required initially
            </div>
          </div>
        </div>
      </div>

      {/* Best Practices */}
      <div className="doc-section">
        <h2>Best Practices</h2>
        <div className="space-y-4">
          <div className="card">
            <h4 className="font-semibold mb-2 text-green-600">✅ Recommended Practices</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
              <li>Store pass metadata on permanent storage (Arweave, IPFS)</li>
              <li>Include meaningful attributes in metadata for discoverability</li>
              <li>Use descriptive pass names that include your brand</li>
              <li>Implement proper error handling for failed issuances</li>
              <li>Consider rate limiting to prevent spam issuance</li>
            </ul>
          </div>

          <div className="card">
            <h4 className="font-semibold mb-2 text-amber-600">⚠️ Important Considerations</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
              <li>Only issue one pass per user per program to avoid confusion</li>
              <li>Verify recipient addresses before issuing passes</li>
              <li>Keep track of issued passes for customer support</li>
              <li>Ensure metadata URIs are accessible and permanent</li>
            </ul>
          </div>

          <div className="card">
            <h4 className="font-semibold mb-2 text-red-600">❌ Common Mistakes</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
              <li>Using temporary or changing metadata URIs</li>
              <li>Issuing multiple passes to the same user</li>
              <li>Not validating recipient wallet addresses</li>
              <li>Missing proper error handling in batch operations</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
