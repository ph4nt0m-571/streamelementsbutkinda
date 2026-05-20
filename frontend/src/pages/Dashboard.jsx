import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { toast } from '../components/Toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export default function Dashboard() {
  const { user } = useAuth()
  const [copied, setCopied] = useState(false)

  const overlayUrl = `${window.location.origin.replace('5173', '5174')}/overlay?token=${user?.overlayToken}`

  const copyUrl = () => {
    navigator.clipboard.writeText(overlayUrl)
    setCopied(true)
    toast('Overlay URL copied!', 'success')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Welcome back, {user?.displayName} 👋</h1>
        <p className="mt-1 text-sm text-gray-400">Here's your stream overview.</p>
      </div>

      <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
        <h2 className="mb-3 font-semibold text-white">🎯 Your Overlay URL</h2>
        <p className="mb-3 text-sm text-gray-400">
          Paste this into OBS as a Browser Source (1920×1080, transparent background).
        </p>
        <div className="flex gap-2">
          <input
            readOnly
            value={overlayUrl}
            className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-300 font-mono"
          />
          <button
            onClick={copyUrl}
            className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 transition-colors"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Alerts Configured', href: '/alerts', icon: '🔔', hint: 'Set up follow/sub/raid alerts' },
          { label: 'Overlay Widgets',   href: '/overlays', icon: '🎨', hint: 'Drag-and-drop overlay builder' },
          { label: 'Chatbot Commands',  href: '/chatbot', icon: '🤖', hint: 'Manage your !commands' },
        ].map(card => (
          <a
            key={card.href}
            href={card.href}
            className="rounded-xl border border-gray-700 bg-gray-900 p-5 hover:border-purple-500 transition-colors"
          >
            <div className="mb-2 text-2xl">{card.icon}</div>
            <p className="font-medium text-white">{card.label}</p>
            <p className="mt-1 text-xs text-gray-400">{card.hint}</p>
          </a>
        ))}
      </div>
    </div>
  )
}