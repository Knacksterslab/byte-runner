export function HourlyChallengeTab() {
  return (
    <div className="bg-gray-900 border-2 border-gray-700 rounded-lg p-6">
      <h2 className="text-2xl font-bold text-cyan-400 mb-4">Hourly Challenges</h2>
      <p className="text-gray-400">Hourly challenge monitoring coming soon — check backend at /hourly-challenges</p>
      <div className="mt-4 text-sm text-gray-500">
        <p>Features to implement:</p>
        <ul className="list-disc list-inside space-y-1 mt-2">
          <li>View current hourly challenge status</li>
          <li>List recent challenge winners</li>
          <li>View challenge history</li>
          <li>Monitor participation rates</li>
          <li>Manual challenge creation/resolution</li>
        </ul>
      </div>
    </div>
  )
}
