import { Droplets, MapPin, RotateCcw, Wind } from 'lucide-react'
import { useWeather } from '../../hooks/useWeather'
import { useTranslation } from '../../hooks/useTranslation'
import { describeCode } from '../../services/weatherApi'
import { WeatherSkeleton } from '../common/LoadingSkeleton'

function pad(n) {
  return String(n).padStart(2, '0')
}

export default function WeatherCard({ lat, lon, placeName }) {
  const { t } = useTranslation()
  const { weather, loading, error, retry } = useWeather(lat, lon)

  if (loading) return <WeatherSkeleton />
  if (error || !weather) {
    return (
      <div className="rounded-2xl bg-white p-6 text-center shadow-soft dark:bg-sand-100">
        <p className="text-sm text-ink-500">{t('weather.unavailable')}</p>
        <button
          onClick={retry}
          className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-sand-200 px-4 py-2 text-xs font-semibold text-ink-700 transition hover:border-brand-200 hover:text-brand-600"
        >
          <RotateCcw className="h-3.5 w-3.5" /> {t('common.tryAgain')}
        </button>
      </div>
    )
  }

  const { current, hourly } = weather
  const desc = describeCode(current.code)
  const descLabel = t(`weather.${desc.key}`)

  return (
    <div className="rounded-2xl bg-white p-6 shadow-soft dark:bg-sand-100">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-sm font-semibold text-ink-700">
          <MapPin className="h-4 w-4 text-brand-500" />
          {placeName || t('weather.currentLocation')}
        </p>
        <span className="text-2xl" role="img" aria-label={descLabel}>
          {desc.emoji}
        </span>
      </div>

      <div className="mt-3 flex items-end gap-2">
        <span className="font-display text-5xl font-extrabold tracking-tight text-ink-900">
          {current.temp}°
        </span>
        <span className="pb-1.5 text-sm font-medium text-ink-500">{descLabel}</span>
      </div>
      <p className="mt-1 text-xs text-ink-400">{t('weather.feelsLike', { temp: current.feelsLike })}</p>

      <div className="mt-4 flex items-center gap-4 text-xs text-ink-500">
        <span className="flex items-center gap-1">
          <Wind className="h-3.5 w-3.5 text-ink-400" /> {t('weather.wind', { speed: current.wind })}
        </span>
        <span className="flex items-center gap-1">
          <Droplets className="h-3.5 w-3.5 text-ink-400" /> {t('weather.humidity', { humidity: current.humidity })}
        </span>
      </div>

      {hourly?.length > 0 && (
        <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-6">
          {hourly.map((h, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-1 rounded-xl bg-sand-50 py-2.5 transition hover:bg-sand-100"
            >
              <span className="text-[10px] font-semibold uppercase text-ink-400">
                {pad(h.time)}:00
              </span>
              <span className="text-sm" role="img" aria-hidden="true">
                {describeCode(h.code).emoji}
              </span>
              <span className="text-sm font-bold text-ink-800">{h.temp}°</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
