import { Repeat } from 'lucide-react'
import { useTranslation } from '../../hooks/useTranslation'
import { cn } from '../../utils/cn'

const LANGS = [
  {
    id: 'en',
    labelKey: 'language.english',
    code: 'EN',
    flagUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/83/Flag_of_the_United_Kingdom_%283-5%29.svg',
  },
  {
    id: 'km',
    labelKey: 'language.khmer',
    code: 'KH',
    flagUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Flag_of_Cambodia.svg/330px-Flag_of_Cambodia.svg.png',
  },
]

export default function LanguageSwitcher({ className, compact = false }) {
  const { t, lang, setLang } = useTranslation()
  const current = LANGS.find((l) => l.id === lang) ?? LANGS[0]
  const next = LANGS.find((l) => l.id !== lang) ?? LANGS[1]

  return (
    <button
      type="button"
      onClick={() => setLang(next.id)}
      aria-label={t('language.switchTo', { lang: t(next.labelKey) })}
      title={t('language.switchTo', { lang: t(next.labelKey) })}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-sand-200 bg-white font-semibold text-ink-600 transition active:scale-95 dark:border-sand-300 dark:bg-sand-200',
        'hover:border-brand-300 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-100 dark:hover:text-brand-400',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300',
        compact ? 'px-2.5 py-1.5 text-[11px]' : 'px-4 py-2 text-xs',
        className
      )}
    >
      <img
        src={current.flagUrl}
        alt=""
        aria-hidden="true"
        loading="lazy"
        className={cn(
          'rounded-[3px] object-cover ring-1 ring-ink-900/10',
          compact ? 'h-3 w-[18px]' : 'h-4 w-6'
        )}
      />
      <span>{compact ? current.code : t(current.labelKey)}</span>
      <Repeat className={cn('text-ink-400', compact ? 'h-3 w-3' : 'h-3.5 w-3.5')} aria-hidden="true" />
    </button>
  )
}
