import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Backpack, Loader2, MapPin, Search, X } from 'lucide-react'
import { useLocation } from '../../hooks/useLocation'
import { useTripStore } from '../../store/tripStore'
import { useTranslation } from '../../hooks/useTranslation'
import { cn } from '../../utils/cn'

function groupIcon(group) {
  if (group === 'Places') return <MapPin className="h-4 w-4 text-brand-500" />
  return <Backpack className="h-4 w-4" />
}

export default function SearchBar({ placeholder, className, autoFocus }) {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const boxRef = useRef(null)
  const navigate = useNavigate()
  const trips = useTripStore((s) => s.trips)
  const { results: places, loading } = useLocation(query, { limit: 4 })

  const items = useMemo(() => {
    const placeItems = places.slice(0, 4).map((p) => ({
      id: `place-${p.id}`,
      group: 'Places',
      label: p.name,
      sub: p.displayName?.split(',').slice(0, 3).join(','),
      to: `/map?lat=${p.lat}&lng=${p.lon}&name=${encodeURIComponent(p.name || p.city)}`,
    }))
    const tripItems = trips
      .filter((t) => (t.title + t.destination + t.country).toLowerCase().includes(query.toLowerCase()))
      .slice(0, 3)
      .map((t) => ({ id: `trip-${t.id}`, group: 'Trips', label: t.title, sub: t.destination, to: `/trips/${t.id}` }))
    return [...placeItems, ...tripItems]
  }, [query, places, trips])

  const visible = query.trim().length > 0 && open
  const showLoading = query.trim().length > 0 && loading

  useEffect(() => {
    const onClick = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  useEffect(() => setActiveIndex(0), [query])

  const go = (item) => {
    setOpen(false)
    setQuery('')
    navigate(item.to)
  }

  const onKeyDown = (e) => {
    if (!visible) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, items.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && items[activeIndex]) {
      go(items[activeIndex])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  const groups = [...new Set(items.map((i) => i.group))]

  return (
    <div ref={boxRef} className={cn('relative', className)}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
        <input
          type="search"
          name="search"
          id="global-search"
          value={query}
          autoFocus={autoFocus}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={placeholder || t('search.placeholder')}
          aria-label={t('search.aria')}
          className="w-full rounded-full border border-sand-200 bg-white py-2.5 pl-11 pr-10 text-sm text-ink-900 shadow-soft outline-none transition placeholder:text-ink-400 focus:border-brand-300 focus:ring-2 focus:ring-brand-100 dark:border-sand-300 dark:bg-sand-200"
        />
        {showLoading && (
          <Loader2 className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-brand-500" />
        )}
        {!showLoading && query && (
          <button
            onClick={() => {
              setQuery('')
              setOpen(false)
            }}
            aria-label={t('search.clearAria')}
            className="absolute right-3 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full text-ink-400 hover:bg-sand-100 dark:hover:bg-sand-300"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[70vh] overflow-y-auto rounded-2xl border border-sand-200 bg-white p-2 shadow-lift dark:border-sand-300 dark:bg-sand-200"
            role="listbox"
          >
            {items.length === 0 && !loading && (
              <p className="px-4 py-8 text-center text-sm text-ink-400">
                {t('search.noResults', { query })}
              </p>
            )}
            {loading && items.length === 0 && (
              <div className="flex items-center gap-2 px-4 py-6 text-sm text-ink-400">
                <Loader2 className="h-4 w-4 animate-spin" /> {t('search.searching')}
              </div>
            )}
            {groups.map((group) => (
              <div key={group}>
                <p className="px-3 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wider text-ink-400">
                  {group === 'Places' ? t('common.places') : t('common.trips')}
                </p>
                {items
                  .filter((i) => i.group === group)
                  .map((item) => {
                    const idx = items.indexOf(item)
                    const active = idx === activeIndex
                    return (
                      <button
                        key={item.id}
                        role="option"
                        aria-selected={active}
                        onClick={() => go(item)}
                        onMouseEnter={() => setActiveIndex(idx)}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition',
                          active ? 'bg-sand-100 dark:bg-sand-300' : 'hover:bg-sand-100/60 dark:hover:bg-sand-300/60'
                        )}
                      >
                        <span
                          className={cn(
                            'grid h-8 w-8 shrink-0 place-items-center rounded-lg',
                            active ? 'bg-white text-brand-600 shadow-soft dark:bg-sand-50' : 'bg-sand-100 text-ink-500'
                          )}
                        >
                          {groupIcon(group)}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium text-ink-900">{item.label}</span>
                          <span className="block truncate text-xs text-ink-400">{item.sub}</span>
                        </span>
                      </button>
                    )
                  })}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
