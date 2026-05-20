import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export default function Login() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && user) navigate('/dashboard', { replace: true })
  }, [user, loading, navigate])

  const params = new URLSearchParams(window.location.search)
  const error = params.get('error')

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950">
      <div className="w-full max-w-sm rounded-2xl border border-gray-800 bg-gray-900 p-8 text-center shadow-2xl">
        <div className="mb-2 text-4xl">🎮</div>
        <h1 className="mb-1 text-2xl font-bold text-white">SEbutkinda</h1>
        <p className="mb-8 text-sm text-gray-400">Stream alerts & overlays, your way</p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-900/40 border border-red-700 px-4 py-3 text-sm text-red-300">
            Authentication failed. Please try again.
          </div>
        )}

        <a
          href={`${API_URL}/auth/twitch`}
          className="flex w-full items-center justify-center gap-3 rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-purple-700"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/>
          </svg>
          Connect with Twitch
        </a>

        <p className="mt-6 text-xs text-gray-600">
          We only request the permissions needed to run alerts and the chatbot.
        </p>
      </div>
    </div>
  )
}