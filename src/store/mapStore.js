import { create } from 'zustand'
import { DEFAULT_CENTER, DEFAULT_ZOOM } from '../utils/constants'

/**
 * Session-level map state shared across map surfaces
 * (Map page, destination maps, personal travel map).
 */
export const useMapStore = create((set) => ({
  center: DEFAULT_CENTER,
  zoom: DEFAULT_ZOOM,
  selectedLocation: null, // { id, name, displayName, lat, lon, city, country, ... }
  selectedPhoto: null, // photo object currently focused on the map
  focusedDestination: null, // destination opened from another page

  setCenter: (center, zoom) => set({ center, zoom }),
  setSelectedLocation: (location) => set({ selectedLocation: location }),
  setSelectedPhoto: (photo) => set({ selectedPhoto: photo }),
  setFocusedDestination: (destination) => set({ focusedDestination: destination }),
  clearSelection: () => set({ selectedLocation: null, selectedPhoto: null }),
}))
