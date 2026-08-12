import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useTranslation } from '../../hooks/useTranslation'

export default function SectionHeading({ eyebrow, title, subtitle, linkTo, linkLabel }) {
  const { t } = useTranslation()
  return (
    <div className="mb-8 flex items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-500">
            {eyebrow}
          </p>
        )}
        <h2 className="font-display text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">
          {title}
        </h2>
        {subtitle && <p className="mt-2 max-w-xl text-sm text-ink-500">{subtitle}</p>}
      </div>
      {linkTo && (
        <Link
          to={linkTo}
          className="group hidden shrink-0 items-center gap-1.5 text-sm font-semibold text-brand-600 transition hover:text-brand-700 sm:inline-flex"
        >
          {linkLabel || t('common.viewAll')}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  )
}
