import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, Camera, MapPin } from 'lucide-react'
import { formatRange } from '../../utils/format'
import { useTranslation } from '../../hooks/useTranslation'
import FavoriteButton from '../common/FavoriteButton'

export default function TripCard({ trip, index = 0 }) {
  const { t, lang } = useTranslation()
  const [loaded, setLoaded] = useState(false)

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
          <div className="absolute inset-0 bg-gradient-to-t from-ink-900/70 to-transparent dark:from-ink-950/70" />
          <div className="absolute right-3 top-3">
            <FavoriteButton type="trip" item={trip} />
          </div>
          <div className="absolute bottom-3 left-4 flex items-center gap-1.5 text-xs font-medium text-white/90">
            <Calendar className="h-3.5 w-3.5" />
            {formatRange(trip.startDate, trip.endDate, lang)}
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="truncate font-display text-lg font-bold text-ink-900">{trip.title}</h3>
            <span className="shrink-0 rounded-full bg-sage-500/10 px-2.5 py-1 text-[11px] font-semibold text-sage-600">
              {trip.country}
            </span>
          </div>
          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-ink-500">
            <MapPin className="h-4 w-4 text-brand-500" />
            {trip.destination}
          </p>
          <div className="mt-4 flex items-center gap-4 border-t border-sand-100 pt-4 text-xs font-medium text-ink-500">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-ink-400" />
              {t('tripCard.places', { count: trip.locations?.length || 0 })}
            </span>
            <span className="flex items-center gap-1.5">
              <Camera className="h-4 w-4 text-ink-400" />
              {t('tripCard.photos', { count: trip.photos?.length || 0 })}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
