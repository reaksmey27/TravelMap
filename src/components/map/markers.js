import L from 'leaflet'

export function pinSvg(color = '#E05A26') {
  return `<svg width="34" height="44" viewBox="0 0 34 44" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 1C8.2 1 1 8.2 1 17c0 11.9 16 26 16 26s16-14.1 16-26C33 8.2 25.8 1 17 1z" fill="${color}" stroke="white" stroke-width="2"/>
    <circle cx="17" cy="17" r="6.5" fill="white"/>
  </svg>`
}

/** Destination pin with a soft pulse on hover */
export function pinIcon({ color = '#E05A26' } = {}) {
  return L.divIcon({
    className: '',
    html: `<div class="tm-pin tm-pin-pop" style="width:34px;height:44px">${pinSvg(color)}<span class="tm-pin-dot"></span></div>`,
    iconSize: [34, 44],
    iconAnchor: [17, 42],
    popupAnchor: [0, -40],
  })
}

/** Circular thumbnail marker for photos */
export function photoPinIcon(photoUrl, size = 40) {
  const inner = size - 5
  return L.divIcon({
    className: '',
    html: `<div class="tm-pin tm-pin-pop" style="width:${size}px;height:${size}px"><img class="tm-pin-photo" src="${photoUrl}" style="width:${inner}px;height:${inner}px;object-fit:cover" alt="" loading="lazy"/><span class="tm-pin-dot"></span></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2 + 2],
    popupAnchor: [0, -size / 2],
  })
}

/** Small flat dot marker (used for quiet locations) */
export function dotIcon(color = '#849C75') {
  return L.divIcon({
    className: '',
    html: `<div class="tm-pin" style="width:14px;height:14px;background:${color};border-radius:9999px;border:2px solid white;box-shadow:0 2px 6px rgb(26 23 19 / 0.3)"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -10],
  })
}
