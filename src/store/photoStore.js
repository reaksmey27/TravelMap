import { create } from 'zustand'

const TTL = 5 * 60 * 1000

export const usePhotoStore = create((set, get) => ({
  cache: {},
  liked: {},

  getCached: (key) => {
    const entry = get().cache[key]
    if (!entry) return null
    if (Date.now() - entry.at > TTL) {
      set((state) => {
        const next = { ...state.cache }
        delete next[key]
        return { cache: next }
      })
      return null
    }
    return entry.data
  },

  setCache: (key, data) =>
    set((state) => ({ cache: { ...state.cache, [key]: { data, at: Date.now() } } })),

  toggleLike: (photoId) =>
    set((state) => ({ liked: { ...state.liked, [photoId]: !state.liked[photoId] } })),

  clearCache: () => set({ cache: {} }),
}))
