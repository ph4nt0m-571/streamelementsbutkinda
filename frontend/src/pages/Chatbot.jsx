import { useState, useEffect } from 'react'
import api from '../utils/api'
import CommandRow from '../components/CommandRow'
import ConfirmDialog from '../components/ConfirmDialog'
import { toast } from '../components/Toast'
import { validateCommandForm } from '../utils/validators'
import { MAX_COMMANDS } from '../utils/constants'

const blank = { trigger: '', response: '', cooldown: 10, permission: 'everyone', enabled: true }

export default function Chatbot() {
  const [commands, setCommands] = useState([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [newCmd, setNewCmd] = useState(blank)
  const [errors, setErrors] = useState({})
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => {
    api.get('/api/commands')
      .then(res => setCommands(res.data))
      .catch(() => toast('Failed to load commands', 'error'))
      .finally(() => setLoading(false))
  }, [])

  const handleAdd = async () => {
    const errs = validateCommandForm(newCmd)
    if (Object.keys(errs).length) return setErrors(errs)
    try {
      const res = await api.post('/api/commands', newCmd)
      setCommands(prev => [...prev, res.data])
      setNewCmd(blank)
      setAdding(false)
      setErrors({})
      toast('Command added!', 'success')
    } catch (err) {
      toast(err.message || 'Failed to add command', 'error')
    }
  }

  const handleSave = async (data) => {
    try {
      const res = await api.put(`/api/commands/${data.id}`, data)
      setCommands(prev => prev.map(c => c.id === data.id ? res.data : c))
      toast('Command updated!', 'success')
    } catch {
      toast('Update failed', 'error')
    }
  }

  const handleDelete = async () => {
    try {
      await api.delete(`/api/commands/${deleteTarget}`)
      setCommands(prev => prev.filter(c => c.id !== deleteTarget))
      toast('Command deleted', 'info')
    } catch {
      toast('Delete failed', 'error')
    } finally {
      setDeleteTarget(null)
    }
  }

  if (loading) return <div className="text-gray-400">Loading…</div>

  return (
    <div className="max-w-3xl space-y-6">
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Command"
        message="Are you sure? This cannot be undone."
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">🤖 Chatbot</h1>
          <p className="mt-1 text-sm text-gray-400">{commands.length}/{MAX_COMMANDS} commands</p>
        </div>
        {!adding && commands.length < MAX_COMMANDS && (
          <button onClick={() => setAdding(true)} className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700">
            + Add Command
          </button>
        )}
      </div>

      {adding && (
        <div className="rounded-xl border border-purple-600 bg-gray-900 p-4 space-y-3">
          <h3 className="font-medium text-white">New Command</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400">Trigger</label>
              <input className="input mt-1 w-full" value={newCmd.trigger} onChange={e => setNewCmd(f => ({ ...f, trigger: e.target.value }))} placeholder="!hello" />
              {errors.trigger && <p className="text-xs text-red-400 mt-1">{errors.trigger}</p>}
            </div>
            <div>
              <label className="text-xs text-gray-400">Permission</label>
              <select className="input mt-1 w-full" value={newCmd.permission} onChange={e => setNewCmd(f => ({ ...f, permission: e.target.value }))}>
                <option value="everyone">Everyone</option>
                <option value="subscriber">Subscribers+</option>
                <option value="moderator">Moderators+</option>
                <option value="broadcaster">Broadcaster only</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400">Response</label>
            <input className="input mt-1 w-full" value={newCmd.response} onChange={e => setNewCmd(f => ({ ...f, response: e.target.value }))} placeholder="Hello {user}!" maxLength={500} />
            {errors.response && <p className="text-xs text-red-400 mt-1">{errors.response}</p>}
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700">Add</button>
            <button onClick={() => { setAdding(false); setErrors({}) }} className="rounded-lg bg-gray-800 px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {commands.length === 0 && !adding && (
          <p className="text-center text-gray-500 py-8">No commands yet. Add your first one!</p>
        )}
        {commands.map(cmd => (
          <CommandRow key={cmd.id} command={cmd} onSave={handleSave} onDelete={setDeleteTarget} />
        ))}
      </div>
    </div>
  )
}