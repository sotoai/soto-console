import type { StyleSpecification } from 'maplibre-gl'

const DARK_TILES = 'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png'
const LIGHT_TILES = 'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png'
const TERRAIN_TILES = 'https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}@2x.png'

function makeStyle(tileUrl: string, attribution: string): StyleSpecification {
  return {
    version: 8,
    sources: {
      basemap: {
        type: 'raster',
        tiles: [tileUrl],
        tileSize: 256,
        attribution,
      },
    },
    layers: [
      {
        id: 'basemap',
        type: 'raster',
        source: 'basemap',
        minzoom: 0,
        maxzoom: 19,
      },
    ],
  }
}

const DARK_STYLE = makeStyle(
  DARK_TILES,
  '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
)

const LIGHT_STYLE = makeStyle(
  LIGHT_TILES,
  '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
)

const TERRAIN_STYLE = makeStyle(
  TERRAIN_TILES,
  '&copy; <a href="https://stadiamaps.com/">Stadia</a> &copy; <a href="https://stamen.com/">Stamen</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
)

/** Pick the correct basemap style for the current theme and relief toggle. */
export function getBaseStyle(theme: string | undefined, reliefOn: boolean): StyleSpecification {
  if (reliefOn) return TERRAIN_STYLE
  return theme === 'dark' ? DARK_STYLE : LIGHT_STYLE
}
