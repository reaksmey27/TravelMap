import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Calendar, ImagePlus, Loader2, MapPin, Plus, Trash2, X } from 'lucide-react'
import LocationSearch from '../map/LocationSearch'
import { useTranslation } from '../../hooks/useTranslation'
import { cn } from '../../utils/cn'
import { resizeImage } from '../../utils/format'

const inputCls =
  'w-full rounded-2xl border border-sand-200 bg-white px-4 py-3 text-sm text-ink-900 outline-none transition placeholder:text-ink-400 focus:border-brand-300 focus:ring-2 focus:ring-brand-100 dark:bg-sand-100'

function Field({ label, required, children, className }) {
  return (
    <label className={cn('block', className)}>
      <span className="mb-1.5 flex items-center gap-0.5 text-sm font-semibold text-ink-700">
        {label}
        {required && <span className="text-brand-500">*</span>}
      </span>
      {children}
    </label>
  )
}

export default function TripForm({ initial, onSubmit, submitLabel, busy = false }) {
  const { t } = useTranslation()
  const [form, setForm] = useState({
    title: initial?.title || '',
    startDate: initial?.startDate || '',
    endDate: initial?.endDate || '',
    description: initial?.description || '',
    coverImage: initial?.coverImage || '',
    destination: initial?.destination || '',
    country: initial?.country || '',
    countryCode: initial?.countryCode || '',
    lat: initial?.lat || null,
    lon: initial?.lon || null,
  })
  const [places, setPlaces] = useState(initial?.locations || [])
  const [placeQuery, setPlaceQuery] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef(null)

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const onDestination = (loc) => {
    setForm((f) => ({
      ...f,
      destination: loc.city || loc.name,
      country: loc.country || f.country,
      countryCode: loc.countryCode || f.countryCode,
      lat: loc.lat,
      lon: loc.lon,
    }))
  }

  const addPlace = (loc) => {
    if (!loc) return
    setPlaces((p) => [
      ...p,
      {
        name: loc.city || loc.name,
        lat: loc.lat,
        lon: loc.lon,
        day: p.length + 1,
      },
    ])
    setPlaceQuery('')
  }

  const removePlace = (idx) => setPlaces((p) => p.filter((_, i) => i !== idx))

  const onUpload = async (file) => {
    if (!file) return
    setUploading(true)
    try {
      const dataUrl = await resizeImage(file, 1400)
      setForm((f) => ({ ...f, coverImage: dataUrl }))
    } catch {
      setError(t('tripForm.errImage'))
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.destination.trim()) {
      setError(t('tripForm.errTitle'))
      return
    }
    if (form.startDate && form.endDate && form.endDate < form.startDate) {
      setError(t('tripForm.errDate'))
      return
    }
    setError('')
    onSubmit({ ...form, locations: places })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onUpload(e.target.files?.[0])}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className={cn(
            'group relative block h-44 w-full overflow-hidden rounded-2xl border-2 border-dashed transition',
            form.coverImage
              ? 'border-transparent'
              : 'border-sand-300 bg-sand-50 hover:border-brand-300 hover:bg-brand-50/40'
          )}
        >
          {form.coverImage ? (
            <>
              <img src={form.coverImage} alt={t('tripForm.coverAlt')} className="h-full w-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center bg-ink-900/40 opacity-0 transition group-hover:opacity-100 dark:bg-ink-950/40">
                <span className="rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-ink-900 dark:bg-sand-100/90 dark:text-ink-900">
                  {t('tripForm.changeCover')}
                </span>
              </div>
            </>
          ) : (
            <span className="flex flex-col items-center gap-2 text-sm font-medium text-ink-500">
              {uploading ? (
                <>
                  <Loader2 className="h-6 w-6 animate-spin text-brand-500" /> {t('tripForm.processing')}
                </>
              ) : (
                <>
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-white text-brand-500 shadow-soft">
                    <ImagePlus className="h-5 w-5" />
                  </span>
                  {t('tripForm.uploadCover')}
                </>
              )}
            </span>
          )}
        </button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label={t('tripForm.tripName')} required>
          <input
            type="text"
            name="trip-title"
            id="trip-title"
            value={form.title}
            onChange={set('title')}
            placeholder={t('tripForm.titlePh')}
            className={inputCls}
          />
        </Field>

        <Field label={t('tripForm.destination')} required>
          <LocationSearch
            id="trip-destination"
            onSelect={onDestination}
            initialValue={form.destination}
            placeholder={t('tripForm.destPh')}
          />
        </Field>

        <Field label={t('tripForm.startDate')} className="relative">
          <Calendar className="pointer-events-none absolute bottom-3.5 left-4 h-4 w-4 text-ink-400" />
          <input type="date" name="trip-start" id="trip-start" value={form.startDate} onChange={set('startDate')} className={cn(inputCls, 'pl-11')} />
        </Field>

        <Field label={t('tripForm.endDate')} className="relative">
          <Calendar className="pointer-events-none absolute bottom-3.5 left-4 h-4 w-4 text-ink-400" />
          <input type="date" name="trip-end" id="trip-end" value={form.endDate} onChange={set('endDate')} className={cn(inputCls, 'pl-11')} />
        </Field>
      </div>

      <Field label={t('tripForm.description')}>
        <textarea
          name="trip-description"
          id="trip-description"
          value={form.description}
          onChange={set('description')}
          rows={3}
          placeholder={t('tripForm.descPh')}
          className={cn(inputCls, 'resize-none')}
        />
      </Field>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-sm font-semibold text-ink-700">{t('tripForm.placesVisited')}</span>
          <span className="text-xs text-ink-400">{t('tripForm.added', { count: places.length })}</span>
        </div>
        <LocationSearch id="trip-add-place" onSelect={addPlace} placeholder={t('tripForm.addPlace')} />

        <AnimatePresence>
          {places.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 flex flex-wrap gap-2"
            >
              {places.map((p, i) => (
                <motion.span
                  key={`${p.name}-${i}`}
                  layout
                  className="inline-flex items-center gap-1.5 rounded-full border border-sage-200 bg-sage-500/10 py-1.5 pl-3 pr-1.5 text-sm font-medium text-sage-700"
                >
                  <MapPin className="h-3.5 w-3.5" />
                  {p.name}
                  <button
                    type="button"
                    onClick={() => removePlace(i)}
                    aria-label={t('tripForm.removePlace', { name: p.name })}
                    className="grid h-5 w-5 place-items-center rounded-full text-sage-700/60 transition hover:bg-white hover:text-brand-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </motion.span>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        {places.length > 0 && (
          <button
            type="button"
            onClick={() => setPlaces([])}
            className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-ink-400 transition hover:text-brand-600"
          >
            <Trash2 className="h-3.5 w-3.5" /> {t('tripForm.clearAll')}
          </button>
        )}
      </div>

      {error && (
        <p role="alert" className="rounded-2xl bg-brand-50 px-4 py-3 text-sm font-medium text-brand-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-500 px-8 py-3.5 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-600 active:scale-[0.98] disabled:opacity-60 sm:w-auto"
      >
        {busy && <Loader2 className="h-4 w-4 animate-spin" />}
        <Plus className="h-4 w-4" />
        {submitLabel || t('trips.create')}
      </button>
    </form>
  )
}
