import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Camera, MapPin } from 'lucide-react'
import { useTranslation } from '../../hooks/useTranslation'
import FavoriteButton from '../common/FavoriteButton'

function slugify(name = '') {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

/**
 * Destination card for live (geocoded / photo-derived) destinations.
 * destination: { id, name, country, lat, lon, image?, photoCount? }
 */
export default function DestinationCard({ destination, index = 0 }) {
  const { t } = useTranslation()
  const [loaded, setLoaded] = useState(false)
  const name = destination.name || destination.city || t('common.unknownPlace')
  const country = destination.country || ''
  const image = destination.image
  const to = `/destinations/${encodeURIComponent(name)}`

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay: (index % 4) * 0.07 }}
    >
      <Link
        to={to}
        className="group relative block overflow-hidden rounded-2xl bg-white shadow-soft transition-shadow duration-300 hover:shadow-lift dark:bg-sand-100"
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          {image ? (
            <>
              {!loaded && <div className="skeleton absolute inset-0" aria-hidden="true" />}
              <img
                src={image}
                alt={name}
                loading="lazy"
                onLoad={() => setLoaded(true)}
                className={`h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 ${
                  loaded ? 'opacity-100' : 'opacity-0'
                }`}
              />
            </>
          ) : (
            <div className="grid h-full w-full place-items-center bg-gradient-to-br from-brand-500/90 to-sage-500/80">
              <span className="font-display text-5xl font-extrabold text-white/90">
                {name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink-900/75 via-ink-900/10 to-transparent dark:from-ink-950/75 dark:via-ink-950/10" />

          {/* Top-right favorite */}
          <div className="absolute right-3 top-3">
            <FavoriteButton type="destination" item={destination} />
          </div>

          {/* Bottom content */}
          <div className="absolute inset-x-0 bottom-0 p-4">
            {country && (
              <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-brand-200">
                <MapPin className="h-3 w-3" />
                {country}
              </p>
            )}
            <div className="mt-1 flex items-end justify-between gap-2">
              <h3 className="font-display text-lg font-bold text-white">{name}</h3>
            </div>
            {destination.photoCount != null && (
              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-white/85">
                <Camera className="h-3.5 w-3.5" />
                {t('destCard.photos', { count: destination.photoCount })}
              </p>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export { slugify }
