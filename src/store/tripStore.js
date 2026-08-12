import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { uid } from '../utils/format'

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
      migrate: () => ({ trips: [] }),
    }
  )
)
