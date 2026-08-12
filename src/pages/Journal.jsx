import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { BookOpen, Plus } from 'lucide-react'
import PageTransition from '../components/common/PageTransition'
import JournalCard from '../components/journal/JournalCard'
import JournalEditor from '../components/journal/JournalEditor'
import EmptyState from '../components/common/EmptyState'
import { useJournalStore } from '../store/journalStore'
import { useTranslation } from '../hooks/useTranslation'

export default function Journal() {
  const { t } = useTranslation()
  const entries = useJournalStore((s) => s.entries)
  const addEntry = useJournalStore((s) => s.addEntry)
  const [editorOpen, setEditorOpen] = useState(false)

  const handleSave = (data) => {
    addEntry(data)
    setEditorOpen(false)
  }

  return (
    <PageTransition>
      <div className="space-y-8">
        <header className="relative overflow-hidden rounded-3xl bg-ink-900 px-6 py-10 shadow-card sm:px-10 dark:bg-ink-950">
          <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-brand-500/20 blur-3xl" />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-300">
                {t('journal.eyebrow')}
              </p>
              <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                {t('journal.title')}
              </h1>
              <p className="mt-2 max-w-md text-sm text-white/60">
                {t('journal.sub')}
              </p>
            </div>
            <button
              onClick={() => setEditorOpen((o) => !o)}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:bg-brand-600 active:scale-95"
            >
              <Plus className="h-4 w-4" />
              {editorOpen ? t('journal.closeEditor') : t('journal.newEntry')}
            </button>
          </div>
        </header>

        <AnimatePresence>
          {editorOpen && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="mx-auto max-w-3xl"
            >
              <JournalEditor
                onSubmit={handleSave}
                onCancel={() => setEditorOpen(false)}
                submitLabel={t('journal.saveEntry')}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {entries.length > 0 ? (
          <div className="space-y-5">
            {entries.map((entry, i) => (
              <JournalCard key={entry.id} entry={entry} index={i} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={BookOpen}
            title={t('journal.empty')}
            message={t('journal.emptyMsg')}
            action={
              <button
                onClick={() => setEditorOpen(true)}
                className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-600"
              >
                <Plus className="h-4 w-4" /> {t('journal.writeEntry')}
              </button>
            }
          />
        )}
      </div>
    </PageTransition>
  )
}
