import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'
import { useTranslation } from '../../hooks/useTranslation'
import { cn } from '../../utils/cn'

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
  cancelLabel,
  icon: Icon = AlertTriangle,
  variant = 'brand',
}) {
  const { t } = useTranslation()

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onCancel()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onCancel])

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[1200] flex items-center justify-center bg-ink-900/60 p-4 backdrop-blur-sm"
          onClick={onCancel}
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 6 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-lift dark:bg-sand-100"
          >
            <div className="flex flex-col items-center text-center">
              <span
                className={cn(
                  'grid h-12 w-12 place-items-center rounded-full',
                  variant === 'danger' ? 'bg-red-50 text-red-500' : 'bg-brand-50 text-brand-500'
                )}
              >
                <Icon className="h-6 w-6" />
              </span>
              <h2 className="mt-4 font-display text-lg font-bold text-ink-900">{title}</h2>
              {message && <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{message}</p>}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                autoFocus
                onClick={onCancel}
                className="flex-1 rounded-full border border-sand-200 px-4 py-2.5 text-sm font-semibold text-ink-700 transition hover:border-sand-300 hover:bg-sand-50 dark:border-sand-200 dark:hover:bg-sand-200"
              >
                {cancelLabel || t('common.cancel')}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className={cn(
                  'flex-1 rounded-full px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition active:scale-95',
                  variant === 'danger'
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-brand-500 hover:bg-brand-600'
                )}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
