import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Calendar,
  Camera,
  Check,
  Heart,
  Link2,
  MapPin,
  Share2,
  Tag,
} from 'lucide-react'
import PageTransition from '../components/common/PageTransition'
import FavoriteButton from '../components/common/FavoriteButton'
import PhotoCard from '../components/photos/PhotoCard'
import MapView from '../components/map/MapView'
import { pinIcon } from '../components/map/markers'
import ErrorState from '../components/common/ErrorState'
import photoApi from '../services/photoApi'
import { usePhotoStore } from '../store/photoStore'
import { useTranslation } from '../hooks/useTranslation'
import { cn } from '../utils/cn'
import { compactNumber, formatDate } from '../utils/format'

export default function PhotoDetails() {
  const { t, lang } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const [photo, setPhoto] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)
  const liked = usePhotoStore((s) => !!s.liked[id])
  const toggleLike = usePhotoStore((s) => s.toggleLike)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await photoApi.getPhotoById(id)
      setPhoto(data)
      if (!data) setError(new Error('not found'))
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  const [similar, setSimilar] = useState([])

  // Live "more like this" — fetch photos matching this photo's theme.
  useEffect(() => {
    let cancelled = false
    if (!photo) return
    const query = photo.tags?.[0] || photo.category || 'travel'
    photoApi
      .getPhotos({ query, page: 1, perPage: 8 })
      .then((data) => {
        if (!cancelled) setSimilar(data.photos.filter((p) => p.id !== photo.id).slice(0, 4))
      })
      .catch(() => {
        if (!cancelled) setSimilar([])
      })
    return () => {
      cancelled = true
    }
  }, [photo])

  const share = async () => {
    const url = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({ title: photo.title, url })
        return
      }
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // user cancelled
    }
  }

  if (loading) {
    return (
      <PageTransition>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          <div className="skeleton aspect-[4/3] w-full rounded-3xl lg:col-span-3" />
          <div className="space-y-4 lg:col-span-2">
            <div className="skeleton h-8 w-2/3" />
            <div className="skeleton h-4 w-1/2" />
            <div className="skeleton h-28 w-full rounded-2xl" />
          </div>
        </div>
      </PageTransition>
    )
  }

  if (error || !photo) {
    return (
      <PageTransition>
        <ErrorState
          title={t('photoDetails.notFound')}
          message={t('photoDetails.notFoundMsg')}
          onRetry={load}
        />
      </PageTransition>
    )
  }

  const likeCount = photo.likes + (liked ? 1 : 0)
  const place = photo.city || photo.country || null

  return (
    <PageTransition>
      <div className="space-y-8">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 transition hover:text-ink-900"
        >
          <ArrowLeft className="h-4 w-4" /> {t('photoDetails.back')}
        </button>

        <div className="grid gap-8 lg:grid-cols-5">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="overflow-hidden rounded-3xl shadow-card lg:col-span-3"
          >
            <img
              src={photo.url || photo.thumb}
              alt={photo.title}
              className="max-h-[70vh] w-full object-cover"
            />
          </motion.div>

          {/* Info */}
          <div className="space-y-6 lg:col-span-2">
            <div>
              <h1 className="text-balance font-display text-3xl font-extrabold tracking-tight text-ink-900">
                {photo.title}
              </h1>
              {place && (
                <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-ink-500">
                  <MapPin className="h-4 w-4 text-brand-500" />
                  {place}
                </p>
              )}
            </div>

            {/* Author */}
            <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-soft dark:bg-sand-100">
              {photo.user?.avatar ? (
                <img src={photo.user.avatar} alt="" referrerPolicy="no-referrer" className="h-11 w-11 rounded-full object-cover" />
              ) : (
                <span className="grid h-11 w-11 place-items-center rounded-full bg-sand-100 font-bold text-ink-600">
                  {photo.user?.name?.[0] || '?'}
                </span>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink-900">
                  {photo.user?.name || t('photoDetails.unknownPhotographer')}
                </p>
                <p className="flex items-center gap-1.5 text-xs text-ink-400">
                  <Camera className="h-3 w-3" /> {t('photoDetails.photographer')}
                  {photo.date && (
                    <>
                      <span>·</span>
                      <Calendar className="h-3 w-3" />
                      {formatDate(photo.date, lang)}
                    </>
                  )}
                </p>
              </div>
            </div>

            {photo.description && (
              <p className="rounded-2xl bg-white p-5 text-sm leading-relaxed text-ink-600 shadow-soft dark:bg-sand-100">
                {photo.description}
              </p>
            )}

            {/* Tags */}
            {photo.tags?.length > 0 && (
              <div>
                <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink-400">
                  <Tag className="h-3.5 w-3.5" /> {t('photoDetails.tags')}
                </p>
                <div className="flex flex-wrap gap-2">
                  {photo.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-sand-100 px-3 py-1 text-xs font-medium text-ink-600"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => toggleLike(id)}
                aria-pressed={liked}
                className={cn(
                  'inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition active:scale-95',
                  liked
                    ? 'bg-brand-500 text-white shadow-soft'
                    : 'border border-sand-200 bg-white text-ink-700 hover:border-brand-200 hover:text-brand-600 dark:bg-sand-100'
                )}
              >
                <Heart className={cn('h-4 w-4', liked && 'fill-current')} />
                {compactNumber(likeCount)}
              </button>
              <FavoriteButton type="photo" item={photo} variant="button" />
              <button
                onClick={share}
                className="inline-flex items-center gap-2 rounded-full border border-sand-200 bg-white px-5 py-2.5 text-sm font-semibold text-ink-700 transition hover:border-brand-200 hover:text-brand-600 dark:bg-sand-100"
              >
                {copied ? <Check className="h-4 w-4 text-sage-500" /> : <Share2 className="h-4 w-4" />}
                {copied ? t('photoDetails.linkCopied') : t('photoDetails.share')}
              </button>
            </div>

            {/* Location map */}
            {photo.lat != null && (
              <div className="overflow-hidden rounded-2xl shadow-soft">
                <div className="h-48">
                  <MapView
                    center={[photo.lat, photo.lon]}
                    zoom={12}
                    controls="none"
                    cluster={false}
                    markers={[
                      {
                        id: `photo-${photo.id}-pin`,
                        lat: photo.lat,
                        lon: photo.lon,
                        icon: pinIcon(),
                      },
                    ]}
                  />
                </div>
                <p className="flex items-center gap-1.5 bg-white px-4 py-2.5 text-xs font-medium text-ink-500 dark:bg-sand-100">
                  <Link2 className="h-3.5 w-3.5 text-brand-500" />
                  {t('photoDetails.shotNear', { place: place || t('photoDetails.thisSpot') })}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Similar photos */}
        {similar.length > 0 && (
          <section aria-label={t('photoDetails.moreLikeThis')}>
            <h2 className="mb-5 font-display text-xl font-bold text-ink-900">{t('photoDetails.moreLikeThis')}</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {similar.map((p, i) => (
                <PhotoCard key={p.id} photo={p} index={i} aspect="aspect-square" />
              ))}
            </div>
          </section>
        )}
      </div>
    </PageTransition>
  )
}
