import { motion } from 'framer-motion'
import { CalendarDays, MapPin } from 'lucide-react'
import { formatShortDate } from '../../utils/format'
import { useTranslation } from '../../hooks/useTranslation'

function DayBlock({ day, places, startDate }) {
  const { t, lang } = useTranslation()

  let dateStr = ''
  if (startDate) {
    const s = new Date(startDate)
    if (!Number.isNaN(s.getTime())) {
      const d = new Date(s.getTime() + (day - 1) * 86400000)
      dateStr = d.toISOString().slice(0, 10)
    }
  }

  return (
    <motion.li
      initial={{ opacity: 0, x: -12 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35 }}
      className="relative pb-8 pl-10"
    >
      <span className="absolute left-0 top-0 grid h-7 w-7 place-items-center rounded-full border-2 border-brand-500 bg-white text-[11px] font-bold text-brand-600 dark:bg-sand-100">
        {day}
      </span>
      <div className="rounded-2xl border border-sand-200 bg-white p-4 shadow-soft transition hover:shadow-card dark:bg-sand-100">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-600">
          <CalendarDays className="h-3.5 w-3.5" />
          {t('tripTimeline.day', { day })}
          {dateStr && (
            <span className="ml-auto text-xs font-medium normal-case tracking-normal text-ink-400">
              {formatShortDate(dateStr, lang)}
            </span>
          )}
        </p>
        <ul className="mt-3 space-y-2.5">
          {places.map((p, i) => (
            <li key={`${p.name}-${i}`} className="flex items-center gap-2.5 text-sm text-ink-700">
              <MapPin className="h-4 w-4 shrink-0 text-ink-400" />
              <span className="font-medium">{p.name}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.li>
  )
}

export default function TripTimeline({ locations, startDate }) {
  const { t } = useTranslation()
  if (!locations?.length) {
    return (
      <div className="rounded-2xl border border-dashed border-sand-300 bg-sand-50 p-8 text-center text-sm text-ink-400">
        {t('tripTimeline.empty')}
      </div>
    )
  }

  const byDay = locations.reduce((acc, loc) => {
    const day = loc.day || 1
    if (!acc[day]) acc[day] = []
    acc[day].push(loc)
    return acc
  }, {})

  const days = Object.keys(byDay)
    .map(Number)
    .sort((a, b) => a - b)

  return (
    <ol className="relative ml-3.5 border-l-2 border-brand-200/70">
      {days.map((day) => (
        <DayBlock key={day} day={day} places={byDay[day]} startDate={startDate} />
      ))}
    </ol>
  )
}
