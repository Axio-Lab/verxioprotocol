'use client'

export default function GetAssetDataPage() {
  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Get Asset Data</h1>
        <p className="text-lg text-gray-600">
          Retrieve comprehensive information about a loyalty pass including points, tier status, activity history, and
          program metadata.
        </p>
      </div>

      <div className="doc-section">
        <h2>Overview</h2>
        <p>
          The <code className="inline-code">getAssetData</code> function fetches all data associated with a loyalty
          pass, providing a complete view of the user's status and history.
        </p>

        <div className="code-block">
          <pre>{`import { getAssetData } from '@verxioprotocol/core'

const assetData = await getAssetData(context, publicKey('PASS_ADDRESS'))

console.log('User XP:', assetData.xp)
console.log('Current Tier:', assetData.currentTier)
console.log('Owner:', assetData.owner)`}</pre>
        </div>
      </div>

      <div className="doc-section">
        <h2>Return Value</h2>
        <p>The function returns a comprehensive object with all loyalty pass data:</p>

        <div className="code-block">
          <pre>{`{
  xp: number,              // Current XP points
  lastAction: string | null, // Last action performed
  actionHistory: Array<{   // History of actions
    type: string,
    points: number,
    timestamp: number,
    newTotal: number
  }>,
  currentTier: string,     // Current tier name
  tierUpdatedAt: number,   // Timestamp of last tier update
  rewards: string[],       // Available rewards
  name: string,           // Asset name
  uri: string,            // Asset metadata URI
  owner: string,          // Asset owner address
  pass: string,           // Pass public key
  metadata: {             // Program metadata
    organizationName: string,
    brandColor?: string
  },
  rewardTiers: Array<{    // All available reward tiers
    name: string,
    xpRequired: number,
    rewards: string[]
  }>
}`}</pre>
        </div>
      </div>

      <div className="doc-section">
        <h2>Data Fields</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card">
            <h4 className="font-semibold mb-2 text-blue-600">📊 Points & Tier</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>
                <code className="inline-code">xp</code> - Current points
              </li>
              <li>
                <code className="inline-code">currentTier</code> - Current tier
              </li>
              <li>
                <code className="inline-code">tierUpdatedAt</code> - Last tier change
              </li>
            </ul>
          </div>
          <div className="card">
            <h4 className="font-semibold mb-2 text-green-600">📈 Activity</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>
                <code className="inline-code">lastAction</code> - Most recent action
              </li>
              <li>
                <code className="inline-code">actionHistory</code> - Complete history
              </li>
              <li>
                <code className="inline-code">rewards</code> - Available rewards
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
