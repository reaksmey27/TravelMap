import { getMonths } from '../i18n'

/** "2026-06-12" -> "June 12, 2026" (localized) */
export function formatDate(dateStr, lang = 'en') {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return dateStr
  const months = getMonths(lang)
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
}

/** "2026-06-12" -> "Jun 12" (localized) */
export function formatShortDate(dateStr, lang = 'en') {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return dateStr
  const months = getMonths(lang)
  return `${months[d.getMonth()].slice(0, 3)} ${d.getDate()}`
}

/** "June 12 – June 18, 2026" (localized) */
export function formatRange(start, end, lang = 'en') {
  if (!start || !end) return ''
  const s = new Date(start)
  const e = new Date(end)
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return ''
  const months = getMonths(lang)
  const sameMonth = s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()
  if (sameMonth) {
    return `${months[s.getMonth()]} ${s.getDate()} – ${e.getDate()}, ${e.getFullYear()}`
  }
  return `${months[s.getMonth()]} ${s.getDate()} – ${months[e.getMonth()]} ${e.getDate()}, ${e.getFullYear()}`
}

/** 1284 -> "1,284" */
export function formatNumber(n) {
  if (n == null) return ''
  return Number(n).toLocaleString('en-US')
}

/** 1240 -> "1.2K", 2400000 -> "2.4M" */
export function compactNumber(n) {
  if (n == null) return ''
  const num = Number(n)
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  if (num >= 1_000) return `${(num / 1_000).toFixed(1).replace(/\.0$/, '')}K`
  return String(num)
}

/** unique id */
export function uid(prefix = 'id') {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID().slice(0, 8)}`
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

/** extract a readable city/country pair from a normalized place name */
export function splitName(name) {
  if (!name) return { city: '', country: '' }
  const parts = name.split(',').map((p) => p.trim())
  return { city: parts[0] || '', country: parts[1] || '' }
}

/** Resize an image File to a compressed data URL (max 1000px, jpeg 0.8) */
export function resizeImage(file, maxSize = 1000) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
        const w = Math.round(img.width * scale)
        const h = Math.round(img.height * scale)
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL('image/jpeg', 0.8))
      }
      img.onerror = reject
      img.src = reader.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
