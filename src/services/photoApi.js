import { http, withFallback } from './http'
import { uid } from '../utils/format'

const UNSPLASH_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY
const PEXELS_KEY = import.meta.env.VITE_PEXELS_API_KEY

/**
 * Live photo providers — Unsplash and Pexels. At least one API key is
 * required; without one, getPhotos throws so pages can show an error state.
 */

/* ---------------- Unsplash ---------------- */
async function unsplashFetch(query, page, perPage) {
  const res = await http.get('https://api.unsplash.com/search/photos', {
    headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` },
    params: { query, page, per_page: perPage, orientation: 'landscape' },
  })
  return res.data
}

function unsplashNormalize(item) {
  return {
    id: `unsplash-${item.id}`,
    title: item.alt_description || item.description || 'Untitled travel photo',
    description: item.description || `Photo by ${item.user.name} on Unsplash.`,
    city: '',
    country: '',
    lat: item.location?.position?.latitude ?? null,
    lon: item.location?.position?.longitude ?? null,
    category: guessCategory(item.alt_description || ''),
    url: item.urls?.regular || '',
    thumb: item.urls?.small || '',
    user: { name: item.user?.name || 'Unknown', avatar: item.user?.profile_image?.small || '' },
    likes: item.likes || 0,
    date: (item.created_at || '').slice(0, 10),
    tags: (item.tags || []).slice(0, 6).map((t) => t.title),
    external: true,
  }
}

/* ---------------- Pexels ---------------- */
async function pexelsFetch(query, page, perPage) {
  const res = await http.get('https://api.pexels.com/v1/search', {
    headers: { Authorization: PEXELS_KEY },
    params: { query, page, per_page: perPage },
  })
  return res.data
}

function pexelsNormalize(item) {
  return {
    id: `pexels-${item.id}`,
    title: item.alt || 'Untitled travel photo',
    description: `Photo by ${item.photographer} on Pexels.`,
    city: '',
    country: '',
    lat: null,
    lon: null,
    category: guessCategory(item.alt || ''),
    url: item.src?.large || '',
    thumb: item.src?.medium || item.src?.small || '',
    user: { name: item.photographer || 'Unknown', avatar: '' },
    likes: 0,
    date: '',
    tags: (item.alt || '').split(' ').slice(0, 6).map((w) => w.replace(/[^a-zA-Z]/g, '')).filter(Boolean),
    external: true,
  }
}

/* ---------------- Guess category from text ---------------- */
const CATEGORY_KEYWORDS = {
  Nature: ['nature', 'forest', 'tree', 'plant', 'flower', 'landscape', 'park'],
  Beach: ['beach', 'ocean', 'sea', 'sand', 'coast', 'wave', 'island'],
  Mountain: ['mountain', 'hill', 'peak', 'alps', 'hiking', 'valley'],
  City: ['city', 'street', 'urban', 'building', 'skyline', 'night'],
  Culture: ['temple', 'church', 'mosque', 'culture', 'history', 'museum', 'art'],
  Food: ['food', 'market', 'restaurant', 'coffee', 'dinner'],
  Adventure: ['adventure', 'travel', 'surf', 'hiking', 'waterfall'],
}

function guessCategory(text = '') {
  const t = text.toLowerCase()
  for (const [cat, words] of Object.entries(CATEGORY_KEYWORDS)) {
    if (words.some((w) => t.includes(w))) return cat
  }
  return 'Adventure'
}

/* ---------------- Public API ---------------- */
const api = {
  /**
   * Get paginated photos. Options: { query, category, page, perPage }
   * Throws when no photo provider is configured or every provider fails.
   */
  async getPhotos({ query = 'travel', page = 1, perPage = 12 } = {}) {
    if (!UNSPLASH_KEY && !PEXELS_KEY) {
      throw new Error('No photo provider configured. Add a Pexels or Unsplash API key.')
    }
    // Try each configured provider once (no recursion), then give up.
    if (UNSPLASH_KEY) {
      const data = await withFallback(() => unsplashFetch(query, page, perPage), null)
      if (data?.results) {
        return { photos: data.results.map(unsplashNormalize), total: data.total, hasMore: page * perPage < data.total }
      }
    }
    if (PEXELS_KEY) {
      const data = await withFallback(() => pexelsFetch(query, page, perPage), null)
      if (data?.photos) {
        return { photos: data.photos.map(pexelsNormalize), total: data.total_results, hasMore: page * perPage < data.total_results }
      }
    }
    throw new Error('Could not load photos from any photo provider.')
  },

  /** Curated set for the home page */
  async getTrending({ perPage = 8 } = {}) {
    return this.getPhotos({ query: 'travel landscape', page: 1, perPage })
  },

  /** Photos for a destination (by place name) */
  async getPhotosByDestination(destination, { page = 1, perPage = 12 } = {}) {
    const query = `${destination.name || destination} ${destination.country || ''} travel`.trim()
    return this.getPhotos({ query, page, perPage })
  },

  /** Resolve a single photo by id (external provider ids only) */
  async getPhotoById(id) {
    return withFallback(
      async () => {
        const [providerName, rawId] = id.split('-')
        if (providerName === 'unsplash' && UNSPLASH_KEY) {
          const res = await http.get(`https://api.unsplash.com/photos/${rawId}`, {
            headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` },
          })
          return unsplashNormalize(res.data)
        }
        if (providerName === 'pexels' && PEXELS_KEY) {
          const res = await http.get(`https://api.pexels.com/v1/photos/${rawId}`, {
            headers: { Authorization: PEXELS_KEY },
          })
          return pexelsNormalize(res.data)
        }
        return null
      },
      null
    )
  },

  /** Create a synthetic photo reference from an uploaded image */
  fromUpload(dataUrl, { title, city, country, lat, lon }) {
    return {
      id: uid('upload'),
      title: title || 'My travel photo',
      description: 'Uploaded from my own journey.',
      city: city || '',
      country: country || '',
      lat: lat ?? null,
      lon: lon ?? null,
      category: 'Adventure',
      url: dataUrl,
      thumb: dataUrl,
      user: { name: 'Me', avatar: '' },
      likes: 0,
      date: new Date().toISOString().slice(0, 10),
      tags: ['my-trip', 'upload'],
      uploaded: true,
    }
  },
}

export default api
