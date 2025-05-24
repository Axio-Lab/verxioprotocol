'use client'

import CreateLoyaltyProgramForm from '../components/CreateLoyaltyProgramForm'

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

        <div className="code-block">
          <pre>{`import { createLoyaltyProgram } from '@verxioprotocol/core'

const result = await createLoyaltyProgram(context, {
  loyaltyProgramName: "Coffee Rewards Program",
  metadataUri: "https://arweave.net/metadata.json",
  programAuthority: context.programAuthority,
  updateAuthority: generateSigner(context.umi),
  metadata: {
    organizationName: "Coffee Brew Co.",
    brandColor: "#6366f1"
  },
  tiers: [
    {
      name: "Bronze",
      xpRequired: 500,
      rewards: ["2% cashback"]
    },
    {
      name: "Silver", 
      xpRequired: 1000,
      rewards: ["5% cashback", "Free birthday drink"]
    }
  ],
  pointsPerAction: {
    purchase: 100,
    review: 50
  }
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
              <td>✅</td>
              <td>URI pointing to the program's metadata JSON</td>
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
              <td>The update authority for the program (optional)</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Example */}
      <div className="doc-section">
        <h2>Complete Example</h2>
        <p>Here's a complete example showing how to create a coffee shop loyalty program:</p>

        <div className="code-block">
          <pre>{`import { initializeVerxio, createLoyaltyProgram } from '@verxioprotocol/core'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { generateSigner } from '@metaplex-foundation/umi'

// Initialize UMI and context
const umi = createUmi('https://api.devnet.solana.com')
const context = initializeVerxio(umi, programAuthority)

// Create the loyalty program
try {
  const result = await createLoyaltyProgram(context, {
    loyaltyProgramName: "Brew's Coffee Rewards",
    metadataUri: "https://arweave.net/coffee-metadata.json",
    programAuthority: context.programAuthority,
    updateAuthority: generateSigner(umi),
    metadata: {
      organizationName: "Brew's Coffee House",
      brandColor: "#8B4513"
    },
    tiers: [
      {
        name: "Coffee Lover",
        xpRequired: 0,
        rewards: ["Welcome drink discount"]
      },
      {
        name: "Espresso Expert", 
        xpRequired: 500,
        rewards: ["5% discount", "Free size upgrade"]
      },
      {
        name: "Caffeine Connoisseur",
        xpRequired: 1500,
        rewards: ["10% discount", "Free birthday drink", "Early access to new blends"]
      }
    ],
    pointsPerAction: {
      purchase: 100,        // 100 points per purchase
      review: 50,           // 50 points for leaving a review
      referral: 200,        // 200 points for successful referrals
      socialShare: 25       // 25 points for social media shares
    }
  })

  console.log('Program created successfully!')
  console.log('Collection address:', result.collection.publicKey.toString())
  console.log('Transaction signature:', result.signature)
  
} catch (error) {
  console.error('Error creating loyalty program:', error)
}`}</pre>
        </div>
      </div>

      {/* Interactive Testing */}
      <div className="doc-section">
        <h2>Interactive Testing</h2>
        <p>
          Try creating a loyalty program using the form below. Make sure you have connected your Solana wallet first.
        </p>

        <div className="interactive-section">
          <h3>Create Loyalty Program</h3>
          <CreateLoyaltyProgramForm />
        </div>
      </div>

      {/* Best Practices */}
      <div className="doc-section">
        <h2>Best Practices</h2>
        <div className="space-y-4">
          <div className="card">
            <h4 className="font-semibold mb-2">🎯 Tier Design</h4>
            <p className="text-muted text-sm">
              Design your tiers to encourage engagement. Start with achievable requirements for the first tier and
              gradually increase them. Consider offering meaningful rewards at each level.
            </p>
          </div>

          <div className="card">
            <h4 className="font-semibold mb-2">📝 Metadata</h4>
            <p className="text-muted text-sm">
              Store your metadata on a permanent storage solution like Arweave. Include program description, images, and
              any additional information about your loyalty program.
            </p>
          </div>

          <div className="card">
            <h4 className="font-semibold mb-2">⚡ Points Strategy</h4>
            <p className="text-muted text-sm">
              Balance your points-per-action carefully. Higher-value actions should award more points, and tier
              thresholds should be reachable but challenging.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
