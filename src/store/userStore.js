import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
      migrate: () => ({ profile: blankProfile }),
    }
  )
)
