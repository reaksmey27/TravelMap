import { motion } from 'framer-motion'
import { Bookmark, Heart } from 'lucide-react'
import { useFavoriteStore } from '../../store/favoriteStore'
import { useTranslation } from '../../hooks/useTranslation'
import { cn } from '../../utils/cn'

/**
 * type: 'photo' | 'destination' | 'trip'
 * item: the object to save. Uses id-based lookup.
 */
export default function FavoriteButton({ type, item, variant = 'icon', className }) {
  const { t } = useTranslation()
  const togglePhoto = useFavoriteStore((s) => s.togglePhoto)
  const toggleDestination = useFavoriteStore((s) => s.toggleDestination)
  const toggleTrip = useFavoriteStore((s) => s.toggleTrip)
  const isPhotoFavorite = useFavoriteStore((s) => s.isPhotoFavorite)
  const isDestinationFavorite = useFavoriteStore((s) => s.isDestinationFavorite)
  const isTripFavorite = useFavoriteStore((s) => s.isTripFavorite)

  const isActive =
    type === 'photo'
      ? isPhotoFavorite(item.id)
      : type === 'destination'
        ? isDestinationFavorite(item.id)
        : isTripFavorite(item.id)

  const toggle = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (type === 'photo') togglePhoto(item)
    else if (type === 'destination') toggleDestination(item)
    else toggleTrip(item)
  }

  const HeartIcon = type === 'photo' ? Heart : Bookmark

  if (variant === 'button') {
    return (
      <button
        onClick={toggle}
        aria-pressed={isActive}
        aria-label={isActive ? t('common.removeFromFavorites') : t('common.saveToFavorites')}
        className={cn(
          'inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition active:scale-95',
          isActive
            ? 'bg-brand-500 text-white shadow-soft'
            : 'border border-sand-200 bg-white text-ink-700 hover:border-brand-200 hover:text-brand-600 dark:bg-sand-100',
          className
        )}
      >
        <HeartIcon className={cn('h-4 w-4', isActive && 'fill-current')} />
        {isActive ? t('common.saved') : t('common.save')}
      </button>
    )
  }

  return (
    <motion.button
      whileTap={{ scale: 0.8 }}
      onClick={toggle}
      aria-pressed={isActive}
      aria-label={isActive ? t('common.removeFromFavorites') : t('common.saveToFavorites')}
      className={cn(
        'grid h-9 w-9 place-items-center rounded-full shadow-soft backdrop-blur transition',
        isActive
          ? 'bg-brand-500 text-white'
          : 'bg-white/90 text-ink-700 hover:bg-white dark:bg-sand-100/90 dark:text-ink-900 dark:hover:bg-sand-100',
        className
      )}
    >
      <HeartIcon className={cn('h-[18px] w-[18px]', isActive && 'fill-current')} />
    </motion.button>
  )
}
