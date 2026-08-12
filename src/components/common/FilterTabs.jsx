import { motion } from 'framer-motion'
import { useTranslation } from '../../hooks/useTranslation'
import { cn } from '../../utils/cn'

export default function FilterTabs({ options, value, onChange, className }) {
  const { t } = useTranslation()
  return (
    <div
      role="tablist"
      aria-label={t('common.filters')}
      className={cn('no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0', className)}
    >
      {options.map((option) => {
        const id = typeof option === 'string' ? option : option.id
        const label =
          typeof option === 'string'
            ? t(option)
            : t(option.labelKey ?? option.label)
        const count = typeof option === 'object' ? option.count : undefined
        const active = value === id
        return (
          <button
            key={id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(id)}
            className={cn(
              'relative shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200',
              active
                ? 'border-ink-900 bg-ink-900 text-white shadow-soft dark:border-ink-950 dark:bg-ink-950'
                : 'border-sand-200 bg-white text-ink-600 hover:border-ink-300 hover:text-ink-900 dark:bg-sand-100'
            )}
          >
            {active && (
              <motion.span
                layoutId="filter-pill"
                className="absolute inset-0 rounded-full bg-ink-900 dark:bg-ink-950"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              {label}
              {count != null && (
                <span
                  className={cn(
                    'rounded-full px-1.5 text-[11px] font-semibold',
                    active ? 'bg-white/20 text-white' : 'bg-sand-100 text-ink-500'
                  )}
                >
                  {count}
                </span>
              )}
            </span>
          </button>
        )
      })}
    </div>
  )
}
