import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpen, Camera, Globe2, MapPin, MapPinned } from 'lucide-react'
import PageTransition from '../components/common/PageTransition'
import ProfileHeader from '../components/profile/ProfileHeader'
import FilterTabs from '../components/common/FilterTabs'
import PhotoGrid from '../components/photos/PhotoGrid'
import TripCard from '../components/trips/TripCard'
import JournalCard from '../components/journal/JournalCard'
import MapView from '../components/map/MapView'
import MapPopup from '../components/map/MapPopup'
import { pinIcon } from '../components/map/markers'
import EmptyState from '../components/common/EmptyState'
import { useUserStore } from '../store/userStore'
import { useTripStore } from '../store/tripStore'
import { useJournalStore } from '../store/journalStore'
import { useFavoriteStore } from '../store/favoriteStore'
import { TRIP_YEARS } from '../utils/constants'
import { useTranslation } from '../hooks/useTranslation'

const TABS = ['profile.tabPhotos', 'profile.tabTrips', 'profile.tabJournal', 'profile.tabMap']

const YEAR_COLORS = { 2026: '#E05A26', 2025: '#3D6C8F', 2024: '#687F5C' }

export default function Profile() {
  const { t } = useTranslation()
  const [tab, setTab] = useState(TABS[0])
  const [year, setYear] = useState('all')
  const profile = useUserStore((s) => s.profile)
  const trips = useTripStore((s) => s.trips)
  const entries = useJournalStore((s) => s.entries)
  const favPhotos = useFavoriteStore((s) => s.photos)

  const filteredTrips = useMemo(
    () =>
      year === 'all'
        ? trips
        : trips.filter((t) => t.startDate?.startsWith(year)),
    [trips, year]
  )

  const myPhotos = useMemo(
    () => [
      ...favPhotos.map((p) => ({ ...p, mine: true })),
      ...trips.flatMap((t) =>
        (t.photos || []).map((url, i) => ({
          id: `${t.id}-photo-${i}`,
          title: t.title,
          description: `From my ${t.destination} trip.`,
          city: t.destination,
          country: t.country,
          lat: t.lat,
          lon: t.lon,
          category: 'Trip',
          url,
          thumb: url,
          user: { name: profile.name, avatar: profile.avatar },
          likes: 0,
          date: t.startDate,
          tags: [],
        }))
      ),
    ],
    [favPhotos, trips, profile]
  )

  // ---- Personal map stats ----
  const mapStats = useMemo(() => {
    const all = filteredTrips
    const countries = new Set(all.map((t) => t.countryCode).filter(Boolean)).size
    const cities = new Set(
      all.flatMap((t) => [t.destination, ...(t.locations || []).map((l) => l.name)])
    ).size
    const tripPhotos = all.reduce((acc, t) => acc + (t.photos?.length || 0), 0)
    return [
      { value: countries, label: t('common.countries'), icon: Globe2 },
      { value: cities, label: t('common.places'), icon: MapPin },
      { value: all.length, label: t('common.trips'), icon: MapPinned },
      { value: tripPhotos, label: t('common.photos'), icon: Camera },
    ]
  }, [filteredTrips, t])

  const mapMarkers = useMemo(
    () =>
      filteredTrips.flatMap((trip) => {
        const color = YEAR_COLORS[trip.startDate?.slice(0, 4)] || '#E05A26'
        const main = {
          id: `trip-${trip.id}`,
          lat: trip.lat,
          lon: trip.lon,
          icon: pinIcon({ color }),
          popup: (
            <MapPopup
              image={trip.coverImage}
              title={trip.title}
              subtitle={trip.destination}
              to={`/trips/${trip.id}`}
            />
          ),
        }
        const places = (trip.locations || []).map((l, i) => ({
          id: `${trip.id}-loc-${i}`,
          lat: l.lat,
          lon: l.lon,
          icon: pinIcon({ color: i % 2 ? '#849C75' : '#C98A2D' }),
          popup: (
            <MapPopup
              title={l.name}
              subtitle={trip.destination}
              to={`/trips/${trip.id}`}
            />
          ),
        }))
        return [main, ...places]
      }),
    [filteredTrips]
  )

  const visitedCities = useMemo(
    () => [...new Set(filteredTrips.map((t) => t.destination))].slice(0, 12),
    [filteredTrips]
  )

  const headerStats = [
    { value: trips.length, label: t('common.trips'), accent: true },
    { value: myPhotos.length, label: t('common.photos') },
    { value: new Set(trips.flatMap((t) => t.locations || []).map((l) => l.name)).size, label: t('common.places') },
    { value: new Set(trips.map((t) => t.countryCode).filter(Boolean)).size, label: t('common.countries') },
  ]

  return (
    <PageTransition>
      <div className="space-y-8">
        <ProfileHeader profile={profile} stats={headerStats} />

        <FilterTabs options={TABS} value={tab} onChange={setTab} />

        {tab === 'profile.tabPhotos' && (
          <div>
            <PhotoGrid
              photos={myPhotos}
              loading={false}
              emptyTitle={t('profile.noPhotos')}
              emptyMessage={t('profile.noPhotosMsg')}
            />
          </div>
        )}

        {tab === 'profile.tabTrips' && (
          <div>
            {trips.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {trips.map((trip, i) => (
                  <TripCard key={trip.id} trip={trip} index={i} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={MapPinned}
                title={t('profile.noTrips')}
                message={t('profile.noTripsMsg')}
                action={
                  <Link
                    to="/trips/create"
                    className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-600"
                  >
                    {t('profile.createTrip')}
                  </Link>
                }
              />
            )}
          </div>
        )}

        {tab === 'profile.tabJournal' && (
          <div>
            {entries.length > 0 ? (
              <div className="space-y-5">
                {entries.map((entry, i) => (
                  <JournalCard key={entry.id} entry={entry} index={i} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={BookOpen}
                title={t('profile.noJournal')}
                message={t('profile.noJournalMsg')}
              />
            )}
          </div>
        )}

        {tab === 'profile.tabMap' && (
          <div className="space-y-6">
            {/* Personal map stats */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {mapStats.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="rounded-2xl border border-sand-200 bg-white p-4 shadow-soft dark:bg-sand-100"
                >
                  <s.icon className="h-5 w-5 text-brand-500" />
                  <p className="mt-2 font-display text-2xl font-extrabold text-ink-900">{s.value}</p>
                  <p className="text-xs font-medium uppercase tracking-wide text-ink-400">{s.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Year filter */}
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-display text-xl font-bold text-ink-900">{t('profile.myMap')}</h2>
              <FilterTabs
                options={TRIP_YEARS.map((y) => (y === 'all' ? { id: 'all', labelKey: 'years.all' } : { id: y, labelKey: y }))}
                value={year}
                onChange={setYear}
                className="!flex-nowrap"
              />
            </div>

            {/* Map */}
            <div className="h-[420px] overflow-hidden rounded-2xl shadow-card">
              <MapView
                center={filteredTrips.length ? [filteredTrips[0].lat, filteredTrips[0].lon] : [20, 0]}
                zoom={filteredTrips.length ? 3 : 2}
                markers={mapMarkers}
              />
            </div>

            {/* Visited cities */}
            {visitedCities.length > 0 && (
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-400">
                  {t('profile.visited')}
                </p>
                <div className="flex flex-wrap gap-2">
                  {visitedCities.map((city) => (
                    <span
                      key={city}
                      className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-sm font-medium text-ink-700 shadow-soft dark:bg-sand-100"
                    >
                      <MapPin className="h-3.5 w-3.5 text-brand-500" />
                      {city}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </PageTransition>
  )
}
