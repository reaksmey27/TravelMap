import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Camera, Calendar, MapPin } from 'lucide-react'
import { formatDate } from '../../utils/format'
import { useTranslation } from '../../hooks/useTranslation'

export default function JournalCard({ entry, index = 0 }) {
  const { t, lang } = useTranslation()
  const cover = entry.photos?.[0]
  const excerpt = (entry.content || '').slice(0, 140)

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, delay: (index % 3) * 0.06 }}
    >
      <Link
        to={`/journal/${entry.id}`}
        className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-soft transition-shadow duration-300 hover:shadow-lift dark:bg-sand-100 sm:flex-row"
      >
        {cover && (
          <div className="relative h-44 shrink-0 overflow-hidden sm:h-auto sm:w-52">
            <img
              src={cover}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        )}
        <div className="flex-1 p-5">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-ink-400">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" /> {formatDate(entry.date, lang)}
            </span>
            {entry.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-brand-500" /> {entry.location}
              </span>
            )}
            {entry.photos?.length > 0 && (
              <span className="flex items-center gap-1">
                <Camera className="h-3.5 w-3.5" /> {t('journalCard.photos', { count: entry.photos.length })}
              </span>
            )}
          </div>
          <h3 className="mt-2 font-display text-lg font-bold text-ink-900 transition group-hover:text-brand-600">
            {entry.title}
          </h3>
          {excerpt && <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{excerpt}…</p>}
        </div>
      </Link>
    </motion.article>
  )
}
