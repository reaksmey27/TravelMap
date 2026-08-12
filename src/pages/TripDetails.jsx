import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Polyline } from 'react-leaflet'
import { ArrowLeft, Backpack, Calendar, MapPin, Pencil, Trash2 } from 'lucide-react'
import PageTransition from '../components/common/PageTransition'
import TripForm from '../components/trips/TripForm'
import TripTimeline from '../components/trips/TripTimeline'
import MapView from '../components/map/MapView'
import MapPopup from '../components/map/MapPopup'
import { pinIcon, photoPinIcon } from '../components/map/markers'
import FavoriteButton from '../components/common/FavoriteButton'
import ErrorState from '../components/common/ErrorState'
import EmptyState from '../components/common/EmptyState'
import { useTripStore } from '../store/tripStore'
import { useJournalStore } from '../store/journalStore'
import { useTranslation } from '../hooks/useTranslation'
import { formatRange, formatNumber } from '../utils/format'

export default function TripDetails() {
  const { t, lang } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const trip = useTripStore((s) => s.trips.find((t) => t.id === id))
  const updateTrip = useTripStore((s) => s.updateTrip)
  const deleteTrip = useTripStore((s) => s.deleteTrip)
  const entries = useJournalStore((s) => s.entries)
  const [editing, setEditing] = useState(false)
  const [modalIndex, setModalIndex] = useState(null)

  const relatedEntries = useMemo(
    () => entries.filter((e) => e.tripId === id),
    [entries, id]
  )

  if (!trip) {
    return (
      <PageTransition>
        <ErrorState
          title={t('tripDetails.notFound')}
          message={t('tripDetails.notFoundMsg')}
          onRetry={() => navigate('/trips')}
        />
      </PageTransition>
    )
  }

  const locationMarkers = trip.locations.map((loc, i) => ({
    id: `${trip.id}-loc-${i}`,
    lat: loc.lat,
    lon: loc.lon,
    icon: pinIcon({ color: i % 2 ? '#687F5C' : '#E05A26' }),
    popup: (
      <MapPopup title={loc.name} subtitle={t('map.day', { day: loc.day || 1 })} />
    ),
  }))

  const photoMarkers = trip.photos.map((url, i) => ({
    id: `${trip.id}-ph-${i}`,
    lat: trip.locations[i % Math.max(trip.locations.length, 1)]?.lat ?? trip.lat,
    lon: trip.locations[i % Math.max(trip.locations.length, 1)]?.lon ?? trip.lon,
    icon: photoPinIcon(url, 36),
    popup: <MapPopup image={url} title={trip.title} subtitle={t('tripDetails.photoLabel', { n: i + 1 })} />,
  }))

  const route = trip.locations
    .filter((l) => l.lat && l.lon)
    .map((l) => [l.lat, l.lon])

  const handleDelete = () => {
    if (window.confirm(t('tripDetails.deleteConfirm', { title: trip.title }))) {
      deleteTrip(id)
      navigate('/trips')
    }
  }

  const photos = trip.photos.map((url, i) => ({
    id: `${trip.id}-photo-${i}`,
    title: `${trip.title} — photo ${i + 1}`,
    description: `From my ${trip.destination} trip.`,
    city: trip.destination,
    country: trip.country,
    lat: trip.lat,
    lon: trip.lon,
    category: 'Trip',
    url,
    thumb: url,
    user: { name: 'Me', avatar: '' },
    likes: 0,
    date: trip.startDate,
    tags: [],
  }))

  return (
    <PageTransition>
      <div className="space-y-8">
        {/* Back */}
        <button
          onClick={() => navigate('/trips')}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 transition hover:text-ink-900"
        >
          <ArrowLeft className="h-4 w-4" /> {t('tripDetails.allTrips')}
        </button>

        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl shadow-card">
          <img src={trip.coverImage} alt={trip.title} className="h-64 w-full object-cover sm:h-80" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-900/85 via-ink-900/30 to-ink-900/10 dark:from-ink-950/85 dark:via-ink-950/30 dark:to-ink-950/10" />
          <div className="absolute right-4 top-4 flex items-center gap-2">
            <FavoriteButton type="trip" item={trip} />
            <button
              onClick={() => setEditing((e) => !e)}
              aria-label="Edit trip"
              className="grid h-9 w-9 place-items-center rounded-full bg-white/90 text-ink-700 shadow-soft backdrop-blur transition hover:bg-white dark:bg-sand-100/90 dark:text-ink-900 dark:hover:bg-sand-100"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              onClick={handleDelete}
              aria-label="Delete trip"
              className="grid h-9 w-9 place-items-center rounded-full bg-white/90 text-brand-600 shadow-soft backdrop-blur transition hover:bg-white dark:bg-sand-100/90 dark:hover:bg-sand-100"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-brand-200">
              <MapPin className="h-3.5 w-3.5" /> {trip.destination}, {trip.country}
            </p>
            <h1 className="mt-1.5 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              {trip.title}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-white backdrop-blur">
                <Calendar className="h-4 w-4" /> {formatRange(trip.startDate, trip.endDate, lang)}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-white backdrop-blur">
                <MapPin className="h-4 w-4" /> {t('tripDetails.placeCount', { count: trip.locations.length })}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-white backdrop-blur">
                <Backpack className="h-4 w-4" /> {t('tripDetails.photoCount', { count: trip.photos.length })}
              </span>
            </div>
          </div>
        </div>

        {trip.description && (
          <p className="max-w-3xl leading-relaxed text-ink-600">{trip.description}</p>
        )}

        {/* Inline editor */}
        <AnimatePresence>
          {editing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="rounded-3xl bg-white p-5 shadow-card sm:p-8 dark:bg-sand-100">
                <h2 className="mb-6 font-display text-xl font-bold text-ink-900">{t('tripDetails.editTrip')}</h2>
                <TripForm
                  initial={trip}
                  submitLabel={t('settings.saveChanges')}
                  onSubmit={(data) => {
                    updateTrip(id, data)
                    setEditing(false)
                  }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Grid: map + timeline */}
        <div className="grid gap-8 lg:grid-cols-2">
          <section aria-label={t('tripDetails.tripMap')}>
            <h2 className="mb-5 font-display text-xl font-bold text-ink-900">{t('tripDetails.tripMap')}</h2>
            <div className="h-[420px] overflow-hidden rounded-2xl shadow-card">
              <MapView
                center={[trip.lat, trip.lon]}
                zoom={trip.locations.length > 1 ? 10 : 12}
                markers={[...locationMarkers, ...photoMarkers]}
                cluster={false}
              >
                {route.length > 1 && (
                  <Polyline
                    positions={route}
                    pathOptions={{ color: '#E05A26', weight: 3, opacity: 0.7, dashArray: '8 8' }}
                  />
                )}
              </MapView>
            </div>
          </section>

          <section aria-label={t('tripDetails.timeline')}>
            <h2 className="mb-5 font-display text-xl font-bold text-ink-900">{t('tripDetails.timeline')}</h2>
            <TripTimeline locations={trip.locations} />
          </section>
        </div>

        {/* Photos */}
        <section aria-label={t('tripDetails.photos')}>
          <h2 className="mb-5 font-display text-xl font-bold text-ink-900">
            {t('tripDetails.photos')}
            <span className="ml-2 text-sm font-medium text-ink-400">
              {formatNumber(trip.photos.length)}
            </span>
          </h2>
          {photos.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {photos.map((photo, i) => (
                <motion.button
                  key={photo.id}
                  initial={{ opacity: 0, scale: 0.96 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => setModalIndex(i)}
                  className="group relative aspect-square overflow-hidden rounded-2xl shadow-soft"
                >
                  <img
                    src={photo.thumb}
                    alt={photo.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </motion.button>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Backpack}
              title={t('tripDetails.noPhotos')}
              message={t('tripDetails.noPhotosMsg')}
            />
          )}
        </section>

        {/* Linked journal */}
        {relatedEntries.length > 0 && (
          <section aria-label={t('tripDetails.journalEntries')}>
            <h2 className="mb-5 font-display text-xl font-bold text-ink-900">
              {t('tripDetails.journalEntries')}
            </h2>
            <div className="space-y-4">
              {relatedEntries.map((e) => (
                <Link
                  key={e.id}
                  to={`/journal/${e.id}`}
                  className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-soft transition hover:shadow-card dark:bg-sand-100"
                >
                  {e.photos?.[0] ? (
                    <img src={e.photos[0]} alt="" className="h-14 w-14 rounded-xl object-cover" />
                  ) : (
                    <span className="grid h-14 w-14 place-items-center rounded-xl bg-sand-100 text-ink-400">
                      <Backpack className="h-5 w-5" />
                    </span>
                  )}
                  <span>
                    <span className="block font-display font-bold text-ink-900">{e.title}</span>
                    <span className="block text-xs text-ink-400">{e.location || trip.destination}</span>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </PageTransition>
  )
}
