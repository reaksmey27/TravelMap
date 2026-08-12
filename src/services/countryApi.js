import { http, withFallback } from './http'
import { COUNTRY_FACTS } from './countryFacts'

/**
 * Country lookups via the keyless, CORS-enabled CountriesNow API.
 * (restcountries.com deprecated its v3.1 API, and its v5 requires an API
 * key + doesn't allow browser CORS, so it can't be called from the client.)
 *
 * CountriesNow serves bulk lists, so responses are fetched once per page
 * session and cached. Static fields it doesn't provide (official name,
 * region, languages, area, timezones) are filled from the bundled
 * countryFacts dataset (see scripts/generateCountryFacts.mjs).
 */
const BASE = 'https://countriesnow.space/api/v0.1/countries'
const INFO_FIELDS = 'unicodeFlag,currency,capital,iso2,iso3'

// Cache successful responses for the page session; failures are retried on
// the next call so the card's "Try again" button keeps working.
let infoCache = null
let populationCache = null

const norm = (s) => (s || '').trim().toLowerCase()

async function getInfoList() {
  if (infoCache) return infoCache
  const data = await withFallback(
    () =>
      http
        .get(`${BASE}/info?returns=${INFO_FIELDS}`)
        .then((res) => res.data?.data),
    null
  )
  if (Array.isArray(data)) infoCache = data
  return infoCache || []
}

async function getPopulationList() {
  if (populationCache) return populationCache
  const data = await withFallback(
    () => http.get(`${BASE}/population`).then((res) => res.data?.data),
    null
  )
  if (Array.isArray(data)) populationCache = data
  return populationCache || []
}

/**
 * Fetch country information from CountriesNow.
 * Pass either a country name or a 2-letter ISO code.
 * Returns null when the country is unknown or the API is unreachable.
 */
export async function getCountry({ name, code } = {}) {
  if (!name && !code) return null

  const list = await getInfoList()
  const entry = code
    ? list.find((c) => norm(c.iso2) === norm(code))
    : list.find((c) => norm(c.name) === norm(name))
  if (!entry) return null

  // Latest year's count from the population time series (matched by iso3 —
  // names differ between the two lists for some countries).
  const rows = await getPopulationList()
  const popRow = rows.find((r) => norm(r.iso3) === norm(entry.iso3))
  const counts = popRow?.populationCounts
  const population = counts?.length ? counts[counts.length - 1].value : null

  const flagEmoji = entry.unicodeFlag || countryFlagEmoji(entry.iso2)

  // Static facts bundled with the app (region, languages, official name,
  // area, timezones) — CountriesNow doesn't provide these.
  const facts = COUNTRY_FACTS[entry.iso2] || {}

  return {
    name: entry.name,
    officialName: facts.officialName || '',
    flag: flagEmoji,
    flagEmoji,
    capital: entry.capital || '',
    region: facts.region || '',
    subregion: '',
    population,
    area: facts.area ?? null,
    currencies: entry.currency ? [entry.currency] : [],
    languages: facts.languages || [],
    timezones: facts.timezones || [],
    latlng: [],
    code: entry.iso2 || '',
  }
}

/** 'ES' -> 🇪🇸 */
export function countryFlagEmoji(cc) {
  if (!cc) return ''
  const codePoints = cc
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}
