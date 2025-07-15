'use client'

export default function BroadcastsPage() {
  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Send Broadcast</h1>
        <p className="text-lg text-gray-600">
          Send announcements to all holders of your loyalty program. Broadcasts are visible to every pass holder and are
          perfect for program-wide updates and promotions.
        </p>
      </div>

      <div className="doc-section">
        <h2>Overview</h2>
        <p>
          The <code className="inline-code">sendBroadcast</code> function sends a message to all loyalty pass holders in
          your program simultaneously, ideal for announcements and promotions.
        </p>

        <div className="code-block">
          <pre>{`import { sendBroadcast } from '@verxioprotocol/core'

// Send to all holders
const result = await sendBroadcast(context, {
  collectionAddress: publicKey('COLLECTION_ADDRESS'),
  message: 'New rewards program launching next month!',
  sender: programAuthority.publicKey,
  signer: updateAuthority
})

// Send to specific tier holders
const tierResult = await sendBroadcast(context, {
  collectionAddress: publicKey('COLLECTION_ADDRESS'),
  message: 'VIP announcement for Gold members',
  sender: programAuthority.publicKey,
  signer: updateAuthority
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
                <span className="param-name">message</span>
              </td>
              <td>
                <span className="param-type">string</span>
              </td>
              <td>✅</td>
              <td>The broadcast message content</td>
            </tr>
            <tr>
              <td>
                <span className="param-name">sender</span>
              </td>
              <td>
                <span className="param-type">PublicKey</span>
              </td>
              <td>✅</td>
              <td>Public key of the broadcast sender</td>
            </tr>
            <tr>
              <td>
                <span className="param-name">signer</span>
              </td>
              <td>
                <span className="param-type">Signer</span>
              </td>
              <td>✅</td>
              <td>Program authority required for sending broadcasts</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="doc-section">
        <h2>Broadcast Use Cases</h2>
        <div className="space-y-4">
          <div className="card">
            <h4 className="font-semibold mb-2 text-blue-600">📢 Program Updates</h4>
            <p className="text-sm text-gray-600 mb-3">
              Notify all members about program changes, new features, or policy updates
            </p>
            <code className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
              "We're updating our rewards structure effective next month"
            </code>
          </div>

          <div className="card">
            <h4 className="font-semibold mb-2 text-green-600">🎉 Promotions</h4>
            <p className="text-sm text-gray-600 mb-3">Announce special offers, sales, or limited-time promotions</p>
            <code className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded">
              "Double points weekend - earn 2x rewards on all purchases!"
            </code>
          </div>

          <div className="card">
            <h4 className="font-semibold mb-2 text-purple-600">🏆 Achievements</h4>
            <p className="text-sm text-gray-600 mb-3">Celebrate community milestones and program achievements</p>
            <code className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded">
              "We've reached 10,000 members! Thank you for your loyalty"
            </code>
          </div>

          <div className="card">
            <h4 className="font-semibold mb-2 text-orange-600">⚠️ Important Notices</h4>
            <p className="text-sm text-gray-600 mb-3">Share critical information about system maintenance or changes</p>
            <code className="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded">
              "System maintenance scheduled for this weekend"
            </code>
          </div>
        </div>
      </div>

      <div className="doc-section">
        <h2>Best Practices</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card">
            <h4 className="font-semibold mb-2 text-green-600">✅ Do</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
              <li>Keep messages concise and clear</li>
              <li>Include relevant dates and deadlines</li>
              <li>Use engaging, friendly language</li>
              <li>Test on devnet first</li>
            </ul>
          </div>
          <div className="card">
            <h4 className="font-semibold mb-2 text-red-600">❌ Don't</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
              <li>Send too many broadcasts (spam)</li>
              <li>Use overly technical language</li>
              <li>Forget to include call-to-actions</li>
              <li>Send without proofreading</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
