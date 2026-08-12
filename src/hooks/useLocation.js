import { useCallback, useEffect, useRef, useState } from 'react'
import { searchLocations } from '../services/locationApi'
import { useDebounce } from './useDebounce'

export function useLocation(query, { limit = 6, minChars = 2 } = {}) {
  const debounced = useDebounce(query, 350)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const requestId = useRef(0)

  const run = useCallback(
    async (q) => {
      const id = ++requestId.current
      if (!q || q.trim().length < minChars) {
        setResults([])
        setLoading(false)
        return
      }
      setLoading(true)
      setError(null)
      try {
        const data = await searchLocations(q, { limit })
        if (requestId.current === id) setResults(data)
      } catch (err) {
        if (requestId.current === id) setError(err)
      } finally {
        if (requestId.current === id) setLoading(false)
      }
    },
    [limit, minChars]
  )

  useEffect(() => {
    run(debounced)
  }, [debounced, run])

  const retry = useCallback(() => run(debounced), [run, debounced])

  return { results, loading, error, retry }
}
