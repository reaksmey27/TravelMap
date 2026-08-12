import { Link } from 'react-router-dom'
import { ArrowLeft, Camera, MapPin } from 'lucide-react'
import { formatNumber } from '../../utils/format'
import { useTranslation } from '../../hooks/useTranslation'

/**
 * Destination hero for live (geocoded) destinations.
 * destination: { name, country, image?, photoCount? }
 */
export default function DestinationHeader({ destination }) {
  const { t } = useTranslation()
  const name = destination.name || t('common.unknownPlace')
  const country = destination.country || ''
  const image = destination.image

  return (
    <div className="relative overflow-hidden rounded-3xl shadow-card">
      {image ? (
        <img
          src={image}
          alt={name}
          className="h-[320px] w-full object-cover sm:h-[420px]"
        />
      ) : (
        <div className="grid h-[320px] w-full place-items-center bg-gradient-to-br from-brand-600 to-sage-600 sm:h-[420px]">
          <span className="font-display text-8xl font-extrabold text-white/30">
            {name.charAt(0).toUpperCase()}
          </span>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-ink-900/85 via-ink-900/30 to-ink-900/10 dark:from-ink-950/85 dark:via-ink-950/30 dark:to-ink-950/10" />

      <Link
        to="/explore"
        className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-2 text-sm font-medium text-white backdrop-blur transition hover:bg-white/25"
      >
        <ArrowLeft className="h-4 w-4" /> {t('common.back')}
      </Link>

      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8">
        {country && (
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-brand-200">
            <MapPin className="h-4 w-4" /> {country}
          </p>
        )}
        <h1 className="mt-1.5 font-display text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
          {name}
        </h1>
        {destination.photoCount != null && (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-white backdrop-blur">
              <Camera className="h-4 w-4" /> {t('destHeader.photos', { count: formatNumber(destination.photoCount) })}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
