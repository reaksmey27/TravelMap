import { motion } from 'framer-motion'
import { Camera } from 'lucide-react'
import { useTranslation } from '../../hooks/useTranslation'

export default function EmptyState({
  icon: Icon = Camera,
  title,
  message,
  action,
}) {
  const { t } = useTranslation()
  const heading = title ?? t('emptyState.title')
  const body = message ?? t('emptyState.msg')
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto flex max-w-md flex-col items-center px-4 py-16 text-center"
    >
      <div className="mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-sand-100 text-ink-400">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="font-display text-lg font-bold text-ink-900">{heading}</h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-500">{body}</p>
      {action && <div className="mt-6">{action}</div>}
    </motion.div>
  )
}
