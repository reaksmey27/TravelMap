import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpen, Camera, Globe2, Heart, Lock, MapPin, MapPinned, Plane } from 'lucide-react'
import PageTransition from '../components/common/PageTransition'
import ProfileHeader from '../components/profile/ProfileHeader'
import FilterTabs from '../components/common/FilterTabs'
import MetricCard from '../components/common/MetricCard'
import PhotoGrid from '../components/photos/PhotoGrid'
import PhotoModal from '../components/common/PhotoModal'
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
import { compactNumber } from '../utils/format'
import { useTranslation } from '../hooks/useTranslation'
import { cn } from '../utils/cn'

const TABS = ['profile.tabPhotos', 'profile.tabTrips', 'profile.tabJournal', 'profile.tabMap']

const YEAR_COLORS = { 2026: '#E05A26', 2025: '#3D6C8F', 2024: '#687F5C' }
const YEAR_PALETTE = ['#C98A2D', '#849C75', '#8A5A83', '#C0553C', '#4A6FA5', '#5B8C8C']

function yearColor(year) {
  if (YEAR_COLORS[year]) return YEAR_COLORS[year]
  const hash = String(year).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return YEAR_PALETTE[hash % YEAR_PALETTE.length]
}

function haversineKm(a, b) {
  const R = 6371
  const toRad = (d) => (d * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLon = toRad(b.lon - a.lon)
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(s))
}

