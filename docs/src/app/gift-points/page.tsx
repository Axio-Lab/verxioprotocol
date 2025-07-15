'use client'

export default function GiftPointsPage() {
  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Gift Loyalty Points</h1>
        <p className="text-lg text-gray-600">
          Award bonus points to users for special occasions, promotions, or custom actions. Gift points with a custom
          reason that gets tracked in the user's activity history.
        </p>
      </div>

      <div className="doc-section">
        <h2>Overview</h2>
        <p>
          The <code className="inline-code">giftLoyaltyPoints</code> function allows you to award points to users with a
          custom action reason, perfect for special promotions, bonuses, or manual rewards.
        </p>

        <div className="code-block">
          <pre>{`import { giftLoyaltyPoints } from '@verxioprotocol/core'

const result = await giftLoyaltyPoints(context, {
  passAddress: publicKey('USER_PASS_ADDRESS'),
  pointsToGift: 500,
  signer: updateAuthority,
  action: 'birthday_bonus'  // Custom action name
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
              <td>The loyalty pass address to gift points to</td>
            </tr>
            <tr>
              <td>
                <span className="param-name">pointsToGift</span>
              </td>
              <td>
                <span className="param-type">number</span>
              </td>
              <td>✅</td>
              <td>Number of points to gift (must be positive)</td>
            </tr>
            <tr>
              <td>
                <span className="param-name">signer</span>
              </td>
              <td>
                <span className="param-type">Signer</span>
              </td>
              <td>✅</td>
              <td>Program authority required for gifting points</td>
            </tr>
            <tr>
              <td>
                <span className="param-name">action</span>
              </td>
              <td>
                <span className="param-type">string</span>
              </td>
              <td>✅</td>
              <td>Custom reason for gifting (e.g., 'bonus', 'promotion')</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="doc-section">
        <h2>Common Gift Scenarios</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card">
            <h4 className="font-semibold mb-2 text-pink-600">🎂 Birthday Bonus</h4>
            <p className="text-sm text-gray-600">Special points for user birthdays</p>
            <code className="inline-code text-xs">action: 'birthday_bonus'</code>
          </div>
          <div className="card">
            <h4 className="font-semibold mb-2 text-green-600">🎉 Welcome Gift</h4>
            <p className="text-sm text-gray-600">Welcome bonus for new users</p>
            <code className="inline-code text-xs">action: 'welcome_gift'</code>
          </div>
          <div className="card">
            <h4 className="font-semibold mb-2 text-blue-600">🏆 Achievement</h4>
            <p className="text-sm text-gray-600">Reward for reaching milestones</p>
            <code className="inline-code text-xs">action: 'achievement'</code>
          </div>
          <div className="card">
            <h4 className="font-semibold mb-2 text-purple-600">💝 Holiday Bonus</h4>
            <p className="text-sm text-gray-600">Seasonal promotions and holidays</p>
            <code className="inline-code text-xs">action: 'holiday_bonus'</code>
          </div>
        </div>
      </div>
    </div>
  )
}
