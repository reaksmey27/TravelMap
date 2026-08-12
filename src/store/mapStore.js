import { create } from 'zustand'
import { DEFAULT_CENTER, DEFAULT_ZOOM } from '../utils/constants'

export const useMapStore = create((set) => ({
  center: DEFAULT_CENTER,
  zoom: DEFAULT_ZOOM,
  selectedLocation: null,
  selectedPhoto: null,
  focusedDestination: null,

  setCenter: (center, zoom) => set({ center, zoom }),
  setSelectedLocation: (location) => set({ selectedLocation: location }),
  setSelectedPhoto: (photo) => set({ selectedPhoto: photo }),
  setFocusedDestination: (destination) => set({ focusedDestination: destination }),
  clearSelection: () => set({ selectedLocation: null, selectedPhoto: null }),
}))
