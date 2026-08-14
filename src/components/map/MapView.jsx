import { useEffect, useState } from 'react'
import { GeoJSON, MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import { LocateFixed, Loader2, Map as MapIcon, Minus, Plus, Satellite } from 'lucide-react'
import 'leaflet/dist/leaflet.css'
import 'react-leaflet-cluster/lib/assets/MarkerCluster.css'
import 'react-leaflet-cluster/lib/assets/MarkerCluster.Default.css'
import {
  SATELLITE_ATTRIBUTION,
  SATELLITE_URL,
  TILE_ATTRIBUTION,
  TILE_URL,
} from '../../utils/constants'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { useTranslation } from '../../hooks/useTranslation'
import { cn } from '../../utils/cn'

function ClickHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => onMapClick?.(e.latlng),
  })
  return null
}

function FlyTo({ target }) {
  const map = useMap()
  useEffect(() => {
    if (!target?.center) return
    const [lat, lng] = target.center
    if (!lat || !lng) return
    map.flyTo([lat, lng], target.zoom ?? Math.max(map.getZoom(), 10), { duration: 1 })
  }, [target?.center?.[0], target?.center?.[1], target?.zoom])
  return null
}

function FitToBounds({ boundary }) {
  const map = useMap()
  useEffect(() => {
    if (!boundary) return
    const layer = L.geoJSON(boundary)
    const bounds = layer.getBounds()
    if (bounds.isValid()) {
      map.flyToBounds(bounds, { padding: [48, 48], duration: 0.9, maxZoom: 13 })
    }
  }, [boundary, map])
  return null
}

// Outline around the selected region/country/city: a dashed brand-colored
// line with a barely-there fill so the map stays readable underneath.
const BOUNDARY_STYLE = {
  color: '#E05A26',
  weight: 2.5,
  opacity: 0.9,
  dashArray: '6 4',
  fillColor: '#E05A26',
  fillOpacity: 0.08,
}

// Only polygon-ish geometries outline a place; Points (POIs, streets) would
// just draw a meaningless dot.
export function isOutlineable(boundary) {
  const type = boundary?.type === 'Feature' ? boundary.geometry?.type : boundary?.type
  return type === 'Polygon' || type === 'MultiPolygon'
}

function LayerSwitcher({ value, onChange }) {
  const { t } = useTranslation()
  const options = [
    { id: 'streets', label: t('mapView.streets'), icon: MapIcon },
    { id: 'satellite', label: t('mapView.satellite'), icon: Satellite },
  ]
  return (
    <div
      role="radiogroup"
      aria-label={t('mapView.baseLayer')}
      className="flex items-center gap-0.5 rounded-xl bg-white p-1 shadow-soft dark:bg-sand-100"
    >
      {options.map(({ id, label, icon: Icon }) => {
        const active = value === id
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(id)}
            title={label}
            aria-label={label}
            className={cn(
              'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition',
              active
                ? 'bg-brand-500 text-white shadow-soft'
                : 'text-ink-500 hover:bg-sand-100 hover:text-ink-700 dark:hover:bg-sand-200/60'
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        )
      })}
    </div>
  )
}

function LocateButton({ onLocate }) {
  const map = useMap()
  const { t } = useTranslation()
  const [busy, setBusy] = useState(false)

  const locate = () => {
    if (!navigator.geolocation) return
    setBusy(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        map.flyTo([latitude, longitude], 12, { duration: 1 })
        onLocate?.({ lat: latitude, lon: longitude })
        setBusy(false)
      },
      () => setBusy(false),
      { timeout: 8000 }
    )
  }

  return (
    <button
      onClick={locate}
      aria-label={t('mapView.goToMyLocation')}
      title={t('mapView.myLocation')}
      className="grid h-10 w-10 place-items-center rounded-xl bg-white text-ink-700 shadow-soft transition hover:bg-sand-100 hover:text-brand-600 dark:bg-sand-100"
    >
      {busy ? <Loader2 className="h-[18px] w-[18px] animate-spin" /> : <LocateFixed className="h-[18px] w-[18px]" />}
    </button>
  )
}

function ZoomButtons() {
  const map = useMap()
  const { t } = useTranslation()
  return (
    <div className="flex flex-col overflow-hidden rounded-xl bg-white shadow-soft dark:bg-sand-100">
      <button
        onClick={() => map.zoomIn()}
        aria-label={t('mapView.zoomIn')}
        className="grid h-10 w-10 place-items-center text-ink-700 transition hover:bg-sand-100 hover:text-brand-600"
      >
        <Plus className="h-4 w-4" />
      </button>
      <div className="mx-2.5 h-px bg-sand-200" />
      <button
        onClick={() => map.zoomOut()}
        aria-label={t('mapView.zoomOut')}
        className="grid h-10 w-10 place-items-center text-ink-700 transition hover:bg-sand-100 hover:text-brand-600"
      >
        <Minus className="h-4 w-4" />
      </button>
    </div>
  )
}

export default function MapView({
  center,
  zoom = 4,
  flyTo,
  boundary,
  boundaryKey,
  markers = [],
  cluster = true,
  onMapClick,
  onLocate,
  controls = 'custom',
  layerSwitcherClassName,
  forceLayerSwitcher = false,
  className,
  children,
}) {
  const [baseLayer, setBaseLayer] = useLocalStorage('travelmap-base-layer', 'streets')
  const showZoomControl = controls === 'default'
  const showCustom = controls === 'custom'

  return (
    <div className={cn('relative h-full w-full overflow-hidden', className)}>
      <MapContainer
        center={center}
        zoom={zoom}
        zoomControl={showZoomControl}
        scrollWheelZoom
        className="h-full w-full"
      >
        {baseLayer === 'satellite' ? (
          <TileLayer url={SATELLITE_URL} attribution={SATELLITE_ATTRIBUTION} maxZoom={19} />
        ) : (
          <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
        )}

        <ClickHandler onMapClick={onMapClick} />
        <FlyTo target={flyTo} />

        {isOutlineable(boundary) && (
          <>
            <FitToBounds boundary={boundary} />
            {/* react-leaflet's GeoJSON doesn't redraw when `data` changes, so
                remount it per boundary (key = selected place id). */}
            <GeoJSON key={boundaryKey} data={boundary} style={BOUNDARY_STYLE} />
          </>
        )}

        {children}

        {markers.length > 0 &&
          (cluster ? (
            <MarkerClusterGroup chunkedLoading>
              {markers.map((m) => (
                <Marker
                  key={m.id}
                  position={[m.lat, m.lon]}
                  icon={m.icon}
                  eventHandlers={{ click: () => m.onClick?.() }}
                >
                  {m.popup ? <Popup>{m.popup}</Popup> : null}
                </Marker>
              ))}
            </MarkerClusterGroup>
          ) : (
            markers.map((m) => (
              <Marker
                key={m.id}
                position={[m.lat, m.lon]}
                icon={m.icon}
                eventHandlers={{ click: () => m.onClick?.() }}
              >
                {m.popup ? <Popup>{m.popup}</Popup> : null}
              </Marker>
            ))
          ))}

        {(showCustom || forceLayerSwitcher) && (
          <div className={cn('absolute z-[1000]', layerSwitcherClassName || 'left-3 top-3')}>
            <LayerSwitcher value={baseLayer} onChange={setBaseLayer} />
          </div>
        )}
        {showCustom && (
          <div className="absolute right-3 top-3 z-[1000] flex flex-col gap-2">
            <ZoomButtons />
            <LocateButton onLocate={onLocate} />
          </div>
        )}
      </MapContainer>
    </div>
  )
}
