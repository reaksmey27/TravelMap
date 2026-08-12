import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const nominatimProxy = {
  // Nominatim (OpenStreetMap geocoder) blocks browser cross-origin requests.
  // Proxying keeps calls same-origin in dev and identifies the app via UA.
  target: 'https://nominatim.openstreetmap.org',
  changeOrigin: true,
  rewrite: (path) => path.replace(/^\/nominatim/, ''),
  headers: { 'User-Agent': 'TravelMap/1.0 (local development)' },
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/nominatim': nominatimProxy,
    },
  },
  preview: {
    proxy: {
      '/nominatim': nominatimProxy,
    },
  },
  build: {
    chunkSizeWarningLimit: 900,
  },
})
