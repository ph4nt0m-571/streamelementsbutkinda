import { useState, useCallback } from 'react'
import api from '../utils/api'

export function useApi() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const request = useCallback(async (method, url, data) => {
    setLoading(true)
    setError(null)
    try {
      const res = await api[method](url, data)
      return res.data
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Request failed'
      setError(msg)
      throw new Error(msg, { cause: err })
    } finally {
      setLoading(false)
    }
  }, [])

  return { request, loading, error }
}