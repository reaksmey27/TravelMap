import { Navigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useTranslation } from '../../hooks/useTranslation'

function AuthGateLoader() {
  const { t } = useTranslation()
  return (
    <div className="grid min-h-[50vh] place-items-center" role="status" aria-label={t('auth.checking')}>
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        className="flex flex-col items-center gap-3"
      >
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-500 text-white shadow-soft">
          <MapPin className="h-6 w-6" />
        </span>
        <p className="text-sm font-medium text-ink-400">{t('auth.checking')}</p>
      </motion.div>
    </div>
  )
}

/**
 * Route guard for personal pages. Shows a loader while the session is being
 * restored, then either renders the page or redirects to /login (remembering
 * where the user was headed via location state).
 */
export default function RequireAuth({ children }) {
  const status = useAuthStore((s) => s.status)
  const location = useLocation()

  if (status === 'loading') return <AuthGateLoader />
  if (status !== 'signedIn') {
    return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />
  }
  return children
}
