import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Backpack } from 'lucide-react'
import PageTransition from '../components/common/PageTransition'
import TripForm from '../components/trips/TripForm'
import { useTripStore } from '../store/tripStore'
import { useTranslation } from '../hooks/useTranslation'

export default function CreateTrip() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const addTrip = useTripStore((s) => s.addTrip)
  const [busy, setBusy] = useState(false)

  // Prefill the destination name from ?destination= query (e.g. "Plan a trip here" links)
  const prefill = useMemo(() => {
    const name = searchParams.get('destination')
    if (!name) return null
    return { destination: name }
  }, [searchParams])

  const handleSubmit = (data) => {
    setBusy(true)
    // Simulate a short save for a nicer transition
    setTimeout(() => {
      const trip = addTrip(data)
      navigate(`/trips/${trip.id}`)
    }, 350)
  }

  return (
    <PageTransition>
      <div className="mx-auto max-w-2xl">
        <button
          onClick={() => navigate(-1)}
          className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 transition hover:text-ink-900"
        >
          <ArrowLeft className="h-4 w-4" /> {t('common.back')}
        </button>

        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-600">
            <Backpack className="h-3.5 w-3.5" /> {t('createTrip.eyebrow')}
          </span>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink-900">
            {t('createTrip.title')}
          </h1>
          <p className="mt-2 text-ink-500">
            {t('createTrip.sub')}
          </p>
        </motion.header>

        <div className="rounded-3xl bg-white p-5 shadow-card sm:p-8 dark:bg-sand-100">
          <TripForm initial={prefill} onSubmit={handleSubmit} busy={busy} submitLabel={t('trips.create')} />
        </div>
      </div>
    </PageTransition>
  )
}
