import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import PageTransition from '../components/common/PageTransition'
import DestinationHeader from '../components/destinations/DestinationHeader'
import PhotoGrid from '../components/photos/PhotoGrid'
import PhotoModal from '../components/common/PhotoModal'
import MapView from '../components/map/MapView'
import MapPopup from '../components/map/MapPopup'
import { pinIcon, photoPinIcon } from '../components/map/markers'
import WeatherCard from '../components/weather/WeatherCard'
import CountryInfoCard from '../components/country/CountryInfoCard'
import FavoriteButton from '../components/common/FavoriteButton'
import ErrorState from '../components/common/ErrorState'
import LoadingSkeleton from '../components/common/LoadingSkeleton'
import photoApi from '../services/photoApi'
import { searchLocations } from '../services/locationApi'
import { useTranslation } from '../hooks/useTranslation'
import { formatNumber } from '../utils/format'

export default function DestinationDetails() {
  const { t } = useTranslation()
  const { id } = useParams()
  const name = decodeURIComponent(id || '')
  const navigate = useNavigate()

  const [destination, setDestination] = useState(null)
  const [geocodeError, setGeocodeError] = useState(null)
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modalIndex, setModalIndex] = useState(null)
  const [flyTo, setFlyTo] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setPhotos([])
      setModalIndex(null)
      setDestination(null)
      setGeocodeError(null)
      setLoading(true)
      try {
        const places = await searchLocations(name, { limit: 3 })
        if (cancelled) return
        const place =
          places.find((p) => p.type === 'City' || p.type === 'Town') || places[0]
        if (!place) {
          setGeocodeError(true)
          setLoading(false)
          return
        }
        const dest = {
          id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          name: place.name,
          country: place.country,
          countryCode: place.countryCode,
          lat: place.lat,
          lon: place.lon,
        }
        setDestination(dest)
        setLoading(false)
        try {
          const data = await photoApi.getPhotosByDestination(dest)
          if (!cancelled) {
            setPhotos(data.photos)
            if (data.photos[0]) {
              // Use the high-res (regular/large) URL — the thumbnail is ~400px
              // and gets upscaled into a full-width header, which looks blurry.
              setDestination((d) => ({ ...d, image: data.photos[0].url, photoCount: data.photos.length }))
            }
          }
        } catch (err) {
          if (!cancelled) setError(err)
        }
      } catch (err) {
        if (!cancelled) setGeocodeError(err)
        setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [name])

  const markers = useMemo(() => {
    if (!destination) return []
    return [
      {
        id: `main-${destination.id}`,
        lat: destination.lat,
        lon: destination.lon,
        icon: pinIcon(),
        popup: (
          <MapPopup
            title={destination.name}
            subtitle={destination.country}
            onView={() => setFlyTo({ center: [destination.lat, destination.lon], zoom: 13 })}
          />
        ),
      },
      ...photos
        .filter((p) => p.lat != null && p.lon != null)
        .slice(0, 12)
        .map((p) => ({
          id: p.id,
          lat: p.lat,
          lon: p.lon,
          icon: photoPinIcon(p.thumb),
          popup: (
            <MapPopup
              image={p.thumb}
              title={p.title}
              subtitle={destination.name}
              photoCount={p.likes}
              onView={() => navigate(`/photos/${p.id}`)}
            />
          ),
        })),
    ]
  }, [destination, photos, navigate])

  if (loading) {
    return (
      <PageTransition>
        <LoadingSkeleton className="h-[420px] w-full rounded-3xl" />
        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <div className="skeleton h-10 w-48" />
            <div className="skeleton h-64 w-full rounded-2xl" />
          </div>
          <div className="space-y-6">
            <div className="skeleton h-40 w-full rounded-2xl" />
            <div className="skeleton h-40 w-full rounded-2xl" />
          </div>
        </div>
      </PageTransition>
    )
  }

  if (geocodeError || !destination) {
    return (
      <PageTransition>
        <ErrorState
          title={t('destDetails.notFound')}
          message={t('destDetails.notFoundMsg', { name })}
          onRetry={() => navigate('/explore')}
        />
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div className="space-y-10">
        <DestinationHeader destination={destination} />

        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-base leading-relaxed text-ink-600">
              {t('destDetails.intro', { name: destination.country ? `${destination.name}, ${destination.country}` : destination.name })}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <FavoriteButton type="destination" item={destination} variant="button" />
            <button
              onClick={() => navigate(`/map?lat=${destination.lat}&lng=${destination.lon}&name=${encodeURIComponent(destination.name)}`)}
              className="inline-flex items-center gap-2 rounded-full bg-ink-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-ink-700 dark:bg-ink-950 dark:hover:bg-white/10"
            >
              <MapPin className="h-4 w-4" /> {t('destDetails.viewOnMap')}
            </button>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-10 lg:col-span-2">
            <section aria-label={`${destination.name} ${t('destDetails.gallery')}`}>
              <h2 className="mb-5 font-display text-xl font-bold text-ink-900">
                {t('destDetails.gallery')}
                <span className="ml-2 text-sm font-medium text-ink-400">
                  {loading || !photos.length ? '…' : t('mapPopup.photos', { count: formatNumber(photos.length) })}
                </span>
              </h2>
              <PhotoGrid
                photos={photos}
                loading={loading}
                error={error}
                onRetry={() => photoApi.getPhotosByDestination(destination).then((d) => setPhotos(d.photos)).catch(setError)}
                onPhotoClick={(photo) => setModalIndex(photos.findIndex((p) => p.id === photo.id))}
                skeletonCount={6}
              />
            </section>

            <section aria-label={t('destDetails.onTheMap')}>
              <h2 className="mb-5 font-display text-xl font-bold text-ink-900">{t('destDetails.onTheMap')}</h2>
              <div className="h-96 overflow-hidden rounded-2xl shadow-card">
                <MapView
                  center={[destination.lat, destination.lon]}
                  zoom={12}
                  flyTo={flyTo}
                  markers={markers}
                  cluster={false}
                />
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <WeatherCard lat={destination.lat} lon={destination.lon} placeName={destination.name} />
            <CountryInfoCard name={destination.country} code={destination.countryCode} />

            <div className="rounded-2xl bg-white p-6 shadow-soft dark:bg-sand-100">
              <h3 className="font-display text-sm font-bold uppercase tracking-wider text-ink-400">
                {t('destDetails.keepExploring')}
              </h3>
              <div className="mt-4 space-y-2">
                <Link
                  to="/map"
                  className="flex items-center gap-3 rounded-xl px-2 py-2 text-sm font-semibold text-ink-700 transition hover:bg-sand-100"
                >
                  <MapPin className="h-4 w-4 text-brand-500" /> {t('destDetails.browseWorld')}
                </Link>
                <Link
                  to="/explore"
                  className="flex items-center gap-3 rounded-xl px-2 py-2 text-sm font-semibold text-ink-700 transition hover:bg-sand-100"
                >
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-sand-100 text-ink-500">📷</span>
                  {t('destDetails.exploreAll')}
                </Link>
                <Link
                  to={`/trips/create?destination=${encodeURIComponent(destination.name)}`}
                  className="mt-3 block rounded-full bg-brand-500 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-brand-600"
                >
                  {t('destDetails.planTrip')}
                </Link>
              </div>
            </div>
          </div>
        </div>
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
