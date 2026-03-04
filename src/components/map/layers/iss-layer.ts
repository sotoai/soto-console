export const ISS_API_URL = 'https://api.wheretheiss.at/v1/satellites/25544'

export interface ISSPosition {
  latitude: number
  longitude: number
  altitude: number
  velocity: number
  visibility: 'daylight' | 'eclipsed' | 'penumbra'
}

/**
 * Fetch the current ISS position from the Where The ISS At API.
 * Rate limit: ~1 request/second. We poll every 5s.
 */
export async function fetchISSPosition(): Promise<ISSPosition> {
  const res = await fetch(ISS_API_URL)
  if (!res.ok) throw new Error(`ISS API error: ${res.status}`)
  const data = await res.json()

  return {
    latitude: data.latitude,
    longitude: data.longitude,
    altitude: Math.round(data.altitude),
    velocity: Math.round(data.velocity),
    visibility: data.visibility ?? 'daylight',
  }
}
