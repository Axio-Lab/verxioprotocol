'use client'

export default function MessagingPage() {
  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Send Message</h1>
        <p className="text-lg text-gray-600">
          Send direct messages to individual loyalty pass holders. Messages are stored on-chain and can be retrieved by
          the pass owner.
        </p>
      </div>

      <div className="doc-section">
        <h2>Overview</h2>
        <p>
          The <code className="inline-code">sendMessage</code> function allows program administrators to send
          personalized messages directly to loyalty pass holders.
        </p>

        <div className="code-block">
          <pre>{`import { sendMessage } from '@verxioprotocol/core'

const result = await sendMessage(context, {
  passAddress: publicKey('USER_PASS_ADDRESS'),
  message: 'Welcome to our VIP program!',
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
                <span className="param-name">passAddress</span>
              </td>
              <td>
                <span className="param-type">PublicKey</span>
              </td>
              <td>✅</td>
              <td>The loyalty pass address to send message to</td>
            </tr>
            <tr>
              <td>
                <span className="param-name">message</span>
              </td>
              <td>
                <span className="param-type">string</span>
              </td>
              <td>✅</td>
              <td>The message content to send</td>
            </tr>
            <tr>
              <td>
                <span className="param-name">sender</span>
              </td>
              <td>
                <span className="param-type">PublicKey</span>
              </td>
              <td>✅</td>
              <td>Public key of the message sender</td>
            </tr>
            <tr>
              <td>
                <span className="param-name">signer</span>
              </td>
              <td>
                <span className="param-type">Signer</span>
              </td>
              <td>✅</td>
              <td>Program authority required for sending messages</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="doc-section">
        <h2>Message Types</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card">
            <h4 className="font-semibold mb-2 text-blue-600">🎉 Welcome Messages</h4>
            <p className="text-sm text-gray-600">Personalized welcome messages for new members</p>
          </div>
          <div className="card">
            <h4 className="font-semibold mb-2 text-green-600">🏆 Tier Upgrades</h4>
            <p className="text-sm text-gray-600">Congratulations on reaching new tiers</p>
          </div>
          <div className="card">
            <h4 className="font-semibold mb-2 text-purple-600">🎁 Special Offers</h4>
            <p className="text-sm text-gray-600">Exclusive offers for loyal customers</p>
          </div>
          <div className="card">
            <h4 className="font-semibold mb-2 text-orange-600">📅 Reminders</h4>
            <p className="text-sm text-gray-600">Expiration dates and important updates</p>
          </div>
        </div>
      </div>
    </div>
  )
}
