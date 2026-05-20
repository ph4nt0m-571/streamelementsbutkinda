import { useState, useEffect } from 'react'
import api from '../utils/api'
import AlertCard from '../components/AlertCard'
import { toast } from '../components/Toast'
import { EVENT_TYPES } from '../utils/constants'

export default function Alerts() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/alerts')
      .then(res => setAlerts(res.data))
      .catch(() => toast('Failed to load alerts', 'error'))
      .finally(() => setLoading(false))
  }, [])

  const getAlert = (eventType) =>
    alerts.find(a => a.eventType === eventType) ?? {
      eventType,
      enabled: false,
      gifUrl: '',
      soundUrl: '',
      messageTemplate: '',
      animationIn: 'fadeIn',
      animationOut: 'fadeOut',
      duration: 5000,
      volume: 0.5,
    }

  const handleSave = async (data) => {
    try {
      const existing = alerts.find(a => a.eventType === data.eventType)
      let res
      if (existing?.id) {
        res = await api.put(`/api/alerts/${existing.id}`, data)
      } else {
        res = await api.post('/api/alerts', data)
      }
      setAlerts(prev => {
        const filtered = prev.filter(a => a.eventType !== data.eventType)
        return [...filtered, res.data]
      })
      toast('Alert saved!', 'success')
    } catch (err) {
      toast(err.message || 'Save failed', 'error')
    }
  }

  if (loading) return <div className="text-gray-400">Loading…</div>

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">🔔 Alerts</h1>
        <p className="mt-1 text-sm text-gray-400">Configure what happens in your overlay for each Twitch event.</p>
      </div>
      <div className="space-y-4">
        {EVENT_TYPES.map(({ value }) => (
          <AlertCard key={value} alert={getAlert(value)} onSave={handleSave} />
        ))}
      </div>
    </div>
  )
}