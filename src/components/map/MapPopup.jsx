import { Link } from 'react-router-dom'
import { MapPin, Star } from 'lucide-react'
import { useTranslation } from '../../hooks/useTranslation'

/**
 * Popup body used inside Leaflet <Popup>. Keep markup compact —
 * it is rendered inside the leaflet popup container.
 */
export default function MapPopup({
  image,
  title,
  subtitle,
  rating,
  photoCount,
  to,
  onView,
  children,
}) {
  const { t } = useTranslation()
  return (
    <div className="w-60">
      {image && (
        <img
          src={image}
          alt={title}
          className="h-32 w-full object-cover"
          loading="lazy"
        />
      )}
      <div className="p-4">
        <p className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-brand-600">
          <MapPin className="h-3 w-3" />
          {subtitle}
        </p>
        <h4 className="mt-1 font-display text-base font-bold text-ink-900">{title}</h4>
        <div className="mt-2 flex items-center gap-3 text-xs text-ink-500">
          {rating != null && (
            <span className="flex items-center gap-1 font-semibold text-ink-700">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              {rating}
            </span>
          )}
          {photoCount != null && <span>{t('mapPopup.photos', { count: photoCount })}</span>}
        </div>
        {children}
        {onView && (
          <button
            onClick={onView}
            className="mt-3 w-full rounded-full bg-ink-900 py-2 text-sm font-semibold text-white transition hover:bg-ink-700 dark:bg-ink-950 dark:hover:bg-white/10"
          >
            {t('common.viewDetails')}
          </button>
        )}
        {to && !onView && (
          <Link
            to={to}
            className="mt-3 block rounded-full bg-ink-900 py-2 text-center text-sm font-semibold text-white transition hover:bg-ink-700 dark:bg-ink-950 dark:hover:bg-white/10"
          >
            {t('common.viewDetails')}
          </Link>
        )}
      </div>
    </div>
  )
}
