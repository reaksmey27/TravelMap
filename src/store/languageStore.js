import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const LANGUAGES = ['en', 'km']

export const useLanguageStore = create(
  persist(
    (set) => ({
      lang: 'en',
      setLang: (lang) => set({ lang: LANGUAGES.includes(lang) ? lang : 'en' }),
    }),
    { name: 'travelmap-language' }
  )
)
