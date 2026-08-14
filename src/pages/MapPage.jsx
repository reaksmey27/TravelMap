import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, Backpack, Camera, Layers, MapPin, Navigation, X } from 'lucide-react'
import MapView, { isOutlineable } from '../components/map/MapView'
import MapPopup from '../components/map/MapPopup'
import LocationSearch from '../components/map/LocationSearch'
import { pinIcon, photoPinIcon } from '../components/map/markers'
import { reverseGeocode } from '../services/locationApi'
import photoApi from '../services/photoApi'
import { useMapStore } from '../store/mapStore'
import { useTripStore } from '../store/tripStore'
import { useTranslation } from '../hooks/useTranslation'
import { cn } from '../utils/cn'

const PIN_COLORS = ['#E05A26', '#687F5C', '#3D6C8F', '#8C5A8F', '#C98A2D', '#4E7A6B']

export default function MapPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [viewMode, setViewMode] = useState('trips')
  const [selected, setSelected] = useState(null)
  const [flyTo, setFlyTo] = useState(null)
  const [reverseError, setReverseError] = useState(false)
  const [livePhotos, setLivePhotos] = useState([])
  const mapCenter = useMapStore((s) => s.center)
  const trips = useTripStore((s) => s.trips)

  const storeSelected = useMapStore((s) => s.selectedLocation)
  const setStoreSelected = useMapStore((s) => s.setSelectedLocation)

  useEffect(() => {
    let cancelled = false
    photoApi
      .getPhotos({ query: 'travel', page: 1, perPage: 50 })
      .then((data) => {
        if (cancelled) return
        setLivePhotos(data.photos.filter((p) => p.lat != null && p.lon != null))
      })
      .catch(() => {
        if (!cancelled) setLivePhotos([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const lat = parseFloat(searchParams.get('lat'))
    const lng = parseFloat(searchParams.get('lng'))
    const name = searchParams.get('name')
    if (lat && lng) {
      setSelected({ id: 'pin', name: name || t('map.pinnedLocation'), lat, lon: lng, type: 'Place', country: '' })
      setFlyTo({ center: [lat, lng], zoom: 12 })
      setViewMode('trips')
    }
  }, [searchParams])

  useEffect(() => {
    if (storeSelected) {
      setSelected(storeSelected)
      setFlyTo({ center: [storeSelected.lat, storeSelected.lon], zoom: 12 })
      setViewMode('trips')
      setStoreSelected(null)
    }
  }, [storeSelected, setStoreSelected])

  const tripMarkers = useMemo(
    () =>
      trips.flatMap((trip, i) => {
        const main = {
          id: `trip-${trip.id}`,
          lat: trip.lat,
          lon: trip.lon,
          icon: pinIcon({ color: PIN_COLORS[i % PIN_COLORS.length] }),
          popup: (
            <MapPopup
              image={trip.coverImage}
              title={trip.title}
              subtitle={trip.destination ? `${trip.destination}, ${trip.country}` : trip.country}
              to={`/trips/${trip.id}`}
            />
          ),
        }
        const places = (trip.locations || []).map((loc, j) => ({
          id: `${trip.id}-loc-${j}`,
          lat: loc.lat,
          lon: loc.lon,
          icon: pinIcon({ color: PIN_COLORS[(i + j + 1) % PIN_COLORS.length] }),
          popup: <MapPopup title={loc.name} subtitle={`${t('map.day', { day: loc.day || 1 })} · ${trip.title}`} to={`/trips/${trip.id}`} />,
        }))
        return [main, ...places]
      }),
    [trips, t]
  )

  const photoMarkers = useMemo(
    () =>
      livePhotos.map((p) => ({
        id: `photo-${p.id}`,
        lat: p.lat,
        lon: p.lon,
        icon: photoPinIcon(p.thumb),
        popup: (
          <MapPopup
            image={p.thumb}
            title={p.title}
            subtitle={p.city && p.country ? `${p.city}, ${p.country}` : p.city || p.country || t('map.travelPhoto')}
            onView={() => navigate(`/photos/${p.id}`)}
          />
        ),
      })),
    [livePhotos, navigate, t]
  )

  const markers = viewMode === 'trips' ? tripMarkers : photoMarkers

  const lastReverseAt = useRef(0)
  const onMapClick = async (latlng) => {
    const now = Date.now()
    if (now - lastReverseAt.current < 1000) return
    lastReverseAt.current = now
    setReverseError(false)
    try {
      const place = await reverseGeocode(latlng.lat, latlng.lng)
      setSelected(place)
    } catch {
      setReverseError(true)
    }
  }

  const onLocate = ({ lat, lon }) => {
    setSelected({ id: 'me', name: t('map.youAreHere'), lat, lon, type: 'Place', country: '' })
    setFlyTo({ center: [lat, lon], zoom: 12 })
  }

  const onSearchSelect = (loc) => {
    setSelected(loc)
    // With an outlineable boundary polygon, FitToBounds in MapView handles
    // the zoom. Otherwise fly to the point so POIs still navigate.
    if (!isOutlineable(loc.boundary)) setFlyTo({ center: [loc.lat, loc.lon], zoom: 12 })
    setViewMode('trips')
  }

  const sheet = selected

  return (
    <div className="relative h-[calc(100dvh-4rem-3.5rem)] md:h-[calc(100dvh-4rem)]">
      <MapView
        center={mapCenter}
        zoom={5}
        flyTo={flyTo}
        markers={markers}
        boundary={selected?.boundary}
        boundaryKey={selected?.id}
        onMapClick={onMapClick}
        onLocate={onLocate}
        layerSwitcherClassName="right-3 top-1/2 -translate-y-1/2"
      />

      <div className="absolute left-3 right-3 top-3 z-[1000] max-w-md sm:left-4 sm:right-auto sm:w-96">
        <LocationSearch id="map-search" onSelect={onSearchSelect} placeholder={t('map.searchPlaceholder')} />
      </div>

      <div className="absolute left-3 top-20 z-[1000] flex overflow-hidden rounded-full bg-white shadow-soft sm:left-4 sm:top-auto sm:bottom-4 dark:bg-sand-100">
        <button
          onClick={() => setViewMode('trips')}
          aria-pressed={viewMode === 'trips'}
          className={cn(
            'flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold transition',
            viewMode === 'trips' ? 'bg-ink-900 text-white dark:bg-ink-950' : 'text-ink-600 hover:text-ink-900'
          )}
        >
          <Backpack className="h-3.5 w-3.5" /> {t('map.myTrips')}
        </button>
        <button
          onClick={() => setViewMode('photos')}
          aria-pressed={viewMode === 'photos'}
          className={cn(
            'flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold transition',
            viewMode === 'photos' ? 'bg-ink-900 text-white dark:bg-ink-950' : 'text-ink-600 hover:text-ink-900'
          )}
        >
          <Camera className="h-3.5 w-3.5" /> {t('map.livePhotos')}
        </button>
      </div>

      <div className="pointer-events-none absolute bottom-3 left-3 z-[1000] hidden items-center gap-1.5 rounded-full bg-white/85 px-3 py-1.5 text-[11px] font-medium text-ink-500 shadow-soft backdrop-blur md:flex dark:bg-sand-100/85">
        <Layers className="h-3.5 w-3.5" />
        {viewMode === 'trips'
          ? trips.length
            ? t('map.pins', { count: trips.length, pins: tripMarkers.length })
            : t('common.trips')
          : t('map.geotagged', { count: livePhotos.length })}
      </div>

      <AnimatePresence>
        {reverseError && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-24 left-1/2 z-[1000] -translate-x-1/2 rounded-full bg-ink-900 px-4 py-2 text-xs font-medium text-white shadow-lift md:bottom-8 dark:bg-ink-950"
          >
            {t('map.reverseError')}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {sheet && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className="absolute inset-x-3 bottom-3 z-[1000] md:left-auto md:right-3 md:w-80"
          >
            <div className="overflow-hidden rounded-2xl bg-white shadow-lift dark:bg-sand-100">
              {sheet.image && <img src={sheet.image} alt={sheet.name} className="h-32 w-full object-cover" />}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-brand-600">
                      <Navigation className="h-3 w-3" />
                      {sheet.country || sheet.type || t('map.selectedLocation')}
                    </p>
                    <h3 className="mt-0.5 truncate font-display text-lg font-bold text-ink-900">
                      {sheet.name || sheet.city || t('common.unknownPlace')}
                    </h3>
                    {sheet.lat != null && (
                      <p className="text-xs text-ink-400">
                        {sheet.lat.toFixed(4)}, {sheet.lon?.toFixed(4) ?? ''}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    aria-label={t('common.close')}
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-ink-400 transition hover:bg-sand-100"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-3 flex gap-2">
                  {sheet.name && sheet.name !== t('map.youAreHere') ? (
                    <button
                      onClick={() => navigate(`/destinations/${encodeURIComponent(sheet.name || sheet.city)}`)}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-ink-900 py-2.5 text-sm font-semibold text-white transition hover:bg-ink-700 dark:bg-ink-950 dark:hover:bg-white/10"
                    >
                      {t('map.viewDestination')} <ArrowUpRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate('/explore')}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-ink-900 py-2.5 text-sm font-semibold text-white transition hover:bg-ink-700 dark:bg-ink-950 dark:hover:bg-white/10"
                    >
                      {t('map.exploreNearby')} <ArrowUpRight className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
