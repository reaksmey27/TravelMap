import { useCallback, useEffect, useRef, useState } from 'react'
import { Compass, Loader2 } from 'lucide-react'
import PageTransition from '../components/common/PageTransition'
import FilterTabs from '../components/common/FilterTabs'
import PhotoGrid from '../components/photos/PhotoGrid'
import PhotoModal from '../components/common/PhotoModal'
import photoApi from '../services/photoApi'
import { usePhotoStore } from '../store/photoStore'
import { useTranslation } from '../hooks/useTranslation'
import { CATEGORIES } from '../utils/constants'

const PER_PAGE = 12

export default function Explore() {
  const { t } = useTranslation()
  const [category, setCategory] = useState('all')
  const [photos, setPhotos] = useState([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [error, setError] = useState(null)
  const [modalIndex, setModalIndex] = useState(null)
  const requestId = useRef(0)
  const getCached = usePhotoStore((s) => s.getCached)
  const setCache = usePhotoStore((s) => s.setCache)

  const loadPage = useCallback(
    async (pageToLoad, append = false) => {
      const key = `explore:${category}:${pageToLoad}`
      const cached = getCached(key)
      if (cached) {
        if (append) setPhotos((p) => [...p, ...cached.photos])
        else setPhotos(cached.photos)
        setHasMore(cached.hasMore)
        setLoading(false)
        setLoadingMore(false)
        return
      }
      if (append) setLoadingMore(true)
      else setLoading(true)
      setError(null)
      const id = ++requestId.current
      try {
        const query = category === 'all' ? 'travel' : category
        const data = await photoApi.getPhotos({ query, category, page: pageToLoad, perPage: PER_PAGE })
        if (requestId.current !== id) return
        setCache(key, { photos: data.photos, hasMore: data.hasMore })
        setPhotos((p) => (append ? [...p, ...data.photos] : data.photos))
        setHasMore(data.hasMore)
      } catch (err) {
        if (requestId.current === id) setError(err)
      } finally {
        if (requestId.current === id) {
          setLoading(false)
          setLoadingMore(false)
        }
      }
    },
    [category, getCached, setCache]
  )

  useEffect(() => {
    setPhotos([])
    setPage(1)
    loadPage(1, false)
  }, [category, loadPage])

  const loadMore = () => {
    const next = page + 1
    setPage(next)
    loadPage(next, true)
  }

  const retry = () => loadPage(1, false)

  return (
    <PageTransition>
      <div className="space-y-8">
        <header className="text-center sm:text-left">
          <p className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-brand-500">
            <Compass className="h-4 w-4" /> {t('explore.discover')}
          </p>
          <h1 className="text-balance font-display text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
            {t('explore.title')}
          </h1>
          <p className="mt-2 text-balance text-ink-500">
            {t('explore.sub')}
          </p>
        </header>

        <div className="sticky top-16 z-30 -mx-4 border-b border-sand-200/70 bg-sand-50/90 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border sm:px-4">
          <FilterTabs options={CATEGORIES} value={category} onChange={setCategory} />
        </div>

        <PhotoGrid
          photos={photos}
          loading={loading}
          error={error}
          onRetry={retry}
          onPhotoClick={(photo) => setModalIndex(photos.findIndex((p) => p.id === photo.id))}
          skeletonCount={9}
        />

        {!loading && !error && hasMore && (
          <div className="flex justify-center pt-2">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="inline-flex items-center gap-2 rounded-full border border-sand-200 bg-white px-8 py-3 text-sm font-semibold text-ink-700 shadow-soft transition hover:border-brand-300 hover:text-brand-600 active:scale-95 disabled:opacity-60 dark:bg-sand-100"
            >
              {loadingMore && <Loader2 className="h-4 w-4 animate-spin" />}
              {loadingMore ? t('common.loadingMore') : t('explore.loadMore')}
            </button>
          </div>
        )}
      </div>

      {modalIndex != null && photos[modalIndex] && (
        <PhotoModal
          photos={photos}
          index={modalIndex}
          onClose={() => setModalIndex(null)}
          onNavigate={setModalIndex}
        />
      )}
    </PageTransition>
  )
}
