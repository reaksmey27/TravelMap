import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Loader2, MapPin, Search, X } from 'lucide-react'
import { useLocation } from '../../hooks/useLocation'
import { useTranslation } from '../../hooks/useTranslation'
import { cn } from '../../utils/cn'

/**
 * Location search powered by Nominatim (debounced).
 * onSelect(location) receives a normalized { id, name, displayName, lat, lon, city, country, countryCode, type }
 */
export default function LocationSearch({
  onSelect,
  placeholder,
  className,
  autoFocus,
  initialValue = '',
  id,
}) {
  const { t } = useTranslation()
  const [query, setQuery] = useState(initialValue)
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const boxRef = useRef(null)
  const { results, loading } = useLocation(query, { limit: 6 })

  useEffect(() => {
    const onClick = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  useEffect(() => setActiveIndex(0), [query])

  const pick = (loc) => {
    onSelect(loc)
    setOpen(false)
    setQuery(loc.name || loc.displayName?.split(',')[0])
  }

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && results[activeIndex]) {
      pick(results[activeIndex])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  const visible = open && query.trim().length > 0

  return (
    <div ref={boxRef} className={cn('relative', className)}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
        <input
          type="search"
          name="location-search"
          id={id}
          value={query}
          autoFocus={autoFocus}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={placeholder || t('locationSearch.placeholder')}
          aria-label={t('locationSearch.aria')}
          className="w-full rounded-full border border-sand-200 bg-white py-3 pl-11 pr-10 text-sm text-ink-900 shadow-soft outline-none transition placeholder:text-ink-400 focus:border-brand-300 focus:ring-2 focus:ring-brand-100 dark:bg-sand-100"
        />
        {loading ? (
          <Loader2 className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-brand-500" />
        ) : (
          query && (
            <button
              onClick={() => setQuery('')}
              aria-label={t('common.clear')}
              className="absolute right-3 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full text-ink-400 hover:bg-sand-100"
            >
              <X className="h-4 w-4" />
            </button>
          )
        )}
      </div>

      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full z-50 mt-2 max-h-80 overflow-y-auto rounded-2xl border border-sand-200 bg-white p-2 shadow-lift dark:bg-sand-100"
            role="listbox"
          >
            {loading && results.length === 0 && (
              <div className="flex items-center gap-2 px-4 py-5 text-sm text-ink-400">
                <Loader2 className="h-4 w-4 animate-spin" /> {t('locationSearch.searching')}
              </div>
            )}
            {!loading && results.length === 0 && (
              <p className="px-4 py-5 text-sm text-ink-400">{t('locationSearch.noResults')}</p>
            )}
            {results.map((loc, i) => {
              const active = i === activeIndex
              return (
                <button
                  key={loc.id}
                  role="option"
                  aria-selected={active}
                  onClick={() => pick(loc)}
                  onMouseEnter={() => setActiveIndex(i)}
                  className={cn(
                    'flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition',
                    active ? 'bg-sand-100' : 'hover:bg-sand-100/60'
                  )}
                >
                  <span className="mt-0.5 shrink-0 text-brand-500">
                    <MapPin className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-ink-900">{loc.name}</span>
                    <span className="block truncate text-xs text-ink-400">
                      {loc.displayName?.split(',').slice(0, 3).join(',')}
                    </span>
                  </span>
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