export default function Profile() {
  const { t } = useTranslation()
  const [tab, setTab] = useState(TABS[0])
  const [year, setYear] = useState('all')
  const [modalIndex, setModalIndex] = useState(null)
  const profile = useUserStore((s) => s.profile)
  const trips = useTripStore((s) => s.trips)
  const entries = useJournalStore((s) => s.entries)
  const favPhotos = useFavoriteStore((s) => s.photos)

  const lifetime = useMemo(() => {
    const withCoords = trips
      .filter((tr) => tr.lat != null && tr.lon != null)
      .sort((a, b) => (a.startDate || '').localeCompare(b.startDate || ''))
    let km = 0
    for (let i = 1; i < withCoords.length; i++) {
      km += haversineKm(withCoords[i - 1], withCoords[i])
    }
    const dateYears = trips
      .map((tr) => tr.startDate?.slice(0, 4))
      .filter(Boolean)
      .map(Number)
    const span = dateYears.length
      ? Math.max(...dateYears) - Math.min(...dateYears) + 1
      : 0
    const countries = new Set(trips.map((tr) => tr.countryCode).filter(Boolean)).size
    const places = new Set(
      trips.flatMap((tr) => [tr.destination, ...(tr.locations || []).map((l) => l.name)]).filter(Boolean)
    ).size
    return {
      km: Math.round(km / 10) * 10,
      yearsOnRoad: Math.max(span, trips.length > 0 ? 1 : 0),
      countries,
      places,
    }
  }, [trips])

  const filteredTrips = useMemo(
    () =>
      year === 'all'
        ? trips
        : trips.filter((t) => t.startDate?.startsWith(year)),
    [trips, year]
  )

  const tripYears = useMemo(
    () => [
      'all',
      ...new Set([...TRIP_YEARS.slice(1), ...trips.map((tr) => tr.startDate?.slice(0, 4)).filter(Boolean)]),
    ],
    [trips]
  )

  const myPhotos = useMemo(() => {
    const fromFavorites = favPhotos.map((p) => ({ ...p, mine: true }))
    const fromTrips = trips.flatMap((t) =>
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
        synthetic: true,
      }))
    )
    const seen = new Set()
    return [...fromFavorites, ...fromTrips].filter((p) =>
      seen.has(p.url) ? false : (seen.add(p.url), true)
    )
  }, [favPhotos, trips, profile])

  const badges = useMemo(
    () => [
      {
        id: 'first-trip',
        icon: MapPinned,
        title: t('profile.badge.firstTrip'),
        desc: t('profile.badge.firstTripDesc'),
        earned: trips.length > 0,
      },
      {
        id: 'explorer',
        icon: Globe2,
        title: t('profile.badge.explorer'),
        desc: t('profile.badge.explorerDesc'),
        earned: lifetime.countries >= 3,
      },
      {
        id: 'city-hopper',
        icon: MapPin,
        title: t('profile.badge.cityHopper'),
        desc: t('profile.badge.cityHopperDesc'),
        earned: lifetime.places >= 10,
      },
      {
        id: 'storyteller',
        icon: BookOpen,
        title: t('profile.badge.storyteller'),
        desc: t('profile.badge.storytellerDesc'),
        earned: entries.length >= 3,
      },
      {
        id: 'collector',
        icon: Heart,
        title: t('profile.badge.collector'),
        desc: t('profile.badge.collectorDesc'),
        earned: favPhotos.length >= 5,
      },
      {
        id: 'backpacker',
        icon: Plane,
        title: t('profile.badge.backpacker'),
        desc: t('profile.badge.backpackerDesc'),
        earned: lifetime.km >= 2000,
      },
    ],
    [trips.length, entries.length, favPhotos.length, lifetime, t]
  )

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
        const color = yearColor(trip.startDate?.slice(0, 4))
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
    () => [...new Set(filteredTrips.map((t) => t.destination).filter(Boolean))].slice(0, 12),
    [filteredTrips]
  )

  const headerStats = [
    { id: 'trips', value: trips.length, label: t('common.trips'), accent: true },
    { id: 'photos', value: myPhotos.length, label: t('common.photos') },
    { id: 'places', value: lifetime.places, label: t('common.places') },
    { id: 'countries', value: lifetime.countries, label: t('common.countries') },
  ]

  const tabCounts = [myPhotos.length, trips.length, entries.length]
  const tabOptions = TABS.map((key, i) => ({
    id: key,
    labelKey: key,
    count: i < 3 ? tabCounts[i] : undefined,
  }))

  return (
    <PageTransition>
      <div className="space-y-8">
        <ProfileHeader profile={profile} stats={headerStats} />

        <section aria-label={t('profile.badges')}>
          <div className="mb-3 flex items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-lg font-bold text-ink-900">{t('profile.badges')}</h2>
              <p className="text-xs text-ink-400">{t('profile.badgesSub')}</p>
            </div>
          </div>
          <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
            {badges.map((badge, i) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                title={badge.earned ? badge.desc : `${t('profile.locked')} — ${badge.desc}`}
                className={cn(
                  'group/badge relative w-36 shrink-0 rounded-2xl border p-4 text-center transition-all duration-300',
                  badge.earned
                    ? 'border-brand-200 bg-white shadow-soft hover:-translate-y-1 hover:shadow-card dark:bg-sand-100'
                    : 'border-sand-200 bg-sand-50/60 opacity-70 dark:bg-sand-100'
                )}
              >
                <span
                  className={cn(
                    'mx-auto grid h-11 w-11 place-items-center rounded-xl transition-transform duration-300 group-hover/badge:scale-110',
                    badge.earned ? 'bg-brand-50 text-brand-500' : 'bg-sand-100 text-ink-400'
                  )}
                >
                  <badge.icon className="h-5 w-5" />
                </span>
                {!badge.earned && (
                  <span className="absolute right-2 top-2 text-ink-300">
                    <Lock className="h-3.5 w-3.5" />
                  </span>
                )}
                <p
                  className={cn(
                    'mt-2.5 text-sm font-bold',
                    badge.earned ? 'text-ink-900' : 'text-ink-400'
                  )}
                >
                  {badge.title}
                </p>
                <p className="mt-0.5 text-[11px] leading-snug text-ink-400">{badge.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <FilterTabs options={tabOptions} value={tab} onChange={setTab} />

        {tab === 'profile.tabPhotos' && (
          <div>
            <PhotoGrid
              photos={myPhotos}
              loading={false}
              onPhotoClick={(photo) => setModalIndex(myPhotos.findIndex((p) => p.id === photo.id))}
              emptyTitle={t('profile.noPhotos')}
              emptyMessage={t('profile.noPhotosMsg')}
            />
            {modalIndex != null && myPhotos[modalIndex] && (
              <PhotoModal
                photos={myPhotos}
                index={modalIndex}
                onClose={() => setModalIndex(null)}
                onNavigate={setModalIndex}
              />
            )}
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
            {trips.length > 0 && (
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 via-brand-500 to-ink-800 p-6 text-white shadow-card">
                <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
                <div className="relative flex flex-wrap items-center gap-x-10 gap-y-4">
                  {lifetime.km > 0 && (
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-white/70">
                        {t('profile.distanceLabel')}
                      </p>
                      <p className="font-display text-3xl font-extrabold tracking-tight">
                        ~{compactNumber(lifetime.km)} <span className="text-lg font-bold text-white/80">km</span>
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-white/70">
                      {t('common.countries')}
                    </p>
                    <p className="font-display text-3xl font-extrabold tracking-tight">
                      {lifetime.countries}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-white/70">
                      {t('profile.yearsLabel')}
                    </p>
                    <p className="font-display text-3xl font-extrabold tracking-tight">
                      {lifetime.yearsOnRoad}
                    </p>
                  </div>
                  <p className="ml-auto hidden max-w-[220px] text-right text-sm leading-relaxed text-white/70 sm:block">
                    {t('profile.journeyHint')}
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {mapStats.map((s, i) => (
                <MetricCard key={s.label} icon={s.icon} value={s.value} label={s.label} index={i} />
              ))}
            </div>

            <div className="flex items-center justify-between gap-4">
              <h2 className="font-display text-xl font-bold text-ink-900">{t('profile.myMap')}</h2>
              <FilterTabs
                options={tripYears.map((y) => (y === 'all' ? { id: 'all', labelKey: 'years.all' } : { id: y, labelKey: y }))}
                value={year}
                onChange={setYear}
                className="!flex-nowrap"
              />
            </div>

            <div className="h-[420px] overflow-hidden rounded-2xl shadow-card">
              <MapView
                center={filteredTrips.length ? [filteredTrips[0].lat, filteredTrips[0].lon] : [20, 0]}
                zoom={filteredTrips.length ? 3 : 2}
                markers={mapMarkers}
              />
            </div>

            {visitedCities.length > 0 && (
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-400">
                  {t('profile.visited')}
                </p>
                <div className="flex flex-wrap gap-2">
                  {visitedCities.map((city) => (
                    <span
                      key={city}
                      className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-sm font-medium text-ink-700 shadow-soft transition hover:-translate-y-0.5 hover:shadow-card dark:bg-sand-100"
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
