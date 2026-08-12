import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { uid } from '../utils/format'

/**
 * Personal trips, persisted to localStorage.
 * Shape: { id, title, destination, country, countryCode, lat, lon,
 *          startDate, endDate, description, coverImage, locations[], photos[], createdAt }
 */
export const useTripStore = create(
  persist(
    (set, get) => ({
      trips: [],

      addTrip: (data) => {
        const trip = {
          id: uid('trip'),
          createdAt: new Date().toISOString().slice(0, 10),
          locations: [],
          photos: [],
          ...data,
        }
        set((state) => ({ trips: [trip, ...state.trips] }))
        return trip
      },

      updateTrip: (id, patch) =>
        set((state) => ({
          trips: state.trips.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        })),

      deleteTrip: (id) =>
        set((state) => ({ trips: state.trips.filter((t) => t.id !== id) })),

      getTrip: (id) => get().trips.find((t) => t.id === id),

      resetTrips: () => set({ trips: [] }),
    }),
    {
      name: 'travelmap-trips',
      version: 1,
      // v1 removes the previously seeded demo trips.
      migrate: () => ({ trips: [] }),
    }
  )
)
