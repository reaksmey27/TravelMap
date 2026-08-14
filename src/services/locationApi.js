import { http } from './http'

// In dev/preview the request goes through Vite's /nominatim proxy so it is
// same-origin (Nominatim sends no CORS headers, so browsers can't call it
// directly). Production builds fall back to the direct URL.
const NOMINATIM = import.meta.env.DEV
  ? '/nominatim'
  : 'https://nominatim.openstreetmap.org'

const TYPE_LABELS = {
  city: 'City',
  town: 'Town',
  village: 'Village',
  hamlet: 'Village',
  administrative: 'Region',
  country: 'Country',
  attraction: 'Place',
  hotel: 'Place',
  neighbourhood: 'Neighborhood',
  suburb: 'Neighborhood',
}

// Ask Nominatim for the place's boundary geometry, simplified so large
// countries/regions stay small (0.02° tolerance ≈ ~2 km).
const POLYGON_PARAMS = {
  polygon_geojson: 1,
  polygon_threshold: 0.02,
}

function normalizeResult(item) {
  const addr = item.address || {}
  const city =
    addr.city || addr.town || addr.village || addr.municipality || addr.county || ''
  const country = addr.country || ''
  return {
    id: item.place_id,
    name: item.name || item.display_name.split(',')[0]?.trim() || city,
    displayName: item.display_name,
    lat: parseFloat(item.lat),
    lon: parseFloat(item.lon),
    city,
    country,
    countryCode: (addr.country_code || '').toUpperCase(),
    type: TYPE_LABELS[item.type] || 'Place',
    boundary: item.geojson || null,
  }
}

export async function searchLocations(query, { limit = 6 } = {}) {
  if (!query || query.trim().length < 2) return []
  try {
    const res = await http.get(`${NOMINATIM}/search`, {
      params: {
        q: query,
        format: 'jsonv2',
        addressdetails: 1,
        limit,
        'accept-language': 'en',
        ...POLYGON_PARAMS,
      },
    })
    const results = res.data
    if (!Array.isArray(results) || results.length === 0) return []
    return results.map(normalizeResult).filter((r) => r.lat && r.lon)
  } catch (err) {
    console.warn('[TravelMap] Location search failed:', err.message)
    return []
  }
}

export async function reverseGeocode(lat, lon) {
  const res = await http.get(`${NOMINATIM}/reverse`, {
    params: {
      lat,
      lon,
      format: 'jsonv2',
      addressdetails: 1,
      // Return the boundary of the city/town that contains the click (zoom
      // 10 = city level), not the nearest street/POI, so a click highlights
      // the place itself with a line around it.
      zoom: 10,
      'accept-language': 'en',
      ...POLYGON_PARAMS,
    },
  })
  const data = res.data

  if (!data || !data.lat) {
    throw new Error('Could not identify this location')
  }
  const normalized = normalizeResult(data)
  if (normalized.lat && normalized.lon) return normalized
  throw new Error('Could not identify this location')
}
