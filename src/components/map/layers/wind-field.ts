/**
 * Wind data fetching and vector field interpolation.
 * Uses Open-Meteo API (free, no API key) for real wind data.
 */

export interface WindVector {
  u: number // east-west component (m/s, positive = eastward)
  v: number // north-south component (m/s, positive = northward)
  speed: number
}

interface GridPoint {
  lat: number
  lng: number
  u: number
  v: number
  speed: number
}

export interface WindField {
  gridPoints: GridPoint[]
  bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number }
  gridCols: number
  gridRows: number
  sample: (lat: number, lng: number) => WindVector
}

/**
 * Fetch wind data for a grid of points using Open-Meteo API.
 * Returns a WindField with bilinear interpolation.
 */
export async function fetchWindField(
  bounds: { north: number; south: number; east: number; west: number },
  gridSize: number = 6,
): Promise<WindField> {
  const latStep = (bounds.north - bounds.south) / (gridSize - 1)
  const lngStep = (bounds.east - bounds.west) / (gridSize - 1)

  // Build latitude and longitude arrays for the grid
  const lats: number[] = []
  const lngs: number[] = []
  for (let r = 0; r < gridSize; r++) {
    lats.push(bounds.south + r * latStep)
  }
  for (let c = 0; c < gridSize; c++) {
    lngs.push(bounds.west + c * lngStep)
  }

  // Open-Meteo supports comma-separated coordinates in a single request
  const latParams: number[] = []
  const lngParams: number[] = []
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      latParams.push(lats[r])
      lngParams.push(lngs[c])
    }
  }

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latParams.join(',')}&longitude=${lngParams.join(',')}&current=wind_speed_10m,wind_direction_10m`

  const res = await fetch(url)
  if (!res.ok) throw new Error(`Open-Meteo error: ${res.status}`)
  const data = await res.json()

  // Response is an array when multiple coordinates are requested
  const results = Array.isArray(data) ? data : [data]

  const gridPoints: GridPoint[] = []
  for (let i = 0; i < results.length; i++) {
    const r = Math.floor(i / gridSize)
    const c = i % gridSize
    const current = results[i]?.current
    const speed = current?.wind_speed_10m ?? 0
    const dirDeg = current?.wind_direction_10m ?? 0

    // Convert meteorological direction (where wind comes FROM) to u/v components
    const dirRad = (dirDeg * Math.PI) / 180
    const u = -speed * Math.sin(dirRad) // east component
    const v = -speed * Math.cos(dirRad) // north component

    gridPoints.push({
      lat: lats[r],
      lng: lngs[c],
      u,
      v,
      speed,
    })
  }

  const fieldBounds = {
    minLat: bounds.south,
    maxLat: bounds.north,
    minLng: bounds.west,
    maxLng: bounds.east,
  }

  return {
    gridPoints,
    bounds: fieldBounds,
    gridCols: gridSize,
    gridRows: gridSize,
    sample: createSampler(gridPoints, fieldBounds, gridSize),
  }
}

/**
 * Create a bilinear interpolation sampler for the wind field.
 */
function createSampler(
  points: GridPoint[],
  bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number },
  gridSize: number,
): (lat: number, lng: number) => WindVector {
  const { minLat, maxLat, minLng, maxLng } = bounds
  const latRange = maxLat - minLat
  const lngRange = maxLng - minLng

  return (lat: number, lng: number): WindVector => {
    // Normalize to grid coordinates
    const gx = ((lng - minLng) / lngRange) * (gridSize - 1)
    const gy = ((lat - minLat) / latRange) * (gridSize - 1)

    // Clamp to grid bounds
    const cx = Math.max(0, Math.min(gridSize - 2, Math.floor(gx)))
    const cy = Math.max(0, Math.min(gridSize - 2, Math.floor(gy)))

    const fx = gx - cx
    const fy = gy - cy

    // Get the four surrounding grid points
    const idx = (r: number, c: number) => r * gridSize + c
    const p00 = points[idx(cy, cx)]
    const p10 = points[idx(cy, cx + 1)]
    const p01 = points[idx(cy + 1, cx)]
    const p11 = points[idx(cy + 1, cx + 1)]

    if (!p00 || !p10 || !p01 || !p11) {
      return { u: 0, v: 0, speed: 0 }
    }

    // Bilinear interpolation
    const u =
      p00.u * (1 - fx) * (1 - fy) +
      p10.u * fx * (1 - fy) +
      p01.u * (1 - fx) * fy +
      p11.u * fx * fy

    const v =
      p00.v * (1 - fx) * (1 - fy) +
      p10.v * fx * (1 - fy) +
      p01.v * (1 - fx) * fy +
      p11.v * fx * fy

    const speed = Math.sqrt(u * u + v * v)

    return { u, v, speed }
  }
}

/**
 * Create a fallback wind field based on general atmospheric circulation patterns.
 * Used when API fetch fails.
 */
export function createFallbackWindField(
  bounds: { north: number; south: number; east: number; west: number },
): WindField {
  const gridSize = 6
  const latStep = (bounds.north - bounds.south) / (gridSize - 1)
  const lngStep = (bounds.east - bounds.west) / (gridSize - 1)

  const gridPoints: GridPoint[] = []

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      const lat = bounds.south + r * latStep
      const lng = bounds.west + c * lngStep

      // Simplified global circulation model
      const absLat = Math.abs(lat)
      let u: number, v: number

      if (absLat < 30) {
        // Trade winds — easterlies
        u = -4 - Math.random() * 2
        v = lat > 0 ? -1 : 1
      } else if (absLat < 60) {
        // Westerlies
        u = 5 + Math.random() * 3
        v = (Math.random() - 0.5) * 2
      } else {
        // Polar easterlies
        u = -3 - Math.random() * 2
        v = lat > 0 ? 1 : -1
      }

      // Add some noise for variation
      u += (Math.sin(lng * 0.1 + lat * 0.05) * 2)
      v += (Math.cos(lng * 0.08 + lat * 0.12) * 1.5)

      const speed = Math.sqrt(u * u + v * v)
      gridPoints.push({ lat, lng, u, v, speed })
    }
  }

  const fieldBounds = {
    minLat: bounds.south,
    maxLat: bounds.north,
    minLng: bounds.west,
    maxLng: bounds.east,
  }

  return {
    gridPoints,
    bounds: fieldBounds,
    gridCols: gridSize,
    gridRows: gridSize,
    sample: createSampler(gridPoints, fieldBounds, gridSize),
  }
}
