import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const hasId = (list, item) => list.some((x) => x.id === item.id)

export const useFavoriteStore = create(
  persist(
    (set, get) => ({
      photos: [],
      destinations: [],
      trips: [],

      togglePhoto: (photo) =>
        set((state) => ({
          photos: hasId(state.photos, photo)
            ? state.photos.filter((p) => p.id !== photo.id)
            : [photo, ...state.photos],
        })),

      toggleDestination: (dest) =>
        set((state) => ({
          destinations: hasId(state.destinations, dest)
            ? state.destinations.filter((d) => d.id !== dest.id)
            : [dest, ...state.destinations],
        })),

      toggleTrip: (trip) =>
        set((state) => ({
          trips: hasId(state.trips, trip)
            ? state.trips.filter((t) => t.id !== trip.id)
            : [trip, ...state.trips],
        })),

      isPhotoFavorite: (id) => get().photos.some((p) => p.id === id),
      isDestinationFavorite: (id) => get().destinations.some((d) => d.id === id),
      isTripFavorite: (id) => get().trips.some((t) => t.id === id),

      clearFavorites: () => set({ photos: [], destinations: [], trips: [] }),
    }),
    {
      name: 'travelmap-favorites',
      version: 1,
      migrate: () => ({ photos: [], destinations: [], trips: [] }),
    }
  )
)
