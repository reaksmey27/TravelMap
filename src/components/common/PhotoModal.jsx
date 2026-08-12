import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, ExternalLink, MapPin, X } from 'lucide-react'
import { cn } from '../../utils/cn'
import { formatNumber } from '../../utils/format'
import { useTranslation } from '../../hooks/useTranslation'
import FavoriteButton from './FavoriteButton'

export default function PhotoModal({ photos, index, onClose, onNavigate }) {
  const { t } = useTranslation()
  const photo = photos[index]

  useEffect(() => {
    if (!photo) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') onNavigate((index + 1) % photos.length)
      if (e.key === 'ArrowLeft') onNavigate((index - 1 + photos.length) % photos.length)
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [photo, index, photos.length, onClose, onNavigate])

  if (!photo) return null

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[1200] flex items-center justify-center bg-ink-900/95 p-4 backdrop-blur-sm dark:bg-ink-950/95"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-label={photo.title}
      >
        {/* Close */}
        <button
          onClick={onClose}
          aria-label={t('photoModal.closePreview')}
          className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Prev / Next */}
        {photos.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onNavigate((index - 1 + photos.length) % photos.length)
              }}
              aria-label={t('photoModal.prev')}
              className="absolute left-3 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/25 sm:left-6"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onNavigate((index + 1) % photos.length)
              }}
              aria-label={t('photoModal.next')}
              className="absolute right-3 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/25 sm:right-6"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Content */}
        <motion.div
          key={photo.id}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
          className="flex max-h-full w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-lift dark:bg-sand-100 lg:flex-row"
        >
          <div className="relative min-h-[280px] flex-1 bg-ink-800 dark:bg-ink-950">
            <img
              src={photo.url || photo.thumb}
              alt={photo.title}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <span className="absolute bottom-3 left-3 rounded-full bg-ink-900/70 px-3 py-1 text-xs font-medium text-white backdrop-blur dark:bg-ink-950/70">
              {index + 1} / {photos.length}
            </span>
          </div>

          <div className="flex w-full flex-col justify-between gap-4 p-6 lg:w-80 lg:shrink-0">
            <div>
              <h3 className="font-display text-xl font-bold text-ink-900">{photo.title}</h3>
              <p className="mt-1.5 flex items-center gap-1.5 text-sm text-ink-500">
                <MapPin className="h-4 w-4 text-brand-500" />
                {photo.city && photo.country ? `${photo.city}, ${photo.country}` : photo.city || photo.country || t('common.unknownLocation')}
              </p>
              {photo.description && (
                <p className="mt-4 text-sm leading-relaxed text-ink-600">{photo.description}</p>
              )}
              <div className="mt-4 flex items-center gap-3">
                {photo.user?.avatar ? (
                  <img
                    src={photo.user.avatar}
                    alt=""
                    className="h-9 w-9 rounded-full object-cover"
                  />
                ) : (
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-sand-100 font-semibold text-ink-600">
                    {photo.user?.name?.[0] || '?'}
                  </div>
                )}
                <div className="text-sm">
                  <p className="font-semibold text-ink-900">{photo.user?.name || t('common.unknown')}</p>
                  <p className="text-xs text-ink-400">{t('common.likes', { count: formatNumber(photo.likes) })}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <FavoriteButton type="photo" item={photo} variant="button" className="flex-1" />
              <Link
                to={`/photos/${photo.id}`}
                onClick={onClose}
                aria-label={t('photoModal.openDetails')}
                className={cn(
                  'grid h-10 w-10 shrink-0 place-items-center rounded-full border border-sand-200 bg-white text-ink-700 transition hover:border-brand-200 hover:text-brand-600 dark:bg-sand-100'
                )}
              >
                <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  )
}
