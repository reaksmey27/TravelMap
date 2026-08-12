import { useCallback, useEffect, useState } from 'react'
import { getWeather } from '../services/weatherApi'

export function useWeather(lat, lon) {
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    if (lat == null || lon == null) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await getWeather(lat, lon)
      setWeather(data)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [lat, lon])

  useEffect(() => {
    load()
  }, [load])

  return { weather, loading, error, retry: load }
}
