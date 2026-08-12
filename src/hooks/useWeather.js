import { useCallback, useEffect, useRef, useState } from 'react'
import { getWeather } from '../services/weatherApi'

export function useWeather(lat, lon) {
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const requestId = useRef(0)

  const load = useCallback(async () => {
    const id = ++requestId.current
    if (lat == null || lon == null) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await getWeather(lat, lon)
      if (requestId.current === id) setWeather(data)
    } catch (err) {
      if (requestId.current === id) setError(err)
    } finally {
      if (requestId.current === id) setLoading(false)
    }
  }, [lat, lon])

  useEffect(() => {
    load()
  }, [load])

  return { weather, loading, error, retry: load }
}
