import axios from 'axios'

export const http = axios.create({
  timeout: 12000,
  headers: { Accept: 'application/json' },
})

http.interceptors.response.use(
  (res) => res,
  (error) => {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      'Something went wrong. Please try again.'
    return Promise.reject(new Error(message))
  }
)

export async function withFallback(apiCall, fallbackValue) {
  try {
    return await apiCall()
  } catch (err) {
    console.warn('[TravelMap] API fallback used:', err.message)
    return fallbackValue
  }
}
