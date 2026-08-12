import { http } from './http'

const BASE = 'https://api.open-meteo.com/v1/forecast'

/** WMO weather code -> { key, emoji }; `key` maps to a weather.* translation key. */
export const WMO_CODES = {
  0: { key: 'clear', emoji: '☀️' },
  1: { key: 'mostlyClear', emoji: '🌤️' },
  2: { key: 'partlyCloudy', emoji: '⛅' },
  3: { key: 'overcast', emoji: '☁️' },
  45: { key: 'foggy', emoji: '🌫️' },
  48: { key: 'icyFog', emoji: '🌫️' },
  51: { key: 'lightDrizzle', emoji: '🌦️' },
  53: { key: 'drizzle', emoji: '🌦️' },
  55: { key: 'heavyDrizzle', emoji: '🌧️' },
  56: { key: 'freezingDrizzle', emoji: '🌧️' },
  57: { key: 'freezingDrizzle', emoji: '🌧️' },
  61: { key: 'lightRain', emoji: '🌦️' },
  63: { key: 'rain', emoji: '🌧️' },
  65: { key: 'heavyRain', emoji: '🌧️' },
  66: { key: 'freezingRain', emoji: '🌧️' },
  67: { key: 'freezingRain', emoji: '🌧️' },
  71: { key: 'lightSnow', emoji: '🌨️' },
  73: { key: 'snow', emoji: '❄️' },
  75: { key: 'heavySnow', emoji: '❄️' },
  77: { key: 'snowGrains', emoji: '❄️' },
  80: { key: 'lightShowers', emoji: '🌦️' },
  81: { key: 'showers', emoji: '🌧️' },
  82: { key: 'heavyShowers', emoji: '⛈️' },
  85: { key: 'snowShowers', emoji: '🌨️' },
  86: { key: 'snowShowers', emoji: '🌨️' },
  95: { key: 'thunderstorm', emoji: '⛈️' },
  96: { key: 'thunderstorm', emoji: '⛈️' },
  99: { key: 'severeThunderstorm', emoji: '⛈️' },
}

export function describeCode(code) {
  return WMO_CODES[code] || { key: 'unknown', emoji: '🌡️' }
}

/**
 * Current weather + next-hours forecast for a coordinate (Open-Meteo).
 * Throws when the API is unreachable so pages can show an error state.
 */
export async function getWeather(lat, lon) {
  const data = await http
    .get(BASE, {
      params: {
        latitude: lat,
        longitude: lon,
        current: 'temperature_2m,apparent_temperature,weather_code,wind_speed_10m,relative_humidity_2m',
        hourly: 'temperature_2m,weather_code',
        forecast_days: 1,
        timezone: 'auto',
      },
    })
    .then((res) => res.data)

  if (!data?.current) throw new Error('Weather is unavailable right now')

  const currentTime = data.current.time
  const startIndex = data.hourly?.time?.indexOf(currentTime) ?? 0
  const hourly = (data.hourly?.time || [])
    .slice(Math.max(0, startIndex), Math.max(0, startIndex) + 6)
    .map((time, i) => ({
      time: new Date(time).getHours(),
      temp: Math.round(data.hourly.temperature_2m[Math.max(0, startIndex) + i]),
      code: data.hourly.weather_code[Math.max(0, startIndex) + i],
    }))

  return {
    current: {
      temp: Math.round(data.current.temperature_2m),
      feelsLike: Math.round(data.current.apparent_temperature),
      code: data.current.weather_code,
      wind: Math.round(data.current.wind_speed_10m),
      humidity: data.current.relative_humidity_2m,
    },
    hourly,
  }
}
