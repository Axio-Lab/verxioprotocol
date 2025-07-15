'use client'

export default function AwardPointsPage() {
  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Award Loyalty Points</h1>
        <p className="text-lg text-gray-600">
          Grant loyalty points to users based on their actions. Points are automatically calculated based on your
          program's point allocation rules and can trigger tier upgrades.
        </p>
      </div>

      <div className="doc-section">
        <h2>Overview</h2>
        <p>
          The <code className="inline-code">awardLoyaltyPoints</code> function adds points to a user's loyalty pass
          based on a specific action type. The system automatically calculates tier progression and updates the user's
          status.
        </p>

        <div className="code-block">
          <pre>{`import { awardLoyaltyPoints } from '@verxioprotocol/core'

const result = await awardLoyaltyPoints(context, {
  passAddress: publicKey('USER_PASS_ADDRESS'),
  action: 'purchase',
  signer: programAuthority,
  multiplier: 2  // Optional: 2x points for this action
})`}</pre>
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
                <span className="param-name">passAddress</span>
              </td>
              <td>
                <span className="param-type">PublicKey</span>
              </td>
              <td>✅</td>
              <td>The loyalty pass address to award points to</td>
            </tr>
            <tr>
              <td>
                <span className="param-name">action</span>
              </td>
              <td>
                <span className="param-type">string</span>
              </td>
              <td>✅</td>
              <td>Action type (must be defined in program's pointsPerAction)</td>
            </tr>
            <tr>
              <td>
                <span className="param-name">signer</span>
              </td>
              <td>
                <span className="param-type">Signer</span>
              </td>
              <td>✅</td>
              <td>Program authority required for awarding points</td>
            </tr>
            <tr>
              <td>
                <span className="param-name">multiplier</span>
              </td>
              <td>
                <span className="param-type">number</span>
              </td>
              <td>❌</td>
              <td>Point multiplier (default: 1)</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="doc-section">
        <h2>Return Value</h2>
        <div className="code-block">
          <pre>{`{
  points: number,           // New total points
  signature: string,        // Transaction signature
  newTier?: LoyaltyProgramTier  // New tier if user was upgraded
}`}</pre>
        </div>
      </div>

      <div className="doc-section">
        <h2>Common Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card">
            <h4 className="font-semibold mb-2">🛒 Purchase</h4>
            <p className="text-sm text-gray-600">Award points when users make purchases</p>
            <code className="inline-code text-xs">action: 'purchase'</code>
          </div>
          <div className="card">
            <h4 className="font-semibold mb-2">⭐ Review</h4>
            <p className="text-sm text-gray-600">Reward users for leaving product reviews</p>
            <code className="inline-code text-xs">action: 'review'</code>
          </div>
          <div className="card">
            <h4 className="font-semibold mb-2">👥 Referral</h4>
            <p className="text-sm text-gray-600">Bonus points for referring new customers</p>
            <code className="inline-code text-xs">action: 'referral'</code>
          </div>
          <div className="card">
            <h4 className="font-semibold mb-2">📱 Social Share</h4>
            <p className="text-sm text-gray-600">Points for social media engagement</p>
            <code className="inline-code text-xs">action: 'socialShare'</code>
          </div>
        </div>
      </div>
    </div>
  )
}
