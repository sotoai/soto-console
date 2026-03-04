/**
 * Compute the day/night terminator as a GeoJSON polygon.
 * Returns the "night" hemisphere as a filled polygon.
 */

const DEG = Math.PI / 180
const RAD = 180 / Math.PI

function dayOfYear(d: Date): number {
  const start = new Date(d.getFullYear(), 0, 0)
  return Math.floor((d.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
}

export function computeTerminator(date: Date = new Date()): GeoJSON.Feature<GeoJSON.Polygon> {
  // Solar declination (approximate)
  const doy = dayOfYear(date)
  const declination = -23.45 * Math.cos((360 / 365) * (doy + 10) * DEG)
  const decRad = declination * DEG

  // Subsolar longitude from UTC time
  const hours = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600
  const subSolarLon = -15 * (hours - 12) // degrees

  // Trace the terminator line at 2° steps
  const terminatorPoints: [number, number][] = []
  for (let lon = -180; lon <= 180; lon += 2) {
    const lonRad = (lon - subSolarLon) * DEG
    const lat = Math.atan(-Math.cos(lonRad) / Math.tan(decRad)) * RAD
    terminatorPoints.push([lon, lat])
  }

  // Build the night polygon — wrap around the dark pole
  const darkPole = declination > 0 ? -90 : 90
  const ring: [number, number][] = [
    ...terminatorPoints,
    [180, darkPole],
    [-180, darkPole],
    terminatorPoints[0], // close the ring
  ]

  return {
    type: 'Feature',
    properties: { type: 'night' },
    geometry: {
      type: 'Polygon',
      coordinates: [ring],
    },
  }
}
