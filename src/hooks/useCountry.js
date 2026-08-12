import { useCallback, useEffect, useState } from 'react'
import { getCountry } from '../services/countryApi'

export function useCountry({ name, code } = {}) {
  const [country, setCountry] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    if (!name && !code) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await getCountry({ name, code })
      setCountry(data)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [name, code])

  useEffect(() => {
    load()
  }, [load])

  return { country, loading, error, retry: load }
}
