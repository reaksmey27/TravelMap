import { Link } from 'react-router-dom'
import { Backpack, Camera, Globe2, MapPin, Plus } from 'lucide-react'
import PageTransition from '../components/common/PageTransition'
import MetricCard from '../components/common/MetricCard'
import TripCard from '../components/trips/TripCard'
import EmptyState from '../components/common/EmptyState'
import { useTripStore } from '../store/tripStore'
import { useTranslation } from '../hooks/useTranslation'

export default function Trips() {
  const { t } = useTranslation()
  const trips = useTripStore((s) => s.trips)

  const places = trips.reduce((acc, t) => acc + (t.locations?.length || 0), 0)
  const tripPhotos = trips.reduce((acc, t) => acc + (t.photos?.length || 0), 0)
  const countries = new Set(trips.map((t) => t.countryCode).filter(Boolean)).size

  const stats = [
    { value: trips.length, label: t('common.trips'), icon: Backpack },
    { value: places, label: t('common.places'), icon: MapPin },
    { value: tripPhotos, label: t('common.photos'), icon: Camera },
    { value: countries, label: t('common.countries'), icon: Globe2 },
  ]

  return (
    <PageTransition>
      <div className="space-y-8">
        <header className="relative overflow-hidden rounded-3xl bg-ink-900 px-6 py-10 shadow-card sm:px-10 dark:bg-ink-950">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 left-1/3 h-56 w-56 rounded-full bg-sage-500/15 blur-3xl" />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-300">
                {t('trips.eyebrow')}
              </p>
              <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                {t('trips.title')}
              </h1>
              <p className="mt-2 max-w-md text-sm text-white/60">
                {t('trips.sub')}
              </p>
            </div>
            <Link
              to="/trips/create"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:bg-brand-600 active:scale-95"
            >
              <Plus className="h-4 w-4" /> {t('trips.create')}
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((s, i) => (
            <MetricCard key={s.label} icon={s.icon} value={s.value} label={s.label} index={i} />
          ))}
        </div>

        {trips.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {trips.map((trip, i) => (
              <TripCard key={trip.id} trip={trip} index={i} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Backpack}
            title={t('trips.emptyTitle')}
            message={t('trips.emptyMsg')}
            action={
              <Link
                to="/trips/create"
                className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-600"
              >
                <Plus className="h-4 w-4" /> {t('trips.createFirst')}
              </Link>
            }
          />
        )}
      </div>
    </PageTransition>
  )
}
