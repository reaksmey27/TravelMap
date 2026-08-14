import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowUpRight, Calendar, Camera, MapPin } from 'lucide-react'
import { formatRange } from '../../utils/format'
import { useTranslation } from '../../hooks/useTranslation'
import { cn } from '../../utils/cn'
import FavoriteButton from '../common/FavoriteButton'

/** Trip length in days — from the dates when available, else the last logged day. */
export function tripDays(trip) {
  if (trip.startDate && trip.endDate) {
    const s = new Date(trip.startDate)
    const e = new Date(trip.endDate)
    if (!Number.isNaN(s.getTime()) && !Number.isNaN(e.getTime())) {
      const days = Math.round((e - s) / 86400000) + 1
      if (days > 0) return days
    }
  }
  const maxDay = trip.locations?.reduce((m, loc) => Math.max(m, loc.day || 0), 0)
  return maxDay > 0 ? maxDay : null
}

/** Where the trip sits relative to today: 'upcoming' | 'ongoing' | 'past' | null. */
export function tripStatus(trip) {
  if (!trip.startDate) return null
  const today = new Date()
  const ymd = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  const todayStr = ymd(today)
  if (trip.endDate && trip.endDate < todayStr) return 'past'
  if (trip.startDate > todayStr) return 'upcoming'
  return 'ongoing'
}

export const STATUS_STYLES = {
  upcoming: 'text-brand-600',
  ongoing: 'text-sage-600',
  past: 'text-ink-500',
}

export default function TripCard({ trip, index = 0 }) {
  const { t, lang } = useTranslation()
  const [loaded, setLoaded] = useState(false)

  const days = tripDays(trip)
  const status = tripStatus(trip)
  const dateRange = formatRange(trip.startDate, trip.endDate, lang)
  const locations = trip.locations || []
  const photos = trip.photos || []
  const visibleLocations = locations.slice(0, 3)
  const extraLocations = locations.length - visibleLocations.length

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay: (index % 3) * 0.07 }}
    >
      <Link
        to={`/trips/${trip.id}`}
        className="group block overflow-hidden rounded-2xl bg-white shadow-soft transition-shadow duration-300 hover:shadow-lift dark:bg-sand-100"
      >
        <div className="relative aspect-[16/9] overflow-hidden">
          {trip.coverImage ? (
            <>
              {!loaded && <div className="skeleton absolute inset-0" aria-hidden="true" />}
              <img
                src={trip.coverImage}
                alt={trip.title}
                loading="lazy"
                onLoad={() => setLoaded(true)}
                className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                  loaded ? 'opacity-100' : 'opacity-0'
                }`}
              />
            </>
          ) : (
            <div className="grid h-full w-full place-items-center bg-gradient-to-br from-brand-500/90 to-sage-500/80">
              <span className="font-display text-5xl font-extrabold text-white/90">
                {(trip.destination || trip.title || '?').charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink-900/70 to-transparent dark:from-ink-950/70" />

          {status && (
            <div className="absolute left-3 top-3">
              <span
                className={cn(
                  'rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold shadow-soft backdrop-blur dark:bg-sand-100/90',
                  STATUS_STYLES[status]
                )}
              >
                {t(`tripCard.${status}`)}
              </span>
            </div>
          )}
          <div className="absolute right-3 top-3">
            <FavoriteButton type="trip" item={trip} />
          </div>

          {(dateRange || days) && (
            <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-2">
              {dateRange && (
                <span className="flex items-center gap-1.5 text-xs font-medium text-white/90">
                  <Calendar className="h-3.5 w-3.5" />
                  {dateRange}
                </span>
              )}
              {days && (
                <span className="shrink-0 rounded-full bg-ink-900/60 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
                  {t('tripCard.days', { count: days })}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="p-5">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-display text-lg font-bold text-ink-900 transition group-hover:text-brand-600">
              {trip.title}
            </h3>
            <ArrowUpRight className="h-4 w-4 shrink-0 -translate-x-1 text-brand-500 opacity-0 transition duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
          </div>

          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-ink-500">
            <MapPin className="h-4 w-4 shrink-0 text-brand-500" />
            <span className="truncate">{trip.destination}</span>
            {trip.country && (
              <span className="ml-auto shrink-0 rounded-full bg-sage-500/10 px-2.5 py-1 text-[11px] font-semibold text-sage-600">
                {trip.country}
              </span>
            )}
          </p>

          {trip.description && (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-500">{trip.description}</p>
          )}

          {locations.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              {visibleLocations.map((loc, i) => (
                <span
                  key={`${loc.name}-${i}`}
                  className="max-w-[9rem] truncate rounded-full bg-sand-100 px-2.5 py-0.5 text-[11px] font-medium text-ink-500 dark:bg-sand-200/50"
                >
                  {loc.name}
                </span>
              ))}
              {extraLocations > 0 && (
                <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-[11px] font-semibold text-brand-600">
                  {t('tripCard.more', { count: extraLocations })}
                </span>
              )}
            </div>
          )}

          <div className="mt-4 flex items-center justify-between gap-4 border-t border-sand-100 pt-4 text-xs font-medium text-ink-500 dark:border-sand-200/50">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-ink-400" />
              {t('tripCard.places', { count: locations.length })}
            </span>
            <span className="flex items-center gap-2">
              {photos.length > 0 ? (
                <span className="flex -space-x-2">
                  {photos.slice(0, 3).map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt=""
                      loading="lazy"
                      className="h-6 w-6 rounded-full border-2 border-white object-cover dark:border-sand-100"
                    />
                  ))}
                </span>
              ) : (
                <Camera className="h-4 w-4 text-ink-400" />
              )}
              {t('tripCard.photos', { count: photos.length })}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
