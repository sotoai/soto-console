import type { RasterSourceSpecification, RasterLayerSpecification } from 'maplibre-gl'

export type WeatherLayerId = 'temp' | 'wind' | 'precipitation' | 'clouds'

const OWM_TILE_LAYERS: Record<WeatherLayerId, string> = {
  temp: 'temp_new',
  wind: 'wind_new',
  precipitation: 'precipitation_new',
  clouds: 'clouds_new',
}

export const WEATHER_META: Record<WeatherLayerId, { label: string }> = {
  temp: { label: 'Temperature' },
  wind: { label: 'Wind' },
  precipitation: { label: 'Precipitation' },
  clouds: { label: 'Clouds' },
}

export function getWeatherSourceConfig(
  layerId: WeatherLayerId,
  apiKey: string,
): RasterSourceSpecification {
  const owmLayer = OWM_TILE_LAYERS[layerId]
  return {
    type: 'raster',
    tiles: [`https://tile.openweathermap.org/map/${owmLayer}/{z}/{x}/{y}.png?appid=${apiKey}`],
    tileSize: 256,
    attribution: '&copy; <a href="https://openweathermap.org/">OpenWeatherMap</a>',
  }
}

export function getWeatherLayerConfig(layerId: WeatherLayerId): RasterLayerSpecification {
  return {
    id: `weather-${layerId}`,
    type: 'raster',
    source: `weather-${layerId}`,
    paint: {
      'raster-opacity': layerId === 'clouds' ? 0.5 : 0.6,
      'raster-fade-duration': 300,
    },
  }
}

// ── Tap-to-inspect: OWM Current Weather API ──

export interface WeatherData {
  cityName: string
  description: string
  icon: string
  temp: number
  feelsLike: number
  humidity: number
  pressure: number
  windSpeed: number
  windDeg: number
  clouds: number
  visibility: number
}

export async function fetchCurrentWeather(
  lat: number,
  lng: number,
  apiKey: string,
): Promise<WeatherData> {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=imperial`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Weather API error: ${res.status}`)
  const data = await res.json()

  return {
    cityName: data.name || 'Unknown',
    description: data.weather?.[0]?.description ?? '',
    icon: data.weather?.[0]?.icon ?? '01d',
    temp: Math.round(data.main?.temp ?? 0),
    feelsLike: Math.round(data.main?.feels_like ?? 0),
    humidity: data.main?.humidity ?? 0,
    pressure: data.main?.pressure ?? 0,
    windSpeed: Math.round(data.wind?.speed ?? 0),
    windDeg: data.wind?.deg ?? 0,
    clouds: data.clouds?.all ?? 0,
    visibility: data.visibility ?? 10000,
  }
}
