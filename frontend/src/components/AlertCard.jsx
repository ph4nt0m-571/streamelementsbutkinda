import { useState } from 'react'
import { validateAlertForm } from '../utils/validators'
import { ANIMATIONS_IN, ANIMATIONS_OUT } from '../utils/constants'

export default function AlertCard({ alert, onSave }) {
  const [form, setForm] = useState(alert)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    const errs = validateAlertForm(form)
    if (Object.keys(errs).length) return setErrors(errs)
    setSaving(true)
    try { await onSave(form) } finally { setSaving(false) }
  }

  return (
    <div className="rounded-xl border border-gray-700 bg-gray-900 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-white capitalize">{alert.eventType.replace('_', ' ')}</h3>
        <label className="flex items-center gap-2 text-sm text-gray-400">
          <input type="checkbox" checked={form.enabled} onChange={e => set('enabled', e.target.checked)} className="accent-purple-500" />
          Enabled
        </label>
      </div>

      <div className="space-y-3">
        <Field label="GIF URL" error={errors.gifUrl}>
          <input className="input" value={form.gifUrl || ''} onChange={e => set('gifUrl', e.target.value)} placeholder="https://..." />
        </Field>
        <Field label="Sound URL" error={errors.soundUrl}>
          <input className="input" value={form.soundUrl || ''} onChange={e => set('soundUrl', e.target.value)} placeholder="https://..." />
        </Field>
        <Field label="Message ({user_name}, {viewers} etc)" error={errors.messageTemplate}>
          <input className="input" value={form.messageTemplate || ''} onChange={e => set('messageTemplate', e.target.value)} maxLength={200} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Animation In">
            <select className="input" value={form.animationIn} onChange={e => set('animationIn', e.target.value)}>
              {ANIMATIONS_IN.map(a => <option key={a}>{a}</option>)}
            </select>
          </Field>
          <Field label="Animation Out">
            <select className="input" value={form.animationOut} onChange={e => set('animationOut', e.target.value)}>
              {ANIMATIONS_OUT.map(a => <option key={a}>{a}</option>)}
            </select>
          </Field>
          <Field label="Duration (ms)" error={errors.duration}>
            <input className="input" type="number" value={form.duration} onChange={e => set('duration', +e.target.value)} min={1000} max={30000} />
          </Field>
          <Field label="Volume (0–1)" error={errors.volume}>
            <input className="input" type="number" step="0.1" value={form.volume} onChange={e => set('volume', +e.target.value)} min={0} max={1} />
          </Field>
        </div>
      </div>

      <button onClick={handleSave} disabled={saving} className="mt-4 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50">
        {saving ? 'Saving…' : 'Save'}
      </button>
    </div>
  )
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="mb-1 block text-xs text-gray-400">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  )
}