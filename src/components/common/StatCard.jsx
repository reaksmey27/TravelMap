import { cn } from '../../utils/cn'

export default function StatCard({ value, label, icon: Icon, accent = false, className }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-sand-200 bg-white p-5 text-center shadow-soft transition hover:-translate-y-0.5 hover:shadow-card dark:bg-sand-100',
        className
      )}
    >
      {Icon && (
        <div
          className={cn(
            'mx-auto mb-3 grid h-10 w-10 place-items-center rounded-xl',
            accent ? 'bg-brand-50 text-brand-500' : 'bg-sand-100 text-ink-500'
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      )}
      <p
        className={cn(
          'font-display text-2xl font-extrabold tracking-tight sm:text-3xl',
          accent ? 'text-brand-600' : 'text-ink-900'
        )}
      >
        {value}
      </p>
      <p className="mt-1 text-xs font-medium uppercase tracking-wide text-ink-400">{label}</p>
    </div>
  )
}
