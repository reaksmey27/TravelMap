import { motion } from 'framer-motion'
import { cn } from '../../utils/cn'

export default function MetricCard({ icon: Icon, value, label, index = 0, className }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className={cn(
        'rounded-2xl border border-sand-200 bg-white p-4 shadow-soft transition hover:-translate-y-0.5 hover:shadow-card dark:bg-sand-100',
        className
      )}
    >
      <Icon className="h-5 w-5 text-brand-500" />
      <p className="mt-2 font-display text-2xl font-extrabold text-ink-900">{value}</p>
      <p className="text-xs font-medium uppercase tracking-wide text-ink-400">{label}</p>
    </motion.div>
  )
}
