export const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
export const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

export const SATELLITE_URL =
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
export const SATELLITE_ATTRIBUTION =
  '&copy; Esri, Maxar, Earthstar Geographics'

export const DEFAULT_CENTER = [41.3874, 2.1686]
export const DEFAULT_ZOOM = 4

export const CATEGORIES = [
  { id: 'all', labelKey: 'cat.all' },
  { id: 'Nature', labelKey: 'cat.Nature' },
  { id: 'Beach', labelKey: 'cat.Beach' },
  { id: 'City', labelKey: 'cat.City' },
  { id: 'Mountain', labelKey: 'cat.Mountain' },
  { id: 'Culture', labelKey: 'cat.Culture' },
  { id: 'Food', labelKey: 'cat.Food' },
  { id: 'Adventure', labelKey: 'cat.Adventure' },
]

export const NAV_LINKS = [
  { to: '/explore', labelKey: 'nav.explore' },
  { to: '/map', labelKey: 'nav.map' },
  { to: '/trips', labelKey: 'nav.trips' },
  { to: '/journal', labelKey: 'nav.journal' },
]

export const TRIP_YEARS = ['all', '2026', '2025', '2024']
