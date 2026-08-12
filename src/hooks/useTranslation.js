import { useCallback } from 'react'
import { useLanguageStore } from '../store/languageStore'
import { translate } from '../i18n'

export function useTranslation() {
  const lang = useLanguageStore((s) => s.lang)
  const setLang = useLanguageStore((s) => s.setLang)
  const t = useCallback((key, params) => translate(lang, key, params), [lang])
  return { t, lang, setLang }
}
