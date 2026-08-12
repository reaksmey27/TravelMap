import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Camera, Compass, Globe2, MapPin, Sparkles } from 'lucide-react'
import PageTransition from '../components/common/PageTransition'
import SectionHeading from '../components/common/SectionHeading'
import HeroSection from '../components/home/HeroSection'
import DestinationCard, { slugify } from '../components/destinations/DestinationCard'
import PhotoGrid from '../components/photos/PhotoGrid'
import PhotoModal from '../components/common/PhotoModal'
import TripCard from '../components/trips/TripCard'
import photoApi from '../services/photoApi'
import { searchLocations } from '../services/locationApi'
import { useTripStore } from '../store/tripStore'
import { useTranslation } from '../hooks/useTranslation'

const POPULAR_QUERIES = ['Barcelona', 'Tokyo', 'Paris', 'Bali', 'Bangkok', 'Rome']

export default function Home() {
  const { t } = useTranslation()
  const trips = useTripStore((s) => s.trips)
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modalIndex, setModalIndex] = useState(null)
  const [destinations, setDestinations] = useState([])
  const [destsLoading, setDestsLoading] = useState(true)

  const loadTrending = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await photoApi.getTrending({ perPage: 8 })
      setPhotos(data.photos)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Resolve popular places via live geocoding, then attach a live cover photo.
   * Nominatim's public API allows ~1 request/second, so lookups run one at a
   * time with a small stagger (covers are fetched in parallel afterwards).
   */
  const loadDestinations = async (isCancelled) => {
    setDestsLoading(true)
    try {
      const places = []
      for (let i = 0; i < POPULAR_QUERIES.length; i++) {
        if (isCancelled()) break
        const query = POPULAR_QUERIES[i]
        const found = await searchLocations(query, { limit: 1 })
        if (isCancelled()) break
        const place = found.find((p) => p.type === 'City' || p.type === 'Town') || found[0]
        if (place) places.push({ query, place })
        // Pace requests for Nominatim's public usage policy (skip the tail).
        if (i < POPULAR_QUERIES.length - 1) await new Promise((r) => setTimeout(r, 300))
      }
      if (isCancelled()) return

      const settled = await Promise.allSettled(
        places.map(async ({ query, place }) => {
          const cover = await photoApi.getPhotos({ query, page: 1, perPage: 1 })
          return {
            id: slugify(place.name),
            name: place.name,
            country: place.country,
            countryCode: place.countryCode,
            lat: place.lat,
            lon: place.lon,
            image: cover.photos[0]?.thumb || '',
            photoCount: null,
          }
        })
      )
      if (isCancelled()) return
      setDestinations(
        settled
          .filter((r) => r.status === 'fulfilled')
          .map((r) => r.value)
          .filter(Boolean)
      )
    } catch {
      if (!isCancelled()) setDestinations([])
    } finally {
      if (!isCancelled()) setDestsLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false
    const isCancelled = () => cancelled
    loadTrending()
    loadDestinations(isCancelled)
    return () => {
      cancelled = true
    }
  }, [])

  const popularTrips = trips.slice(0, 3)

  const stats = [
    { value: trips.length, label: t('common.trips'), icon: MapPin },
    { value: new Set(trips.map((t) => t.countryCode).filter(Boolean)).size, label: t('common.countries'), icon: Globe2 },
    { value: trips.reduce((acc, t) => acc + (t.photos?.length || 0), 0), label: t('common.photos'), icon: Camera },
  ]

  return (
    <PageTransition>
      <div className="space-y-20 sm:space-y-24">
        <HeroSection />

        <section aria-label="Popular destinations">
          <SectionHeading
            eyebrow={t('home.eyebrowTop')}
            title={t('home.popularTitle')}
            subtitle={t('home.popularSub')}
            linkTo="/map"
            linkLabel={t('home.exploreMap')}
          />
          {destsLoading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="aspect-[4/3] overflow-hidden rounded-2xl bg-sand-100 skeleton" />
              ))}
            </div>
          ) : destinations.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {destinations.map((dest, i) => (
                <DestinationCard key={dest.id} destination={dest} index={i} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-sand-300 bg-white p-10 text-center dark:bg-sand-100">
              <p className="text-sm text-ink-500">{t('home.geocodeError')}</p>
              <Link
                to="/map"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600"
              >
                <Compass className="h-4 w-4" /> {t('home.openMap')}
              </Link>
            </div>
          )}
        </section>

        <section aria-label="Trending travel photos">
          <SectionHeading
            eyebrow={t('home.eyebrowTrending')}
            title={t('home.trendingTitle')}
            subtitle={t('home.trendingSub')}
            linkTo="/explore"
            linkLabel={t('home.browseGallery')}
          />
          <PhotoGrid
            photos={photos}
            loading={loading}
            error={error}
            onRetry={loadTrending}
            onPhotoClick={(photo) => setModalIndex(photos.findIndex((p) => p.id === photo.id))}
            skeletonCount={8}
          />
        </section>

        <section aria-label="Your trips">
          <SectionHeading
            eyebrow={t('home.eyebrowTrips')}
            title={t('home.tripsTitle')}
            subtitle={t('home.tripsSub')}
            linkTo="/trips"
            linkLabel={t('home.allTrips')}
          />
          {popularTrips.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {popularTrips.map((trip, i) => (
                <TripCard key={trip.id} trip={trip} index={i} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-sand-300 bg-white p-10 text-center dark:bg-sand-100">
              <p className="text-sm text-ink-500">{t('home.noTripsCta')}</p>
              <Link
                to="/trips/create"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600"
              >
                <Compass className="h-4 w-4" /> {t('home.createTrip')}
              </Link>
            </div>
          )}
        </section>

        {stats.some((s) => s.value > 0) && (
          <section aria-label="Your travel statistics">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative overflow-hidden rounded-3xl bg-ink-900 px-6 py-12 shadow-card sm:px-10 dark:bg-ink-950"
            >
              <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand-500/20 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-sage-500/20 blur-3xl" />
              <div className="relative">
                <div className="flex items-center gap-2 text-brand-300">
                  <Sparkles className="h-5 w-5" />
                  <p className="text-xs font-semibold uppercase tracking-[0.25em]">
                    {t('home.journeySoFar')}
                  </p>
                </div>
                <div className="mt-8 grid grid-cols-3 gap-6">
                  {stats.map((stat, i) => (
                    <div key={stat.label} className="text-center lg:text-left">
                      <stat.icon className="mx-auto h-5 w-5 text-brand-300 lg:mx-0" />
                      <p className="mt-2 font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                        {stat.value}
                      </p>
                      <p className="mt-1.5 text-sm font-medium text-white/60">{stat.label}</p>
                      {i < stats.length - 1 && (
                        <div className="mx-auto mt-5 hidden h-px w-16 bg-white/20 lg:mx-0 lg:block" />
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-8">
                  <p className="text-sm text-white/60">
                    {t('home.localNote')}
                  </p>
                  <Link
                    to="/map"
                    className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-ink-900 transition hover:bg-sand-100 dark:bg-sand-100 dark:text-ink-900 dark:hover:bg-sand-200"
                  >
                    {t('home.openMap')}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </section>
        )}
      </div>

      {modalIndex != null && photos[modalIndex] && (
        <PhotoModal
          photos={photos}
          index={modalIndex}
          onClose={() => setModalIndex(null)}
          onNavigate={setModalIndex}
        />
      )}
    </PageTransition>
  )
}
