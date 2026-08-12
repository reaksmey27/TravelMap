import { useState } from 'react'
import { motion } from 'framer-motion'
import { Camera, Heart, MapPin } from 'lucide-react'
import { cn } from '../../utils/cn'
import { compactNumber } from '../../utils/format'
import { usePhotoStore } from '../../store/photoStore'
import { useTranslation } from '../../hooks/useTranslation'
import FavoriteButton from '../common/FavoriteButton'

export default function PhotoCard({ photo, onClick, aspect = 'aspect-[4/5]', showUser = true, index = 0 }) {
  const { t } = useTranslation()
  const [loaded, setLoaded] = useState(false)
  const liked = usePhotoStore((s) => !!s.liked[photo.id])
  const toggleLike = usePhotoStore((s) => s.toggleLike)
  const likeCount = photo.likes + (liked ? 1 : 0)

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, delay: (index % 6) * 0.05 }}
      className="group relative cursor-pointer overflow-hidden rounded-2xl bg-white shadow-soft transition-shadow duration-300 hover:shadow-lift dark:bg-sand-100"
      onClick={() => onClick?.(photo)}
    >
      <div className={cn('relative w-full overflow-hidden', aspect)}>
        {!loaded && <div className="skeleton absolute inset-0" aria-hidden="true" />}
        <img
          src={photo.thumb || photo.url}
          alt={photo.title}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          className={cn(
            'h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105',
            loaded ? 'opacity-100' : 'opacity-0'
          )}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-900/70 via-ink-900/5 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-100 dark:from-ink-950/70 dark:via-ink-950/5" />

        <div className="absolute left-3 top-3 right-3 flex items-start justify-between">
          <span className="rounded-full bg-white/85 px-2.5 py-1 text-[11px] font-semibold text-ink-800 backdrop-blur dark:bg-sand-100/85 dark:text-ink-900">
            {photo.category || t('photoCard.travel')}
          </span>
          <FavoriteButton type="photo" item={photo} />
        </div>

        <div className="absolute inset-x-0 bottom-0 translate-y-1 p-4 transition-transform duration-300 group-hover:translate-y-0">
          <p className="flex items-center gap-1 text-xs font-medium text-white/90">
            <MapPin className="h-3.5 w-3.5 text-brand-300" />
            {photo.city && photo.country ? `${photo.city}, ${photo.country}` : photo.city || photo.country || t('photoCard.somewhere')}
          </p>
          <h3 className="mt-1 truncate font-display text-sm font-bold text-white">{photo.title}</h3>
          <div className="mt-2 flex items-center justify-between opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            {showUser && (
              <div className="flex items-center gap-1.5 text-xs text-white/90">
                <Camera className="h-3.5 w-3.5" />
                {photo.user?.name || t('photoCard.traveler')}
              </div>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleLike(photo.id)
              }}
              aria-label={liked ? t('photoCard.unlike') : t('photoCard.like')}
              className={cn(
                'flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold backdrop-blur transition',
                liked ? 'bg-brand-500 text-white' : 'bg-ink-900/40 text-white hover:bg-ink-900/70 dark:bg-ink-950/40 dark:hover:bg-ink-950/70'
              )}
            >
              <Heart className={cn('h-3.5 w-3.5', liked && 'fill-current')} />
              {compactNumber(likeCount)}
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  )
}
