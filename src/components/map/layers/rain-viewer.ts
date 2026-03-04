import type { RasterSourceSpecification, RasterLayerSpecification } from 'maplibre-gl'

const RAINVIEWER_API = 'https://api.rainviewer.com/public/weather-maps.json'

export interface RadarFrame {
  time: number
  path: string
}

export interface RainViewerData {
  past: RadarFrame[]
  nowcast: RadarFrame[]
}

/**
 * Fetch available radar frames from RainViewer.
 * Returns past ~12 frames (2 hours) + ~3 nowcast frames.
 * No API key required.
 */
export async function fetchRadarFrames(): Promise<RainViewerData> {
  const res = await fetch(RAINVIEWER_API)
  if (!res.ok) throw new Error(`RainViewer API error: ${res.status}`)
  const data = await res.json()

  return {
    past: (data.radar?.past ?? []).map((f: { time: number; path: string }) => ({
      time: f.time,
      path: f.path,
    })),
    nowcast: (data.radar?.nowcast ?? []).map((f: { time: number; path: string }) => ({
      time: f.time,
      path: f.path,
    })),
  }
}

/**
 * Get MapLibre raster source config for a specific radar frame.
 * Color scheme 2 (universal blue), smooth rendering, snow display.
 */
export function getRadarSourceConfig(frame: RadarFrame): RasterSourceSpecification {
  return {
    type: 'raster',
    tiles: [`https://tilecache.rainviewer.com${frame.path}/256/{z}/{x}/{y}/2/1_1.png`],
    tileSize: 256,
    attribution: '&copy; <a href="https://rainviewer.com/">RainViewer</a>',
  }
}

export function getRadarLayerConfig(
  frameIndex: number,
  visible: boolean,
): RasterLayerSpecification {
  return {
    id: `radar-frame-${frameIndex}`,
    type: 'raster',
    source: `radar-frame-${frameIndex}`,
    paint: {
      'raster-opacity': visible ? 0.7 : 0,
      'raster-opacity-transition': { duration: 300, delay: 0 },
      'raster-fade-duration': 0,
    },
  }
}
