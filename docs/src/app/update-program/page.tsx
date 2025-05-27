'use client'

import UpdateLoyaltyProgramForm from '../components/UpdateLoyaltyProgramForm'

export default function UpdateProgramPage() {
  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Update Loyalty Program</h1>
        <p className="text-lg text-gray-600">
          Modify existing loyalty program parameters including point allocation rules and tier configurations. This
          function allows you to update both the rewards structure and tier requirements without creating a new program.
        </p>
      </div>

      {/* Function Overview */}
      <div className="doc-section">
        <h2>Overview</h2>
        <p>
          The <code className="inline-code">updateLoyaltyProgram</code> function enables you to modify an existing
          loyalty program's configuration. You can update points per action, modify tier structures, or both
          simultaneously while preserving existing user data and loyalty passes.
        </p>

        <div className="code-block">
          <pre>{`import { updateLoyaltyProgram } from '@verxioprotocol/core'

// Update points per action only
const result = await updateLoyaltyProgram(context, {
  collectionAddress: publicKey('COLLECTION_ADDRESS'),
  programAuthority: context.programAuthority,
  updateAuthority: programAuthority,
  newPointsPerAction: {
    purchase: 150,    // Updated from 100
    review: 75,       // Updated from 50
    referral: 300     // New action type
  }
})

// Update tiers only
const result = await updateLoyaltyProgram(context, {
  collectionAddress: publicKey('COLLECTION_ADDRESS'),
  programAuthority: context.programAuthority,
  updateAuthority: programAuthority,
  newTiers: [
    { name: 'Bronze', xpRequired: 400, rewards: ['3% cashback'] },
    { name: 'Silver', xpRequired: 1000, rewards: ['7% cashback'] },
    { name: 'Gold', xpRequired: 2500, rewards: ['12% cashback'] }
  ]
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
              <td>The collection address of the loyalty program to update</td>
            </tr>
            <tr>
              <td>
                <span className="param-name">programAuthority</span>
              </td>
              <td>
                <span className="param-type">Signer</span>
              </td>
              <td>✅</td>
              <td>The program authority (must match the original authority)</td>
            </tr>
            <tr>
              <td>
                <span className="param-name">updateAuthority</span>
              </td>
              <td>
                <span className="param-type">Signer</span>
              </td>
              <td>✅</td>
              <td>The update authority for the program</td>
            </tr>
            <tr>
              <td>
                <span className="param-name">newPointsPerAction</span>
              </td>
              <td>
                <span className="param-type">Record&lt;string, number&gt;</span>
              </td>
              <td>❌</td>
              <td>Updated points allocation for different actions</td>
            </tr>
            <tr>
              <td>
                <span className="param-name">newTiers</span>
              </td>
              <td>
                <span className="param-type">Array&lt;Tier&gt;</span>
              </td>
              <td>❌</td>
              <td>Updated tier configuration (must include 'Grind' tier)</td>
            </tr>
          </tbody>
        </table>

        <div className="card mt-6">
          <h4 className="font-semibold mb-2 text-blue-600">⚠️ Important Note</h4>
          <p className="text-sm text-gray-600">
            At least one of <code className="inline-code">newPointsPerAction</code> or{' '}
            <code className="inline-code">newTiers</code> must be provided. You cannot call this function without
            specifying what to update.
          </p>
        </div>
      </div>

      {/* Tier Requirements */}
      <div className="doc-section">
        <h3>Tier Update Requirements</h3>
        <p>When updating tiers, you must follow these rules:</p>

        <div className="card">
          <h4 className="font-semibold mb-2">🎯 Tier Structure Rules</h4>
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
            <li>
              A tier named "Grind" with <code className="inline-code">xpRequired: 0</code> must always exist as the
              first tier
            </li>
            <li>Tiers must be ordered by increasing XP requirements</li>
            <li>XP requirements must be positive numbers (except for Grind tier)</li>
            <li>Tier names should be unique within the program</li>
            <li>Existing users will be automatically re-evaluated against new tier thresholds</li>
          </ul>
        </div>
      </div>

      {/* Return Value */}
      <div className="doc-section">
        <h2>Return Value</h2>
        <p>The function returns a Promise that resolves to an object containing:</p>

        <div className="code-block">
          <pre>{`{
  signature: string    // Transaction signature confirming the update
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
                <span className="param-name">signature</span>
              </td>
              <td>
                <span className="param-type">string</span>
              </td>
              <td>The transaction signature confirming the program update</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Examples */}
      <div className="doc-section">
        <h2>Usage Examples</h2>

        <h3>Update Points Per Action</h3>
        <p>Modify how many points users earn for different actions:</p>
        <div className="code-block">
          <pre>{`// Increase points for purchases and add new action types
const result = await updateLoyaltyProgram(context, {
  collectionAddress: publicKey('YOUR_COLLECTION_ADDRESS'),
  programAuthority: context.programAuthority,
  updateAuthority: updateAuthority,
  newPointsPerAction: {
    purchase: 150,      // Increased from 100
    review: 75,         // Increased from 50
    referral: 200,      // New action type
    socialShare: 25,    // New action type
    newsletter: 50      // New action type
  }
})`}</pre>
        </div>

        <h3>Update Tier Structure</h3>
        <p>Modify tier requirements and rewards:</p>
        <div className="code-block">
          <pre>{`// Add new tier and adjust requirements
const result = await updateLoyaltyProgram(context, {
  collectionAddress: publicKey('YOUR_COLLECTION_ADDRESS'),
  programAuthority: context.programAuthority,
  updateAuthority: updateAuthority,
  newTiers: [
    { 
      name: 'Grind', 
      xpRequired: 0, 
      rewards: ['Welcome bonus'] 
    },
    { 
      name: 'Bronze', 
      xpRequired: 300,  // Lowered from 500 
      rewards: ['5% discount', 'Free shipping'] 
    },
    { 
      name: 'Silver', 
      xpRequired: 1000, 
      rewards: ['10% discount', 'Priority support'] 
    },
    { 
      name: 'Gold', 
      xpRequired: 2500, 
      rewards: ['15% discount', 'Exclusive access'] 
    },
    { 
      name: 'Platinum',  // New tier
      xpRequired: 5000, 
      rewards: ['20% discount', 'Personal concierge'] 
    }
  ]
})`}</pre>
        </div>

        <h3>Update Both Simultaneously</h3>
        <p>Modify both points and tiers in a single transaction:</p>
        <div className="code-block">
          <pre>{`const result = await updateLoyaltyProgram(context, {
  collectionAddress: publicKey('YOUR_COLLECTION_ADDRESS'),
  programAuthority: context.programAuthority,
  updateAuthority: updateAuthority,
  newPointsPerAction: {
    purchase: 120,
    review: 60,
    checkin: 30
  },
  newTiers: [
    { name: 'Grind', xpRequired: 0, rewards: ['Welcome'] },
    { name: 'Explorer', xpRequired: 400, rewards: ['5% off'] },
    { name: 'Adventurer', xpRequired: 1200, rewards: ['10% off'] },
    { name: 'Legend', xpRequired: 3000, rewards: ['15% off'] }
  ]
})`}</pre>
        </div>
      </div>

      {/* Interactive Testing */}
      <div className="doc-section">
        <h2>Interactive Testing</h2>
        <p>
          Test the update functionality with the form below. You'll need an existing loyalty program collection address.
        </p>

        <div className="interactive-section">
          <h3>Update Loyalty Program</h3>
          <UpdateLoyaltyProgramForm />
        </div>
      </div>

      {/* Best Practices */}
      <div className="doc-section">
        <h2>Best Practices</h2>
        <div className="space-y-4">
          <div className="card">
            <h4 className="font-semibold mb-2 text-green-600">✅ Do</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
              <li>Test updates on devnet before applying to mainnet</li>
              <li>Communicate tier changes to your users in advance</li>
              <li>Consider the impact on existing user progress</li>
              <li>Keep the "Grind" tier as your entry-level tier</li>
            </ul>
          </div>

          <div className="card">
            <h4 className="font-semibold mb-2 text-red-600">❌ Don't</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
              <li>Remove the "Grind" tier or set its XP requirement above 0</li>
              <li>Make tier requirements unreasonably high</li>
              <li>Update points too frequently as it may confuse users</li>
              <li>Decrease tier rewards without clear communication</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
