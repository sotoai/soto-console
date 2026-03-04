import type { RasterSourceSpecification, RasterLayerSpecification } from 'maplibre-gl'

/**
 * OWM tile layer IDs — only temp and clouds use OWM raster tiles.
 * Wind uses canvas particle overlay (WindOverlay.tsx).
 * Precipitation uses RainViewer animated radar (rain-viewer.ts).
 */
export type OWMTileLayerId = 'temp' | 'clouds'

/** All weather-related layer IDs including non-tile layers */
export type WeatherLayerId = 'temp' | 'wind' | 'precipitation' | 'clouds'

const OWM_TILE_LAYERS: Record<OWMTileLayerId, string> = {
  temp: 'temp_new',
  clouds: 'clouds_new',
}

export function getWeatherSourceConfig(
  layerId: OWMTileLayerId,
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

export function getWeatherLayerConfig(layerId: OWMTileLayerId): RasterLayerSpecification {
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

/** Which layer IDs still use OWM raster tiles */
export const OWM_TILE_IDS: OWMTileLayerId[] = ['temp', 'clouds']

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
