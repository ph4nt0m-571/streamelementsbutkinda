import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'

export function useSocket(token, onEvent) {
  const socketRef = useRef(null)

  useEffect(() => {
    if (!token) return

    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3001', {
      auth: { token },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    socket.on('alert', (data) => onEvent?.('alert', data))
    socket.on('connect_error', (err) => console.error('Socket error:', err.message))

    socketRef.current = socket
    return () => socket.disconnect()
  }, [token])

  return socketRef
}