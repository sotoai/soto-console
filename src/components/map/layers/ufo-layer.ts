import type { HeatmapLayerSpecification, CircleLayerSpecification } from 'maplibre-gl'

export const UFO_SOURCE_ID = 'ufo-sightings'

export function getUfoHeatmapLayer(): HeatmapLayerSpecification {
  return {
    id: 'ufo-heatmap',
    type: 'heatmap',
    source: UFO_SOURCE_ID,
    maxzoom: 9,
    paint: {
      'heatmap-weight': 1,
      'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 0.5, 6, 1],
      'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 15, 6, 25],
      'heatmap-color': [
        'interpolate',
        ['linear'],
        ['heatmap-density'],
        0, 'rgba(0,0,0,0)',
        0.2, 'rgba(0,255,136,0.4)',
        0.4, 'rgba(0,255,204,0.6)',
        0.6, 'rgba(0,230,118,0.8)',
        0.8, 'rgba(100,255,218,0.9)',
        1, 'rgba(255,255,255,1)',
      ],
      'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 6, 0.8, 8, 0],
    },
  }
}

export function getUfoCircleLayer(): CircleLayerSpecification {
  return {
    id: 'ufo-circles',
    type: 'circle',
    source: UFO_SOURCE_ID,
    minzoom: 6,
    paint: {
      'circle-color': '#00ff88',
      'circle-radius': ['interpolate', ['linear'], ['zoom'], 6, 2, 10, 6, 14, 10],
      'circle-opacity': ['interpolate', ['linear'], ['zoom'], 6, 0, 8, 0.7],
      'circle-stroke-color': '#ffffff',
      'circle-stroke-width': ['interpolate', ['linear'], ['zoom'], 6, 0, 8, 1],
      'circle-stroke-opacity': ['interpolate', ['linear'], ['zoom'], 6, 0, 8, 0.5],
    },
  }
}
