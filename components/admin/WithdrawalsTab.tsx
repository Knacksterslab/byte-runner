export function WithdrawalsTab() {
  return (
    <div className="bg-gray-900 border-2 border-gray-700 rounded-lg p-6">
      <h2 className="text-2xl font-bold text-green-400 mb-4">Withdrawal Requests</h2>
      <p className="text-gray-400">Withdrawal management coming soon — check backend at /balance/withdrawals</p>
      <div className="mt-4 text-sm text-gray-500">
        <p>Features to implement:</p>
        <ul className="list-disc list-inside space-y-1 mt-2">
          <li>List all pending withdrawals</li>
          <li>Approve/Reject withdrawal requests</li>
          <li>Mark as paid when processed</li>
          <li>Add admin notes</li>
          <li>Filter by status (pending/approved/paid/rejected)</li>
        </ul>
      </div>
    </div>
  )
}
