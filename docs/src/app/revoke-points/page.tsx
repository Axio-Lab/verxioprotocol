'use client'

export default function RevokePointsPage() {
  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Revoke Loyalty Points</h1>
        <p className="text-lg text-gray-600">
          Remove points from a user's loyalty pass. This function can trigger tier downgrades if the user's points fall
          below their current tier threshold.
        </p>
      </div>

      <div className="doc-section">
        <h2>Overview</h2>
        <p>
          The <code className="inline-code">revokeLoyaltyPoints</code> function removes a specified number of points
          from a user's loyalty pass and automatically recalculates their tier status.
        </p>

        <div className="code-block">
          <pre>{`import { revokeLoyaltyPoints } from '@verxioprotocol/core'

const result = await revokeLoyaltyPoints(context, {
  passAddress: publicKey('USER_PASS_ADDRESS'),
  pointsToRevoke: 100,
  signer: programAuthority
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
                <span className="param-name">passAddress</span>
              </td>
              <td>
                <span className="param-type">PublicKey</span>
              </td>
              <td>✅</td>
              <td>The loyalty pass address to revoke points from</td>
            </tr>
            <tr>
              <td>
                <span className="param-name">pointsToRevoke</span>
              </td>
              <td>
                <span className="param-type">number</span>
              </td>
              <td>✅</td>
              <td>Number of points to remove (must be positive)</td>
            </tr>
            <tr>
              <td>
                <span className="param-name">signer</span>
              </td>
              <td>
                <span className="param-type">Signer</span>
              </td>
              <td>✅</td>
              <td>Program authority required for revoking points</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="doc-section">
        <h2>Use Cases</h2>
        <div className="space-y-4">
          <div className="card">
            <h4 className="font-semibold mb-2 text-red-600">⚠️ Refunds</h4>
            <p className="text-sm text-gray-600">Remove points when users return purchases or cancel orders</p>
          </div>
          <div className="card">
            <h4 className="font-semibold mb-2 text-orange-600">🔄 Corrections</h4>
            <p className="text-sm text-gray-600">Fix incorrectly awarded points due to system errors</p>
          </div>
          <div className="card">
            <h4 className="font-semibold mb-2 text-yellow-600">🚫 Violations</h4>
            <p className="text-sm text-gray-600">Penalize users for policy violations or abuse</p>
          </div>
        </div>
      </div>
    </div>
  )
}
