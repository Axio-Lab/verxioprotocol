'use client'

import GetProgramDetailsForm from '../components/GetProgramDetailsForm'

export default function GetProgramDetailsPage() {
  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Get Program Details</h1>
        <p className="text-lg text-gray-600">
          Retrieve comprehensive information about a loyalty program including its configuration, tier structure, point
          allocation rules, and metadata.
        </p>
      </div>

      <div className="doc-section">
        <h2>Overview</h2>
        <p>
          The <code className="inline-code">getProgramDetails</code> function fetches all configuration data for a
          specific loyalty program collection, providing complete visibility into the program structure.
        </p>

        <div className="code-block">
          <pre>{`import { getProgramDetails } from '@verxioprotocol/core'

const programDetails = await getProgramDetails(context, publicKey('COLLECTION_ADDRESS'))

console.log('Program Name:', programDetails.name)
console.log('Points Per Action:', programDetails.pointsPerAction)
console.log('Available Tiers:', programDetails.tiers)`}</pre>
        </div>
      </div>

      <div className="doc-section">
        <h2>Parameters</h2>
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
              <td>The collection address of the loyalty program</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="doc-section">
        <h2>Return Value</h2>
        <p>The function returns a comprehensive object with all loyalty program configuration:</p>

        <div className="code-block">
          <pre>{`{
  name: string,                    // Program display name
  uri: string,                     // Program metadata URI
  collection: string,              // Collection public key
  updateAuthority: string,         // Update authority address
  metadata: {                      // Program metadata
    organizationName: string,
    brandColor?: string,
    description?: string
  },
  pointsPerAction: Record<string, number>, // Action point values
  tiers: Array<{                   // Reward tier structure
    name: string,
    xpRequired: number,
    rewards: string[]
  }>,
  totalPasses: number,             // Number of issued passes
  createdAt: number,               // Program creation timestamp
  lastUpdated: number              // Last modification timestamp
}`}</pre>
        </div>
      </div>

      <div className="doc-section">
        <h2>Interactive Testing</h2>
        <div className="interactive-section">
          <h3>Get Program Details</h3>
          <GetProgramDetailsForm />
        </div>
      </div>

      <div className="doc-section">
        <h2>Data Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card">
            <h4 className="font-semibold mb-2 text-blue-600">🏢 Program Info</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>
                <code className="inline-code">name</code> - Program display name
              </li>
              <li>
                <code className="inline-code">uri</code> - Metadata URI
              </li>
              <li>
                <code className="inline-code">collection</code> - Collection address
              </li>
              <li>
                <code className="inline-code">updateAuthority</code> - Authority address
              </li>
            </ul>
          </div>
          <div className="card">
            <h4 className="font-semibold mb-2 text-green-600">⚙️ Configuration</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>
                <code className="inline-code">pointsPerAction</code> - Point allocation
              </li>
              <li>
                <code className="inline-code">tiers</code> - Reward structure
              </li>
              <li>
                <code className="inline-code">metadata</code> - Brand information
              </li>
              <li>
                <code className="inline-code">totalPasses</code> - Pass count
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="doc-section">
        <h2>Usage Examples</h2>

        <h3>Basic Program Information</h3>
        <div className="code-block">
          <pre>{`const details = await getProgramDetails(context, collectionAddress)

// Display program overview
console.log(\`Program: \${details.name}\`)
console.log(\`Organization: \${details.metadata.organizationName}\`)
console.log(\`Total Passes Issued: \${details.totalPasses}\`)
console.log(\`Created: \${new Date(details.createdAt * 1000).toLocaleDateString()}\`)`}</pre>
        </div>

        <h3>Analyzing Point Structure</h3>
        <div className="code-block">
          <pre>{`const details = await getProgramDetails(context, collectionAddress)

// Review point allocation
console.log('Points per action:')
Object.entries(details.pointsPerAction).forEach(([action, points]) => {
  console.log(\`  \${action}: \${points} points\`)
})

// Find highest value action
const highestAction = Object.entries(details.pointsPerAction)
  .reduce((max, [action, points]) => points > max.points ? { action, points } : max, 
          { action: '', points: 0 })
console.log(\`Most valuable action: \${highestAction.action} (\${highestAction.points} pts)\`)`}</pre>
        </div>

        <h3>Tier Analysis</h3>
        <div className="code-block">
          <pre>{`const details = await getProgramDetails(context, collectionAddress)

// Display tier progression
console.log('Tier Structure:')
details.tiers.forEach((tier, index) => {
  console.log(\`\${index + 1}. \${tier.name}\`)
  console.log(\`   XP Required: \${tier.xpRequired}\`)
  console.log(\`   Rewards: \${tier.rewards.join(', ')}\`)
})

// Calculate progression gaps
for (let i = 1; i < details.tiers.length; i++) {
  const gap = details.tiers[i].xpRequired - details.tiers[i-1].xpRequired
  console.log(\`Gap from \${details.tiers[i-1].name} to \${details.tiers[i].name}: \${gap} XP\`)
}`}</pre>
        </div>
      </div>

      <div className="doc-section">
        <h2>Use Cases</h2>
        <div className="space-y-4">
          <div className="card">
            <h4 className="font-semibold mb-2 text-purple-600">📊 Analytics Dashboard</h4>
            <p className="text-sm text-gray-600">Build admin dashboards showing program configuration and statistics</p>
          </div>
          <div className="card">
            <h4 className="font-semibold mb-2 text-orange-600">🔧 Configuration Audit</h4>
            <p className="text-sm text-gray-600">Verify program settings before making updates or changes</p>
          </div>
          <div className="card">
            <h4 className="font-semibold mb-2 text-blue-600">🎯 User Interfaces</h4>
            <p className="text-sm text-gray-600">Display program information and tier progression to users</p>
          </div>
          <div className="card">
            <h4 className="font-semibold mb-2 text-green-600">📈 Optimization</h4>
            <p className="text-sm text-gray-600">Analyze point allocation and tier gaps for program optimization</p>
          </div>
        </div>
      </div>
    </div>
  )
}
