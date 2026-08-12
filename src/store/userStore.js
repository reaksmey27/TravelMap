import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/** Blank profile — users fill it in via Settings. */
export const blankProfile = {
  name: '',
  username: '',
  bio: '',
  location: '',
  avatar: '',
  cover: '',
  joinedAt: '',
}

export const useUserStore = create(
  persist(
    (set, get) => ({
      profile: blankProfile,

      updateProfile: (patch) =>
        set((state) => ({ profile: { ...state.profile, ...patch } })),

      resetProfile: () => set({ profile: blankProfile }),
    }),
    {
      name: 'travelmap-user',
      version: 1,
      // v1 replaces the previously hardcoded demo profile with a blank one.
      migrate: () => ({ profile: blankProfile }),
    }
  )
)
