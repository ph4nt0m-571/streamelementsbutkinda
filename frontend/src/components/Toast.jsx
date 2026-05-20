import { useState, useEffect, useCallback } from 'react'
import { setToastFn } from './toast'

export default function Toast() {
  const [toasts, setToasts] = useState([])

  const add = useCallback((t) => {
    setToasts(prev => [...prev, t])
    setTimeout(() => setToasts(prev => prev.filter(x => x.id !== t.id)), 4000)
  }, [])

  useEffect(() => { setToastFn(add) }, [add])

  const colors = { success: 'bg-green-600', error: 'bg-red-600', info: 'bg-purple-600' }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`${colors[t.type] || colors.info} rounded-lg px-4 py-3 text-sm text-white shadow-lg`}
        >
          {t.msg}
        </div>
      ))}
    </div>
  )
}