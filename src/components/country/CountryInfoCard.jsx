import { Landmark, Languages, Map as MapIcon, RotateCcw, Users } from 'lucide-react'
import { useCountry } from '../../hooks/useCountry'
import { useTranslation } from '../../hooks/useTranslation'
import { compactNumber, formatNumber } from '../../utils/format'
import { CardSkeleton } from '../common/LoadingSkeleton'

function Row({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <dt className="flex items-center gap-1.5 text-sm text-ink-500">
        {label}
      </dt>
      <dd className="text-right text-sm font-semibold text-ink-900">{value || '—'}</dd>
    </div>
  )
}

export default function CountryInfoCard({ name, code }) {
  const { t } = useTranslation()
  const { country, loading, error, retry } = useCountry({ name, code })

  if (loading) return <CardSkeleton />
  if (error || !country) {
    return (
      <div className="rounded-2xl bg-white p-6 text-center shadow-soft dark:bg-sand-100">
        <p className="text-sm text-ink-500">{t('country.unavailable')}</p>
        <button
          onClick={retry}
          className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-sand-200 px-4 py-2 text-xs font-semibold text-ink-700 transition hover:border-brand-200 hover:text-brand-600"
        >
          <RotateCcw className="h-3.5 w-3.5" /> {t('common.tryAgain')}
        </button>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-soft dark:bg-sand-100">
      <div className="flex items-center gap-3">
        <span className="text-4xl leading-none">{country.flag || country.flagEmoji}</span>
        <div>
          <h3 className="font-display text-lg font-bold text-ink-900">{country.name}</h3>
          <p className="text-xs text-ink-400">{country.officialName}</p>
        </div>
      </div>

      <dl className="mt-4 divide-y divide-sand-100 border-t border-sand-100">
        <Row
          label={<span className="flex items-center gap-1.5"><Landmark className="h-4 w-4 text-ink-400" /> {t('country.capital')}</span>}
          value={country.capital}
        />
        <Row
          label={<span className="flex items-center gap-1.5"><MapIcon className="h-4 w-4 text-ink-400" /> {t('country.region')}</span>}
          value={country.region}
        />
        <Row
          label={<span className="flex items-center gap-1.5"><Users className="h-4 w-4 text-ink-400" /> {t('country.population')}</span>}
          value={country.population ? compactNumber(country.population) : '—'}
        />
        <Row
          label={<span className="flex items-center gap-1.5"><Landmark className="h-4 w-4 text-ink-400" /> {t('country.currency')}</span>}
          value={country.currencies?.join(', ')}
        />
        <Row
          label={<span className="flex items-center gap-1.5"><Languages className="h-4 w-4 text-ink-400" /> {t('country.language')}</span>}
          value={country.languages?.slice(0, 3).join(', ')}
        />
      </dl>
      {country.area && (
        <p className="mt-3 text-center text-xs text-ink-400">
          {t('country.areaLine', { area: formatNumber(country.area), tz: country.timezones?.[0] || '' })}
        </p>
      )}
    </div>
  )
}
