import { useCallback, useEffect, useRef, useState } from 'react'
import photoApi from '../services/photoApi'
import { usePhotoStore } from '../store/photoStore'

export function usePhotos({ query = 'travel', category = null, page = 1, perPage = 12 } = {}) {
  const cacheKey = `photos:${query}:${category || 'all'}:${page}:${perPage}`
  const getCached = usePhotoStore((s) => s.getCached)
  const setCache = usePhotoStore((s) => s.setCache)

  const [photos, setPhotos] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  const load = useCallback(
    async (fresh = false) => {
      if (!fresh) {
        const cached = getCached(cacheKey)
        if (cached) {
          setPhotos(cached.photos)
          setTotal(cached.total)
          setLoading(false)
          return
        }
      }
      setLoading(true)
      setError(null)
      try {
        const data = await photoApi.getPhotos({ query, category, page, perPage })
        if (!mounted.current) return
        setPhotos(data.photos)
        setTotal(data.total)
        setCache(cacheKey, { photos: data.photos, total: data.total })
      } catch (err) {
        if (mounted.current) setError(err)
      } finally {
        if (mounted.current) setLoading(false)
      }
    },
    [cacheKey, query, category, page, perPage, getCached, setCache]
  )

  useEffect(() => {
    load()
  }, [load])

  return { photos, total, loading, error, retry: () => load(true) }
}
