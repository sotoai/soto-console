import type { CircleLayerSpecification } from 'maplibre-gl'

export const FLIGHT_SOURCE_ID = 'flights'

/**
 * Fetch live flight data from airplanes.live for a given center + radius.
 * No API key required. Radius in nautical miles (max 250).
 */
export async function fetchFlights(
  lat: number,
  lng: number,
  radiusNm: number = 250,
): Promise<GeoJSON.FeatureCollection> {
  const url = `https://api.airplanes.live/v2/point/${lat}/${lng}/${Math.min(radiusNm, 250)}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Flights API error: ${res.status}`)
  const data = await res.json()

  const features: GeoJSON.Feature[] = (data.ac ?? [])
    .filter((ac: Record<string, unknown>) => ac.lat != null && ac.lon != null && !ac.ground)
    .map((ac: Record<string, unknown>) => ({
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: [ac.lon as number, ac.lat as number],
      },
      properties: {
        callsign: (ac.flight as string ?? '').trim() || 'N/A',
        altitude: ac.alt_baro ?? ac.alt_geom ?? 0,
        speed: Math.round(ac.gs as number ?? 0),
        heading: ac.track ?? 0,
        type: ac.t ?? '',
        registration: ac.r ?? '',
        squawk: ac.squawk ?? '',
      },
    }))

  return { type: 'FeatureCollection', features }
}

/**
 * Circle layer for flights. Color by altitude band.
 * Low altitude (< 10k ft) → cyan, medium → blue, high (> 30k ft) → indigo
 */
export function getFlightCircleLayer(): CircleLayerSpecification {
  return {
    id: 'flight-circles',
    type: 'circle',
    source: FLIGHT_SOURCE_ID,
    paint: {
      'circle-color': [
        'interpolate',
        ['linear'],
        ['get', 'altitude'],
        0, '#06b6d4',        // cyan — ground/low
        15000, '#3b82f6',    // blue — mid
        30000, '#6366f1',    // indigo — cruise
        45000, '#8b5cf6',    // violet — high
      ],
      'circle-radius': ['interpolate', ['linear'], ['zoom'], 2, 1.5, 6, 3, 10, 5],
      'circle-opacity': 0.85,
      'circle-stroke-color': '#ffffff',
      'circle-stroke-width': ['interpolate', ['linear'], ['zoom'], 2, 0, 6, 0.5, 10, 1],
      'circle-stroke-opacity': 0.5,
    },
  }
}
