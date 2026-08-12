import { useEffect, useState } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const THEMES = ['light', 'dark', 'system']

const getSystemDark = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches

/** Resolve 'light' | 'dark' | 'system' to an actual mode. */
export function resolveTheme(theme) {
  if (theme === 'dark') return 'dark'
  if (theme === 'light') return 'light'
  return getSystemDark() ? 'dark' : 'light'
}

/** Toggle the `.dark` class on <html> and sync the native color scheme. */
export function applyTheme(theme) {
  const root = document.documentElement
  const resolved = resolveTheme(theme)
  root.classList.toggle('dark', resolved === 'dark')
  root.style.colorScheme = resolved
}

/** True when the app is currently rendering in dark mode. */
export function useIsDark() {
  const theme = useThemeStore((s) => s.theme)
  const [isDark, setIsDark] = useState(() => resolveTheme(theme) === 'dark')

  useEffect(() => {
    const update = () => setIsDark(resolveTheme(theme) === 'dark')
    update()
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)')
    mq?.addEventListener?.('change', update)
    return () => mq?.removeEventListener?.('change', update)
  }, [theme])

  return isDark
}

export const useThemeStore = create(
  persist(
    (set) => ({
      /** 'light' | 'dark' | 'system' */
      theme: 'system',
      setTheme: (theme) => set({ theme: THEMES.includes(theme) ? theme : 'system' }),
    }),
    { name: 'travelmap-theme' }
  )
)
