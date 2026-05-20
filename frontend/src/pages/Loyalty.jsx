import { useState, useEffect } from 'react'
import api from '../utils/api'
import { toast } from '../components/toast'

export default function Loyalty() {
  const [config, setConfig] = useState({ currencyName: 'points', pointsPerMin: 1, enabled: false })
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all([
      api.get('/api/loyalty/config'),
      api.get('/api/loyalty/leaderboard'),
    ]).then(([cfg, lb]) => {
      setConfig(cfg.data)
      setLeaderboard(lb.data)
    }).catch(() => toast('Failed to load loyalty data', 'error'))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await api.put('/api/loyalty/config', config)
      setConfig(res.data)
      toast('Loyalty settings saved!', 'success')
    } catch {
      toast('Save failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="text-gray-400">Loading…</div>

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">⭐ Loyalty Points</h1>
        <p className="mt-1 text-sm text-gray-400">Reward viewers for watching your stream.</p>
      </div>

      <div className="rounded-xl border border-gray-700 bg-gray-900 p-6 space-y-4">
        <h2 className="font-semibold text-white">Configuration</h2>
        <label className="flex items-center gap-3">
          <input type="checkbox" checked={config.enabled} onChange={e => setConfig(c => ({ ...c, enabled: e.target.checked }))} className="accent-purple-500 h-4 w-4" />
          <span className="text-sm text-gray-300">Enable loyalty points system</span>
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-400">Currency Name</label>
            <input
              className="input mt-1 w-full"
              value={config.currencyName}
              onChange={e => setConfig(c => ({ ...c, currencyName: e.target.value }))}
              maxLength={30}
            />
          </div>
          <div>
            <label className="text-xs text-gray-400">Points per Minute</label>
            <input
              className="input mt-1 w-full"
              type="number"
              value={config.pointsPerMin}
              onChange={e => setConfig(c => ({ ...c, pointsPerMin: +e.target.value }))}
              min={1} max={1000}
            />
          </div>
        </div>
        <button onClick={handleSave} disabled={saving} className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50">
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
      </div>

      <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
        <h2 className="mb-4 font-semibold text-white">Leaderboard</h2>
        {leaderboard.length === 0 ? (
          <p className="text-sm text-gray-500">No viewers have earned points yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700 text-left text-xs text-gray-500">
                <th className="pb-2">#</th>
                <th className="pb-2">Viewer</th>
                <th className="pb-2 text-right">Balance</th>
                <th className="pb-2 text-right">Total Earned</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((row, i) => (
                <tr key={i} className="border-b border-gray-800 text-gray-300">
                  <td className="py-2 text-gray-500">{i + 1}</td>
                  <td className="py-2">{row.viewerName}</td>
                  <td className="py-2 text-right text-purple-300">{row.balance.toLocaleString()}</td>
                  <td className="py-2 text-right text-gray-500">{row.totalEarned.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}