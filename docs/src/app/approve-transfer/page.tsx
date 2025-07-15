'use client'

export default function ApproveTransferPage() {
  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Approve Transfer</h1>
        <p className="text-lg text-gray-600">
          Grant approval for loyalty pass transfers between wallets. This function manages transfer permissions and
          ensures proper ownership transitions while maintaining program integrity.
        </p>
      </div>

      <div className="doc-section">
        <h2>Overview</h2>
        <p>
          The <code className="inline-code">approveTransfer</code> function enables program administrators to approve or
          manage transfers of loyalty passes between users, providing control over pass ownership changes.
        </p>

        <div className="code-block">
          <pre>{`import { approveTransfer } from '@verxioprotocol/core'

const result = await approveTransfer(context, {
  passAddress: publicKey('LOYALTY_PASS_ADDRESS'),
  newOwner: publicKey('NEW_OWNER_WALLET'),
  approver: programAuthority,
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
              <td>The loyalty pass address to approve for transfer</td>
            </tr>
            <tr>
              <td>
                <span className="param-name">newOwner</span>
              </td>
              <td>
                <span className="param-type">PublicKey</span>
              </td>
              <td>✅</td>
              <td>The wallet address of the intended new owner</td>
            </tr>
            <tr>
              <td>
                <span className="param-name">approver</span>
              </td>
              <td>
                <span className="param-type">PublicKey</span>
              </td>
              <td>✅</td>
              <td>Public key of the transfer approver</td>
            </tr>
            <tr>
              <td>
                <span className="param-name">signer</span>
              </td>
              <td>
                <span className="param-type">Signer</span>
              </td>
              <td>✅</td>
              <td>Program authority required for approving transfers</td>
            </tr>
            <tr>
              <td>
                <span className="param-name">transferData</span>
              </td>
              <td>
                <span className="param-type">TransferMetadata</span>
              </td>
              <td>❌</td>
              <td>Additional transfer information (optional)</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="doc-section">
        <h2>Return Value</h2>
        <p>The function returns a Promise that resolves to an object containing:</p>

        <div className="code-block">
          <pre>{`{
  signature: string,           // Transaction signature
  transferId: string,          // Unique transfer identifier
  approvedAt: number,          // Approval timestamp
  transferStatus: 'approved'   // Transfer status
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
              <td>The transaction signature confirming the approval</td>
            </tr>
            <tr>
              <td>
                <span className="param-name">transferId</span>
              </td>
              <td>
                <span className="param-type">string</span>
              </td>
              <td>Unique identifier for tracking this transfer</td>
            </tr>
            <tr>
              <td>
                <span className="param-name">approvedAt</span>
              </td>
              <td>
                <span className="param-type">number</span>
              </td>
              <td>Unix timestamp when the transfer was approved</td>
            </tr>
            <tr>
              <td>
                <span className="param-name">transferStatus</span>
              </td>
              <td>
                <span className="param-type">string</span>
              </td>
              <td>Current status of the transfer approval</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="doc-section">
        <h2>Usage Examples</h2>

        <h3>Basic Transfer Approval</h3>
        <div className="code-block">
          <pre>{`// Approve a transfer request
const transferApproval = await approveTransfer(context, {
  passAddress: publicKey('LOYALTY_PASS_ADDRESS'),
  newOwner: publicKey('NEW_OWNER_WALLET'),
  approver: programAuthority.publicKey,
  signer: programAuthority
})

console.log('Transfer approved!')
console.log('Transfer ID:', transferApproval.transferId)
console.log('Transaction:', transferApproval.signature)`}</pre>
        </div>

        <h3>Transfer with Metadata</h3>
        <div className="code-block">
          <pre>{`// Approve transfer with additional metadata
const transferWithData = await approveTransfer(context, {
  passAddress: publicKey('LOYALTY_PASS_ADDRESS'),
  newOwner: publicKey('NEW_OWNER_WALLET'),
  approver: programAuthority.publicKey,
  signer: programAuthority,
  transferData: {
    reason: 'account_migration',
    notes: 'User requested account transfer',
    adminApprover: 'admin@company.com',
    transferDate: Date.now()
  }
})

console.log('Transfer with metadata approved:', transferWithData)`}</pre>
        </div>

        <h3>Batch Transfer Approvals</h3>
        <div className="code-block">
          <pre>{`// Approve multiple transfers
const transferRequests = [
  { passAddress: 'PASS_1', newOwner: 'OWNER_1' },
  { passAddress: 'PASS_2', newOwner: 'OWNER_2' },
  { passAddress: 'PASS_3', newOwner: 'OWNER_3' }
]

const approvalResults = []

for (const request of transferRequests) {
  try {
    const approval = await approveTransfer(context, {
      passAddress: publicKey(request.passAddress),
      newOwner: publicKey(request.newOwner),
      approver: programAuthority.publicKey,
      signer: programAuthority
    })
    
    approvalResults.push({
      passAddress: request.passAddress,
      transferId: approval.transferId,
      status: 'approved',
      signature: approval.signature
    })
    
    console.log(\`Approved transfer for pass \${request.passAddress}\`)
  } catch (error) {
    console.error(\`Failed to approve transfer for \${request.passAddress}:\`, error)
    approvalResults.push({
      passAddress: request.passAddress,
      status: 'failed',
      error: error.message
    })
  }
}

console.log('Batch approval results:', approvalResults)`}</pre>
        </div>
      </div>

      <div className="doc-section">
        <h2>Transfer Workflow</h2>
        <div className="space-y-4">
          <div className="card">
            <h4 className="font-semibold mb-2 text-blue-600">1️⃣ Transfer Request</h4>
            <p className="text-sm text-gray-600">
              User initiates a transfer request through your application or directly
            </p>
          </div>
          <div className="card">
            <h4 className="font-semibold mb-2 text-orange-600">2️⃣ Admin Review</h4>
            <p className="text-sm text-gray-600">Program administrators review the transfer request for validity</p>
          </div>
          <div className="card">
            <h4 className="font-semibold mb-2 text-green-600">3️⃣ Transfer Approval</h4>
            <p className="text-sm text-gray-600">
              Use this function to approve the transfer and enable ownership change
            </p>
          </div>
          <div className="card">
            <h4 className="font-semibold mb-2 text-purple-600">4️⃣ Ownership Transfer</h4>
            <p className="text-sm text-gray-600">The NFT pass ownership is transferred to the new wallet</p>
          </div>
        </div>
      </div>

      <div className="doc-section">
        <h2>Security Considerations</h2>
        <div className="space-y-4">
          <div className="card">
            <h4 className="font-semibold mb-2 text-red-600">🔒 Authority Control</h4>
            <p className="text-sm text-gray-600">
              Only program authorities can approve transfers. Ensure proper access control in your application.
            </p>
          </div>
          <div className="card">
            <h4 className="font-semibold mb-2 text-amber-600">⚠️ Verification Required</h4>
            <p className="text-sm text-gray-600">
              Always verify the legitimacy of transfer requests before approving them.
            </p>
          </div>
          <div className="card">
            <h4 className="font-semibold mb-2 text-blue-600">📋 Audit Trail</h4>
            <p className="text-sm text-gray-600">
              Maintain logs of all transfer approvals for compliance and auditing purposes.
            </p>
          </div>
        </div>
      </div>

      <div className="doc-section">
        <h2>Common Use Cases</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card">
            <h4 className="font-semibold mb-2 text-purple-600">🔄 Account Migration</h4>
            <p className="text-sm text-gray-600">Users switching to new wallets or consolidating accounts</p>
          </div>
          <div className="card">
            <h4 className="font-semibold mb-2 text-green-600">🎁 Gift Transfers</h4>
            <p className="text-sm text-gray-600">Transferring loyalty passes as gifts between family/friends</p>
          </div>
          <div className="card">
            <h4 className="font-semibold mb-2 text-blue-600">🏢 Corporate Transfers</h4>
            <p className="text-sm text-gray-600">Business account changes or employee transitions</p>
          </div>
          <div className="card">
            <h4 className="font-semibold mb-2 text-orange-600">🔧 Recovery Assistance</h4>
            <p className="text-sm text-gray-600">Helping users recover access to their loyalty programs</p>
          </div>
        </div>
      </div>

      <div className="doc-section">
        <h2>Best Practices</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card">
            <h4 className="font-semibold mb-2 text-green-600">✅ Recommended Practices</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
              <li>Implement a formal transfer request process</li>
              <li>Verify both source and destination wallets</li>
              <li>Maintain detailed transfer logs</li>
              <li>Notify users of transfer completion</li>
              <li>Set up automated approval workflows where appropriate</li>
            </ul>
          </div>
          <div className="card">
            <h4 className="font-semibold mb-2 text-red-600">❌ Things to Avoid</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
              <li>Approving transfers without proper verification</li>
              <li>Allowing unauthorized personnel to approve transfers</li>
              <li>Not maintaining audit trails</li>
              <li>Ignoring suspicious transfer patterns</li>
              <li>Lack of user communication during transfers</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
