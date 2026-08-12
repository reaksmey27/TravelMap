import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Calendar, MapPin, Pencil, Trash2 } from 'lucide-react'
import PageTransition from '../components/common/PageTransition'
import JournalEditor from '../components/journal/JournalEditor'
import ErrorState from '../components/common/ErrorState'
import { useJournalStore } from '../store/journalStore'
import { useTranslation } from '../hooks/useTranslation'
import { formatDate } from '../utils/format'

export default function JournalDetails() {
  const { t, lang } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const entry = useJournalStore((s) => s.entries.find((e) => e.id === id))
  const updateEntry = useJournalStore((s) => s.updateEntry)
  const deleteEntry = useJournalStore((s) => s.deleteEntry)
  const [editing, setEditing] = useState(false)

  if (!entry) {
    return (
      <PageTransition>
        <ErrorState
          title={t('journalDetails.notFound')}
          message={t('journalDetails.notFoundMsg')}
          onRetry={() => navigate('/journal')}
        />
      </PageTransition>
    )
  }

  const handleDelete = () => {
    if (window.confirm(t('journalDetails.deleteConfirm', { title: entry.title }))) {
      deleteEntry(id)
      navigate('/journal')
    }
  }

  return (
    <PageTransition>
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/journal')}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 transition hover:text-ink-900"
          >
            <ArrowLeft className="h-4 w-4" /> {t('journalDetails.back')}
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setEditing((e) => !e)}
              className="inline-flex items-center gap-1.5 rounded-full border border-sand-200 bg-white px-4 py-2 text-xs font-semibold text-ink-700 transition hover:border-brand-200 hover:text-brand-600 dark:bg-sand-100"
            >
              <Pencil className="h-3.5 w-3.5" /> {t('common.edit')}
            </button>
            <button
              onClick={handleDelete}
              className="inline-flex items-center gap-1.5 rounded-full border border-brand-100 bg-brand-50 px-4 py-2 text-xs font-semibold text-brand-700 transition hover:bg-brand-100"
            >
              <Trash2 className="h-3.5 w-3.5" /> {t('common.delete')}
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {editing ? (
            <motion.div
              key="editor"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
            >
              <JournalEditor
                initial={entry}
                submitLabel={t('settings.saveChanges')}
                onCancel={() => setEditing(false)}
                onSubmit={(data) => {
                  const { id: _id, createdAt, ...rest } = data
                  updateEntry(id, rest)
                  setEditing(false)
                }}
              />
            </motion.div>
          ) : (
            <motion.article
              key="entry"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="overflow-hidden rounded-3xl bg-white shadow-card dark:bg-sand-100"
            >
              {entry.photos?.length > 0 && (
                <div className="grid grid-cols-2 gap-0.5">
                  {entry.photos.slice(0, 2).map((src, i) => (
                    <img key={i} src={src} alt="" className="h-56 w-full object-cover sm:h-72" />
                  ))}
                </div>
              )}
              <div className="p-6 sm:p-10">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-ink-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" /> {formatDate(entry.date, lang)}
                  </span>
                  {entry.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-brand-500" /> {entry.location}
                    </span>
                  )}
                </div>
                <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink-900">
                  {entry.title}
                </h1>
                <div className="mt-6 space-y-4 text-base leading-relaxed text-ink-700">
                  {entry.content.split('\n\n').map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              </div>
            </motion.article>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  )
}
