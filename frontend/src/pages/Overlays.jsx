import { useState, useEffect } from 'react'
import api from '../utils/api'
import WidgetCanvas from '../components/WidgetCanvas'
import { toast } from '../components/Toast'

export default function Overlays() {
  const [widgets, setWidgets] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get('/api/overlays/config')
      .then(res => setWidgets(res.data.widgets ?? []))
      .catch(() => toast('Failed to load overlay config', 'error'))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.put('/api/overlays/config', { widgets })
      toast('Overlay saved!', 'success')
    } catch {
      toast('Save failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="text-gray-400">Loading…</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">🎨 Overlays</h1>
          <p className="mt-1 text-sm text-gray-400">Add and position widgets that appear over your stream.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-purple-600 px-5 py-2 font-medium text-white hover:bg-purple-700 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Saving…' : 'Save Layout'}
        </button>
      </div>
      <WidgetCanvas widgets={widgets} onChange={setWidgets} />
    </div>
  )
}