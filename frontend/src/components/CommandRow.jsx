import { useState } from 'react'
import { validateCommandForm } from '../utils/validators'
import { PERMISSION_LEVELS } from '../utils/constants'

export default function CommandRow({ command, onSave, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(command)
  const [errors, setErrors] = useState({})

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    const errs = validateCommandForm(form)
    if (Object.keys(errs).length) return setErrors(errs)
    await onSave(form)
    setEditing(false)
    setErrors({})
  }

  if (!editing) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-gray-700 bg-gray-900 px-4 py-3">
        <div className="flex items-center gap-4">
          <span className={`h-2 w-2 rounded-full ${command.enabled ? 'bg-green-400' : 'bg-gray-600'}`} />
          <code className="text-sm font-mono text-purple-300">{command.trigger}</code>
          <span className="text-sm text-gray-400 truncate max-w-xs">{command.response}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded bg-gray-800 px-2 py-0.5 text-xs text-gray-400">{command.permission}</span>
          <button onClick={() => setEditing(true)} className="text-sm text-purple-400 hover:text-white">Edit</button>
          <button onClick={() => onDelete(command.id)} className="text-sm text-red-400 hover:text-red-300">Delete</button>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-purple-600 bg-gray-900 p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-400">Trigger</label>
          <input className="input mt-1" value={form.trigger} onChange={e => set('trigger', e.target.value)} />
          {errors.trigger && <p className="text-xs text-red-400 mt-1">{errors.trigger}</p>}
        </div>
        <div>
          <label className="text-xs text-gray-400">Permission</label>
          <select className="input mt-1" value={form.permission} onChange={e => set('permission', e.target.value)}>
            {PERMISSION_LEVELS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="text-xs text-gray-400">Response ({`{user}, {args}`} available)</label>
        <input className="input mt-1 w-full" value={form.response} onChange={e => set('response', e.target.value)} maxLength={500} />
        {errors.response && <p className="text-xs text-red-400 mt-1">{errors.response}</p>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-400">Cooldown (seconds)</label>
          <input className="input mt-1" type="number" value={form.cooldown} onChange={e => set('cooldown', +e.target.value)} min={0} max={3600} />
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-400 mt-5">
          <input type="checkbox" checked={form.enabled} onChange={e => set('enabled', e.target.checked)} className="accent-purple-500" />
          Enabled
        </label>
      </div>
      <div className="flex gap-2">
        <button onClick={handleSave} className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700">Save</button>
        <button onClick={() => { setEditing(false); setForm(command); setErrors({}) }} className="rounded-lg bg-gray-800 px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
      </div>
    </div>
  )
}