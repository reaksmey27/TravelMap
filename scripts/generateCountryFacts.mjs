/**
 * Generates src/services/countryFacts.js from the world-countries package.
 *
 * Run:  node scripts/generateCountryFacts.mjs
 *
 * The generated file is a compact, dependency-free lookup keyed by ISO 3166-1
 * alpha-2 code, covering the static fields the CountriesNow API doesn't
 * provide (official name, region, languages, area, timezones).
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import countries from 'world-countries'
import { getTimezonesForCountry } from 'countries-and-timezones'

const __dirname = dirname(fileURLToPath(import.meta.url))

/**
 * Canonical zone per country for well-known multi-zone nations, so
 * timezones[0] reads naturally (e.g. US -> America/New_York, not an
 * Aleutian island). Falls back to offset-frequency ordering otherwise.
 */
const PREFERRED_TZ = {
  US: 'America/New_York',
  CA: 'America/Toronto',
  MX: 'America/Mexico_City',
  BR: 'America/Sao_Paulo',
  AR: 'America/Argentina/Buenos_Aires',
  CL: 'America/Santiago',
  GB: 'Europe/London',
  FR: 'Europe/Paris',
  DE: 'Europe/Berlin',
  ES: 'Europe/Madrid',
  IT: 'Europe/Rome',
  PT: 'Europe/Lisbon',
  RU: 'Europe/Moscow',
  TR: 'Europe/Istanbul',
  CN: 'Asia/Shanghai',
  IN: 'Asia/Kolkata',
  JP: 'Asia/Tokyo',
  KR: 'Asia/Seoul',
  ID: 'Asia/Jakarta',
  AU: 'Australia/Sydney',
  NZ: 'Pacific/Auckland',
  ZA: 'Africa/Johannesburg',
  EG: 'Africa/Cairo',
  NG: 'Africa/Lagos',
  KE: 'Africa/Nairobi',
  SA: 'Asia/Riyadh',
  AE: 'Asia/Dubai',
  KZ: 'Asia/Almaty',
  TH: 'Asia/Bangkok',
  VN: 'Asia/Ho_Chi_Minh',
  MY: 'Asia/Kuala_Lumpur',
  PH: 'Asia/Manila',
  PK: 'Asia/Karachi',
  BD: 'Asia/Dhaka',
  UA: 'Europe/Kyiv',
  PL: 'Europe/Warsaw',
  SE: 'Europe/Stockholm',
  NO: 'Europe/Oslo',
  DK: 'Europe/Copenhagen',
  NL: 'Europe/Amsterdam',
  BE: 'Europe/Brussels',
  CH: 'Europe/Zurich',
  AT: 'Europe/Vienna',
  IE: 'Europe/Dublin',
  GR: 'Europe/Athens',
  RO: 'Europe/Bucharest',
  CZ: 'Europe/Prague',
  HU: 'Europe/Budapest',
  FI: 'Europe/Helsinki',
  IS: 'Atlantic/Reykjavik',
}

const facts = {}
for (const c of countries) {
  if (!c.cca2) continue
  const zones = getTimezonesForCountry(c.cca2) || []

  // Dedupe by UTC offset and order by offset frequency (most zones share the
  // offset first), so timezones[0] is a representative zone — e.g. the US
  // lists an Eastern zone before America/Adak. Names are secondary-sorted.
  const byOffset = new Map()
  for (const z of zones) {
    const key = z.utcOffsetStr || '00:00'
    if (!byOffset.has(key)) byOffset.set(key, [])
    byOffset.get(key).push(z.name)
  }
  let timezones = [...byOffset.entries()]
    .sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]))
    .flatMap(([, names]) => [...new Set(names)].sort())
  // Hoist the canonical zone (if the dataset lists it) to the front.
  const preferred = PREFERRED_TZ[c.cca2]
  if (preferred && timezones.includes(preferred)) {
    timezones = [preferred, ...timezones.filter((z) => z !== preferred)]
  }

  facts[c.cca2] = {
    officialName: c.name?.official || '',
    region: c.region || '',
    languages: Object.values(c.languages || {}),
    area: c.area ?? null,
    timezones,
  }
}

const header = `// AUTO-GENERATED from world-countries + countries-and-timezones
// (node scripts/generateCountryFacts.mjs). Static country facts keyed by ISO
// 3166-1 alpha-2 code. Fills in fields the CountriesNow API does not provide
// (official name, region, languages, area, timezones).

`

// Minified (single line) — the file ships to the client in the lazy-loaded
// DestinationDetails chunk, so size matters; it's regenerated, never edited.
const body = 'export const COUNTRY_FACTS = ' + JSON.stringify(facts) + '\n'

const outPath = join(__dirname, '..', 'src', 'services', 'countryFacts.js')
mkdirSync(dirname(outPath), { recursive: true })
writeFileSync(outPath, header + body, 'utf8')

console.log(`Wrote ${outPath} (${Object.keys(facts).length} countries, ${(header + body).length} bytes)`)
