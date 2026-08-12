import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { uid } from '../utils/format'

export const useJournalStore = create(
  persist(
    (set, get) => ({
      entries: [],

      addEntry: (data) => {
        const entry = {
          id: uid('entry'),
          createdAt: new Date().toISOString(),
          photos: [],
          ...data,
        }
        set((state) => ({ entries: [entry, ...state.entries] }))
        return entry
      },

      updateEntry: (id, patch) =>
        set((state) => ({
          entries: state.entries.map((e) => (e.id === id ? { ...e, ...patch } : e)),
        })),

      deleteEntry: (id) =>
        set((state) => ({ entries: state.entries.filter((e) => e.id !== id) })),

      getEntry: (id) => get().entries.find((e) => e.id === id),
    }),
    {
      name: 'travelmap-journal',
      version: 1,
      migrate: () => ({ entries: [] }),
    }
  )
)
