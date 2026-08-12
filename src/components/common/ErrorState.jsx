import { CloudOff } from 'lucide-react'
import { useTranslation } from '../../hooks/useTranslation'

export default function ErrorState({ title, message, onRetry }) {
  const { t } = useTranslation()
  const heading = title ?? t('errorState.title')
  const body = message ?? t('errorState.msg')
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-16 text-center">
      <div className="mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-brand-50 text-brand-500">
        <CloudOff className="h-7 w-7" />
      </div>
      <h3 className="font-display text-lg font-bold text-ink-900">{heading}</h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-500">{body}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-6 rounded-full bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-600 active:scale-95"
        >
          {t('errorState.tryAgain')}
        </button>
      )}
    </div>
  )
}
