import { useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import AppRouter from './router/AppRouter'
import ScrollToTop from './components/common/ScrollToTop'
import { useAuthStore } from './store/authStore'
import { useThemeStore, applyTheme } from './store/themeStore'

function AuthInit() {
  useEffect(() => {
    useAuthStore.getState().init()
  }, [])
  return null
}

function ThemeInit() {
  const theme = useThemeStore((s) => s.theme)
  useEffect(() => {
    applyTheme(theme)
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)')
    if (theme === 'system' && mq) {
      const onChange = () => applyTheme('system')
      mq.addEventListener('change', onChange)
      return () => mq.removeEventListener('change', onChange)
    }
  }, [theme])
  return null
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthInit />
      <ThemeInit />
      <ScrollToTop />
      <AppRouter />
    </BrowserRouter>
  )
}
