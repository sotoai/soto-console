import type { HeatmapLayerSpecification, CircleLayerSpecification } from 'maplibre-gl'

export const EARTHQUAKE_SOURCE_ID = 'earthquakes'
export const EARTHQUAKE_FEED_URL =
  'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson'

/**
 * Heatmap layer for earthquakes (zoom 0–7).
 * Weight by magnitude so larger quakes create brighter hotspots.
 * Gradient: blue → yellow → red.
 */
export function getEarthquakeHeatmapLayer(): HeatmapLayerSpecification {
  return {
    id: 'earthquake-heatmap',
    type: 'heatmap',
    source: EARTHQUAKE_SOURCE_ID,
    maxzoom: 9,
    paint: {
      // Weight by magnitude (0–8 range typical)
      'heatmap-weight': [
        'interpolate',
        ['linear'],
        ['get', 'mag'],
        0, 0.1,
        3, 0.5,
        6, 1,
      ],
      'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 0.6, 6, 1.2],
      'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 12, 6, 22],
      'heatmap-color': [
        'interpolate',
        ['linear'],
        ['heatmap-density'],
        0, 'rgba(0,0,0,0)',
        0.15, 'rgba(0,100,255,0.3)',
        0.3, 'rgba(0,200,255,0.5)',
        0.5, 'rgba(255,255,0,0.7)',
        0.7, 'rgba(255,160,0,0.85)',
        1, 'rgba(255,40,0,1)',
      ],
      'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 6, 0.8, 8, 0],
    },
  }
}

/**
 * Circle layer for earthquakes (zoom 5+).
 * Radius and color interpolated by magnitude.
 */
export function getEarthquakeCircleLayer(): CircleLayerSpecification {
  return {
    id: 'earthquake-circles',
    type: 'circle',
    source: EARTHQUAKE_SOURCE_ID,
    minzoom: 5,
    paint: {
      // Color by magnitude: green → yellow → orange → red
      'circle-color': [
        'interpolate',
        ['linear'],
        ['get', 'mag'],
        1, '#22c55e',
        3, '#eab308',
        5, '#f97316',
        7, '#ef4444',
      ],
      // Radius by magnitude
      'circle-radius': [
        'interpolate',
        ['linear'],
        ['get', 'mag'],
        1, 3,
        3, 5,
        5, 9,
        7, 16,
      ],
      'circle-opacity': ['interpolate', ['linear'], ['zoom'], 5, 0, 7, 0.8],
      'circle-stroke-color': '#ffffff',
      'circle-stroke-width': ['interpolate', ['linear'], ['zoom'], 5, 0, 7, 1],
      'circle-stroke-opacity': ['interpolate', ['linear'], ['zoom'], 5, 0, 7, 0.6],
    },
  }
}
