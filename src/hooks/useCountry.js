import { useCallback, useEffect, useRef, useState } from 'react'
import { getCountry } from '../services/countryApi'

export function useCountry({ name, code } = {}) {
  const [country, setCountry] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const requestId = useRef(0)

  const load = useCallback(async () => {
    const id = ++requestId.current
    if (!name && !code) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await getCountry({ name, code })
      if (requestId.current === id) setCountry(data)
    } catch (err) {
      if (requestId.current === id) setError(err)
    } finally {
      if (requestId.current === id) setLoading(false)
    }
  }, [name, code])

  useEffect(() => {
    load()
  }, [load])

  return { country, loading, error, retry: load }
}
