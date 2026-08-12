import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Compass, MapPin } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'

export default function NotFound() {
  const { t } = useTranslation()
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center"
    >
      <div className="relative">
        <MapPin className="h-16 w-16 text-brand-500" />
        <motion.span
          animate={{ rotate: [0, -10, 10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -right-8 -top-4 font-display text-7xl font-extrabold text-sand-200 dark:text-sand-300"
        >
          404
        </motion.span>
      </div>
      <h1 className="mt-6 font-display text-2xl font-extrabold text-ink-900">
        {t('notFound.title')}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-ink-500">
        {t('notFound.msg')}
      </p>
      <Link
        to="/"
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand-500 px-7 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-600"
      >
        <Compass className="h-4 w-4" /> {t('notFound.back')}
      </Link>
    </motion.div>
  )
}
