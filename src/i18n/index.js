import { translations } from './translations'

export { MONTHS, getMonths } from './translations'

/**
 * Look up a translation key for the given language.
 * Falls back to English, then to the raw key. `params` replace {placeholders}.
 */
export function translate(lang, key, params) {
  const dict = translations[lang] || translations.en
  let str = dict[key] ?? translations.en[key] ?? key
  if (params) {
    for (const [name, value] of Object.entries(params)) {
      str = str.split(`{${name}}`).join(String(value))
    }
  }
  return str
}
