import { useRef, useState } from 'react'
import { ImagePlus, Loader2, Trash2, X } from 'lucide-react'
import { useTripStore } from '../../store/tripStore'
import { useTranslation } from '../../hooks/useTranslation'
import { resizeImage, uid } from '../../utils/format'
import { cn } from '../../utils/cn'

const inputCls =
  'w-full rounded-2xl border border-sand-200 bg-white px-4 py-3 text-sm text-ink-900 outline-none transition placeholder:text-ink-400 focus:border-brand-300 focus:ring-2 focus:ring-brand-100 dark:bg-sand-100'

export default function JournalEditor({ initial, onSubmit, onCancel, submitLabel }) {
  const { t } = useTranslation()
  const trips = useTripStore((s) => s.trips)
  const fileRef = useRef(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title: initial?.title || '',
    date: initial?.date || new Date().toISOString().slice(0, 10),
    location: initial?.location || '',
    content: initial?.content || '',
    tripId: initial?.tripId || '',
  })
  const [photos, setPhotos] = useState(initial?.photos || [])

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const addPhotos = async (files) => {
    if (!files?.length) return
    setBusy(true)
    const added = []
    for (const file of Array.from(files).slice(0, 4)) {
      try {
        added.push(await resizeImage(file, 900))
      } catch {
        // skip unreadable file
      }
    }
    setPhotos((p) => [...p, ...added])
    setBusy(false)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.title.trim()) {
      setError(t('journalEditor.errTitle'))
      return
    }
    setError('')
    onSubmit({ ...form, photos, id: initial?.id || uid('entry') })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl bg-white p-6 shadow-soft dark:bg-sand-100">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-bold text-ink-900">
          {initial ? t('journalEditor.editEntry') : t('journalEditor.newEntry')}
        </h3>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            aria-label={t('journal.closeEditor')}
            className="grid h-8 w-8 place-items-center rounded-full text-ink-400 transition hover:bg-sand-100"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <input
          type="text"
          name="entry-title"
          id="entry-title"
          value={form.title}
          onChange={set('title')}
          placeholder={t('journalEditor.titlePh')}
          className={inputCls}
          aria-label="Entry title"
        />
        <input
          type="date"
          name="entry-date"
          id="entry-date"
          value={form.date}
          onChange={set('date')}
          className={inputCls}
          aria-label="Entry date"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <input
          type="text"
          name="entry-location"
          id="entry-location"
          value={form.location}
          onChange={set('location')}
          placeholder={t('journalEditor.locationPh')}
          className={inputCls}
          aria-label="Entry location"
        />
        <select
          name="entry-trip"
          id="entry-trip"
          value={form.tripId}
          onChange={set('tripId')}
          className={cn(inputCls, 'text-ink-900')}
          aria-label="Linked trip"
        >
          <option value="">{t('journalEditor.linkTrip')}</option>
          {trips.map((t) => (
            <option key={t.id} value={t.id}>
              {t.title}
            </option>
          ))}
        </select>
      </div>

      <textarea
        name="entry-content"
        id="entry-content"
        value={form.content}
        onChange={set('content')}
        rows={5}
        placeholder={t('journalEditor.contentPh')}
        className={cn(inputCls, 'resize-none')}
        aria-label="Entry content"
      />

      {/* Photos */}
      <div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => addPhotos(e.target.files)}
        />
        <div className="flex flex-wrap items-center gap-3">
          {photos.map((src, i) => (
            <div key={i} className="group relative">
              <img src={src} alt="" className="h-20 w-20 rounded-xl object-cover shadow-soft" />
              <button
                type="button"
                onClick={() => setPhotos((p) => p.filter((_, idx) => idx !== i))}
                aria-label={t('journalEditor.removePhoto')}
                className="absolute -right-1.5 -top-1.5 grid h-6 w-6 place-items-center rounded-full bg-ink-900 text-white opacity-0 shadow-soft transition group-hover:opacity-100 dark:bg-ink-950"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
          {photos.length < 4 && (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={busy}
              className="grid h-20 w-20 place-items-center rounded-xl border-2 border-dashed border-sand-300 text-ink-400 transition hover:border-brand-300 hover:text-brand-500 disabled:opacity-50"
            >
              {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
            </button>
          )}
        </div>
        <p className="mt-2 text-xs text-ink-400">{t('journalEditor.photosHint')}</p>
      </div>

      {error && (
        <p role="alert" className="rounded-2xl bg-brand-50 px-4 py-3 text-sm font-medium text-brand-700">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          className="rounded-full bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-600 active:scale-95"
        >
          {submitLabel || t('journal.saveEntry')}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full px-5 py-2.5 text-sm font-semibold text-ink-500 transition hover:text-ink-900"
          >
            {t('common.cancel')}
          </button>
        )}
      </div>
    </form>
  )
}
