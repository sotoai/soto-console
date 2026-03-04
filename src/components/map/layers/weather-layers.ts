import type { RasterSourceSpecification, RasterLayerSpecification } from 'maplibre-gl'

export type WeatherLayerId = 'temp' | 'wind' | 'precipitation'

const OWM_TILE_LAYERS: Record<WeatherLayerId, string> = {
  temp: 'temp_new',
  wind: 'wind_new',
  precipitation: 'precipitation_new',
}

export const WEATHER_META: Record<WeatherLayerId, { label: string }> = {
  temp: { label: 'Temperature' },
  wind: { label: 'Wind' },
  precipitation: { label: 'Precipitation' },
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
      'raster-opacity': 0.6,
      'raster-fade-duration': 300,
    },
  }
}
