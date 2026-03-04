'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTheme } from 'next-themes'
import { Map, Source, Layer, Popup, Marker, type MapRef } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { MapLayerMouseEvent } from 'maplibre-gl'
import { Minimize2 } from 'lucide-react'
import { MapControls } from './MapControls'
import { MapLegend } from './MapLegend'
import { WeatherPopup } from './WeatherPopup'
import { getBaseStyle } from './map-styles'
import { computeTerminator } from './layers/daylight'
import {
  getWeatherSourceConfig,
  getWeatherLayerConfig,
  fetchCurrentWeather,
  type WeatherLayerId,
  type WeatherData,
} from './layers/weather-layers'
import { UFO_SOURCE_ID, getUfoHeatmapLayer, getUfoCircleLayer } from './layers/ufo-layer'
import {
  EARTHQUAKE_SOURCE_ID,
  EARTHQUAKE_FEED_URL,
  getEarthquakeHeatmapLayer,
  getEarthquakeCircleLayer,
} from './layers/earthquake-layer'
import { fetchISSPosition, type ISSPosition } from './layers/iss-layer'
import { FLIGHT_SOURCE_ID, fetchFlights, getFlightCircleLayer } from './layers/flight-layer'

const WEATHER_IDS: WeatherLayerId[] = ['temp', 'wind', 'precipitation', 'clouds']
const OWM_KEY = process.env.NEXT_PUBLIC_OWM_API_KEY ?? ''

interface WorldMapProps {
  className?: string
  style?: React.CSSProperties
}

type PopupType = 'ufo' | 'earthquake' | 'weather' | 'flight'

interface PopupData {
  type: PopupType
  lng: number
  lat: number
  properties: Record<string, string>
}

export function WorldMap({ className, style }: WorldMapProps) {
  const { resolvedTheme } = useTheme()
  const mapRef = useRef<MapRef>(null)

  const [mounted, setMounted] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [activeLayers, setActiveLayers] = useState<Set<string>>(new Set())
  const [ufoData, setUfoData] = useState<GeoJSON.FeatureCollection | null>(null)
  const [terminatorGeoJson, setTerminatorGeoJson] = useState<GeoJSON.Feature>(() =>
    computeTerminator(),
  )
  const [popupInfo, setPopupInfo] = useState<PopupData | null>(null)

  // New layer state
  const [earthquakeData, setEarthquakeData] = useState<GeoJSON.FeatureCollection | null>(null)
  const [issPosition, setIssPosition] = useState<ISSPosition | null>(null)
  const [flightData, setFlightData] = useState<GeoJSON.FeatureCollection | null>(null)
  const [weatherInspect, setWeatherInspect] = useState<{
    lng: number
    lat: number
    data: WeatherData | null
    loading: boolean
  } | null>(null)

  useEffect(() => setMounted(true), [])

  // Escape key to collapse
  useEffect(() => {
    if (!expanded) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExpanded(false)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [expanded])

  // ── DOM reparenting for fullscreen ──
  const portalHostRef = useRef<HTMLDivElement | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const placeholderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mounted) return
    if (!portalHostRef.current) {
      const div = document.createElement('div')
      div.id = 'map-fullscreen-host'
      div.style.cssText =
        'position:fixed;inset:0;z-index:9999;display:none;background:#000;'
      document.body.appendChild(div)
      portalHostRef.current = div
    }
    return () => {
      if (portalHostRef.current) {
        document.body.removeChild(portalHostRef.current)
        portalHostRef.current = null
      }
    }
  }, [mounted])

  useEffect(() => {
    if (!mounted || !mapContainerRef.current || !portalHostRef.current || !placeholderRef.current)
      return
    const mapNode = mapContainerRef.current
    const portalHost = portalHostRef.current
    const placeholder = placeholderRef.current

    if (expanded) {
      portalHost.appendChild(mapNode)
      portalHost.style.display = 'block'
      document.body.style.overflow = 'hidden'
    } else {
      placeholder.appendChild(mapNode)
      portalHost.style.display = 'none'
      document.body.style.overflow = ''
    }
    setTimeout(() => {
      mapRef.current?.getMap()?.resize()
    }, 50)
  }, [expanded, mounted])

  // ── Layer toggle ──
  const handleToggle = useCallback((layerId: string) => {
    setActiveLayers(prev => {
      const next = new Set(prev)
      if (next.has(layerId)) {
        next.delete(layerId)
      } else {
        next.add(layerId)
      }
      return next
    })
    setPopupInfo(null)
    setWeatherInspect(null)
  }, [])

  // ── Lazy-load UFO data ──
  const ufoActive = activeLayers.has('ufo')
  useEffect(() => {
    if (!ufoActive || ufoData) return
    fetch('/data/ufo-sightings.geojson')
      .then(r => r.json())
      .then(setUfoData)
      .catch(console.error)
  }, [ufoActive, ufoData])

  // ── Daylight terminator updates ──
  const daylightActive = activeLayers.has('daylight')
  useEffect(() => {
    if (!daylightActive) return
    setTerminatorGeoJson(computeTerminator())
    const timer = setInterval(() => {
      setTerminatorGeoJson(computeTerminator())
    }, 60_000)
    return () => clearInterval(timer)
  }, [daylightActive])

  // ── Earthquake data: fetch on toggle, refresh every 5 min ──
  const earthquakeActive = activeLayers.has('earthquake')
  useEffect(() => {
    if (!earthquakeActive) return
    const load = () => {
      fetch(EARTHQUAKE_FEED_URL)
        .then(r => r.json())
        .then(setEarthquakeData)
        .catch(console.error)
    }
    load()
    const timer = setInterval(load, 5 * 60_000)
    return () => clearInterval(timer)
  }, [earthquakeActive])

  // ── ISS position: poll every 5s ──
  const issActive = activeLayers.has('iss')
  useEffect(() => {
    if (!issActive) return
    let cancelled = false
    const poll = () => {
      fetchISSPosition()
        .then(pos => {
          if (!cancelled) setIssPosition(pos)
        })
        .catch(console.error)
    }
    poll()
    const timer = setInterval(poll, 5_000)
    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [issActive])

  // ── Flight data: fetch on toggle, refresh every 10s based on map center ──
  const flightsActive = activeLayers.has('flights')
  useEffect(() => {
    if (!flightsActive) return
    let cancelled = false
    const load = () => {
      const map = mapRef.current?.getMap()
      const center = map?.getCenter() ?? { lat: 39, lng: -98 }
      fetchFlights(center.lat, center.lng, 250)
        .then(data => {
          if (!cancelled) setFlightData(data)
        })
        .catch(console.error)
    }
    load()
    const timer = setInterval(load, 10_000)
    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [flightsActive])

  // ── Map style ──
  const mapStyle = useMemo(
    () => getBaseStyle(resolvedTheme, activeLayers.has('relief')),
    [resolvedTheme, activeLayers],
  )

  // ── Determine which layers have clickable circles ──
  const interactiveLayerIds = useMemo(() => {
    if (!expanded) return []
    const ids: string[] = []
    if (activeLayers.has('ufo')) ids.push('ufo-circles')
    if (activeLayers.has('earthquake')) ids.push('earthquake-circles')
    if (activeLayers.has('flights')) ids.push('flight-circles')
    return ids
  }, [expanded, activeLayers])

  // Check if any weather layer is active (for tap-to-inspect)
  const anyWeatherActive = useMemo(
    () => WEATHER_IDS.some(id => activeLayers.has(id)),
    [activeLayers],
  )

  // ── Click handler: UFO → Earthquake → Flights → Weather inspect ──
  const handleMapClick = useCallback(
    (e: MapLayerMouseEvent) => {
      const map = mapRef.current?.getMap()
      if (!map) return

      // 1. Check UFO circles
      if (activeLayers.has('ufo')) {
        const features = map.queryRenderedFeatures(e.point, { layers: ['ufo-circles'] })
        if (features && features.length > 0) {
          const f = features[0]
          const geom = f.geometry as GeoJSON.Point
          setPopupInfo({
            type: 'ufo',
            lng: geom.coordinates[0],
            lat: geom.coordinates[1],
            properties: f.properties as Record<string, string>,
          })
          setWeatherInspect(null)
          return
        }
      }

      // 2. Check earthquake circles
      if (activeLayers.has('earthquake')) {
        const features = map.queryRenderedFeatures(e.point, { layers: ['earthquake-circles'] })
        if (features && features.length > 0) {
          const f = features[0]
          const geom = f.geometry as GeoJSON.Point
          setPopupInfo({
            type: 'earthquake',
            lng: geom.coordinates[0],
            lat: geom.coordinates[1],
            properties: f.properties as Record<string, string>,
          })
          setWeatherInspect(null)
          return
        }
      }

      // 3. Check flight circles
      if (activeLayers.has('flights')) {
        const features = map.queryRenderedFeatures(e.point, { layers: ['flight-circles'] })
        if (features && features.length > 0) {
          const f = features[0]
          const geom = f.geometry as GeoJSON.Point
          setPopupInfo({
            type: 'flight',
            lng: geom.coordinates[0],
            lat: geom.coordinates[1],
            properties: f.properties as Record<string, string>,
          })
          setWeatherInspect(null)
          return
        }
      }

      // 4. Weather tap-to-inspect (fallback if no feature clicked)
      if (anyWeatherActive && OWM_KEY) {
        setPopupInfo(null)
        const { lng, lat } = e.lngLat
        setWeatherInspect({ lng, lat, data: null, loading: true })
        fetchCurrentWeather(lat, lng, OWM_KEY)
          .then(data => {
            setWeatherInspect(prev =>
              prev && prev.lng === lng && prev.lat === lat
                ? { ...prev, data, loading: false }
                : prev,
            )
          })
          .catch(() => {
            setWeatherInspect(null)
          })
        return
      }

      // No match — close popups
      setPopupInfo(null)
      setWeatherInspect(null)
    },
    [activeLayers, anyWeatherActive],
  )

  const handleMouseEnter = useCallback(() => {
    if (!expanded) return
    const canvas = mapRef.current?.getMap()?.getCanvas()
    if (canvas) canvas.style.cursor = 'pointer'
  }, [expanded])

  const handleMouseLeave = useCallback(() => {
    const canvas = mapRef.current?.getMap()?.getCanvas()
    if (canvas) canvas.style.cursor = ''
  }, [])

  // ── Memoized layer specs ──
  const ufoHeatmapLayer = useMemo(() => getUfoHeatmapLayer(), [])
  const ufoCircleLayer = useMemo(() => getUfoCircleLayer(), [])
  const earthquakeHeatmapLayer = useMemo(() => getEarthquakeHeatmapLayer(), [])
  const earthquakeCircleLayer = useMemo(() => getEarthquakeCircleLayer(), [])
  const flightCircleLayer = useMemo(() => getFlightCircleLayer(), [])

  // ── Render popup content based on type ──
  const renderPopupContent = useCallback((info: PopupData) => {
    switch (info.type) {
      case 'ufo':
        return (
          <div className="p-1">
            <p className="text-[12px] font-semibold mb-1">
              {info.properties.city}, {info.properties.state}
            </p>
            <p className="text-[10px] opacity-70 mb-1">
              {info.properties.date} &middot; {info.properties.shape} &middot;{' '}
              {info.properties.duration}
            </p>
            <p className="text-[11px] leading-snug">{info.properties.summary}</p>
          </div>
        )
      case 'earthquake': {
        const mag = parseFloat(info.properties.mag) || 0
        const time = info.properties.time
          ? new Date(parseInt(info.properties.time)).toLocaleString()
          : ''
        return (
          <div className="p-1">
            <p className="text-[12px] font-semibold mb-1">
              M{mag.toFixed(1)} Earthquake
            </p>
            <p className="text-[10px] opacity-70 mb-1">{info.properties.place}</p>
            {time && (
              <p className="text-[10px] opacity-70">{time}</p>
            )}
            {info.properties.tsunami === '1' && (
              <p className="text-[10px] font-semibold text-yellow-500 mt-1">Tsunami area</p>
            )}
          </div>
        )
      }
      case 'flight':
        return (
          <div className="p-1">
            <p className="text-[12px] font-semibold mb-1">
              {info.properties.callsign}
            </p>
            {info.properties.type && (
              <p className="text-[10px] opacity-70 mb-0.5">
                {info.properties.type}
                {info.properties.registration ? ` (${info.properties.registration})` : ''}
              </p>
            )}
            <p className="text-[10px] opacity-70">
              {Number(info.properties.altitude).toLocaleString()} ft &middot;{' '}
              {info.properties.speed} kts
            </p>
          </div>
        )
      default:
        return null
    }
  }, [])

  return (
    <>
      {/* Outer page container — always in flow */}
      <div className={className} style={style}>
        <div
          className="w-full h-full flex items-center justify-center"
          style={{ padding: 'var(--shell-padding-top) var(--shell-padding-x) 0.5rem' }}
        >
          {/* Glass card */}
          <div
            className="animate-fade-in"
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '64rem',
              height: '100%',
              overflow: 'hidden',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--wallpaper-card-bg)',
              border: '0.5px solid var(--wallpaper-card-border)',
              boxShadow: 'var(--wallpaper-card-shadow)',
              backdropFilter: 'blur(40px) saturate(180%)',
              WebkitBackdropFilter: 'blur(40px) saturate(180%)',
            }}
          >
            <div ref={placeholderRef} className="w-full h-full">
              <div ref={mapContainerRef} className="w-full h-full relative">
                {mounted && (
                  <Map
                    ref={mapRef}
                    mapStyle={mapStyle}
                    initialViewState={{
                      longitude: -98,
                      latitude: 39,
                      zoom: 3,
                    }}
                    attributionControl={false}
                    style={{ width: '100%', height: '100%' }}
                    onClick={handleMapClick}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    interactiveLayerIds={interactiveLayerIds}
                    scrollZoom={expanded}
                    dragPan={expanded}
                    dragRotate={expanded}
                    touchZoomRotate={expanded}
                    touchPitch={expanded}
                    doubleClickZoom={expanded}
                    keyboard={expanded}
                  >
                    {/* UFO layers */}
                    {ufoActive && ufoData && (
                      <Source id={UFO_SOURCE_ID} type="geojson" data={ufoData}>
                        <Layer {...ufoHeatmapLayer} />
                        <Layer {...ufoCircleLayer} />
                      </Source>
                    )}

                    {/* Earthquake layers */}
                    {earthquakeActive && earthquakeData && (
                      <Source id={EARTHQUAKE_SOURCE_ID} type="geojson" data={earthquakeData}>
                        <Layer {...earthquakeHeatmapLayer} />
                        <Layer {...earthquakeCircleLayer} />
                      </Source>
                    )}

                    {/* Flight layer */}
                    {flightsActive && flightData && (
                      <Source id={FLIGHT_SOURCE_ID} type="geojson" data={flightData}>
                        <Layer {...flightCircleLayer} />
                      </Source>
                    )}

                    {/* Daylight terminator */}
                    {daylightActive && (
                      <Source id="daylight-terminator" type="geojson" data={terminatorGeoJson}>
                        <Layer
                          id="terminator-fill"
                          type="fill"
                          source="daylight-terminator"
                          paint={{ 'fill-color': '#000000', 'fill-opacity': 0.3 }}
                        />
                        <Layer
                          id="terminator-line"
                          type="line"
                          source="daylight-terminator"
                          paint={{ 'line-color': '#ff990040', 'line-width': 1.5 }}
                        />
                      </Source>
                    )}

                    {/* Weather tile layers */}
                    {OWM_KEY &&
                      WEATHER_IDS.filter(id => activeLayers.has(id)).map(id => (
                        <Source key={id} id={`weather-${id}`} {...getWeatherSourceConfig(id, OWM_KEY)}>
                          <Layer {...getWeatherLayerConfig(id)} />
                        </Source>
                      ))}

                    {/* ISS Marker */}
                    {issActive && issPosition && (
                      <Marker
                        longitude={issPosition.longitude}
                        latitude={issPosition.latitude}
                        anchor="center"
                      >
                        <div className="relative flex items-center justify-center">
                          {/* Pulsing ring */}
                          <div
                            className="absolute w-8 h-8 rounded-full animate-ping"
                            style={{
                              background: 'rgba(99, 102, 241, 0.3)',
                              animationDuration: '2s',
                            }}
                          />
                          {/* Core dot */}
                          <div
                            className="w-4 h-4 rounded-full border-2 border-white z-10"
                            style={{
                              background: '#6366f1',
                              boxShadow: '0 0 12px rgba(99, 102, 241, 0.6)',
                            }}
                          />
                          {/* Label */}
                          <div
                            className="absolute top-full mt-1 whitespace-nowrap px-1.5 py-0.5 rounded text-[9px] font-bold"
                            style={{
                              background: 'rgba(0,0,0,0.7)',
                              color: '#fff',
                            }}
                          >
                            ISS · {issPosition.altitude} km · {Math.round(issPosition.velocity / 1000)}k km/h
                          </div>
                        </div>
                      </Marker>
                    )}

                    {/* Feature popup (UFO / Earthquake / Flight) */}
                    {popupInfo && (
                      <Popup
                        longitude={popupInfo.lng}
                        latitude={popupInfo.lat}
                        onClose={() => setPopupInfo(null)}
                        closeButton={true}
                        closeOnClick={false}
                        maxWidth="260px"
                        offset={12}
                      >
                        {renderPopupContent(popupInfo)}
                      </Popup>
                    )}

                    {/* Weather inspect popup */}
                    {weatherInspect && (
                      <Popup
                        longitude={weatherInspect.lng}
                        latitude={weatherInspect.lat}
                        onClose={() => setWeatherInspect(null)}
                        closeButton={true}
                        closeOnClick={false}
                        maxWidth="280px"
                        offset={12}
                      >
                        <WeatherPopup
                          data={weatherInspect.data}
                          loading={weatherInspect.loading}
                        />
                      </Popup>
                    )}
                  </Map>
                )}

                {/* Tap-to-expand overlay (card mode only) */}
                <AnimatePresence>
                  {!expanded && (
                    <motion.button
                      onClick={() => setExpanded(true)}
                      className="absolute inset-0 z-10 cursor-pointer"
                      aria-label="Expand map"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <div
                        className="absolute bottom-3 right-3 w-8 h-8 flex items-center justify-center rounded-lg"
                        style={{
                          background: 'var(--wallpaper-card-bg)',
                          border: '0.5px solid var(--wallpaper-card-border)',
                          backdropFilter: 'blur(20px)',
                          WebkitBackdropFilter: 'blur(20px)',
                        }}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 14 14"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          className="text-[var(--wp-text-secondary)]"
                        >
                          <path d="M1 5V1h4M9 1h4v4M13 9v4H9M5 13H1V9" />
                        </svg>
                      </div>
                    </motion.button>
                  )}
                </AnimatePresence>

                {/* Controls + Legend + minimize (expanded mode only) */}
                <AnimatePresence>
                  {expanded && (
                    <motion.div
                      className="absolute inset-0 z-10 pointer-events-none"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {/* Controls panel */}
                      <div className="pointer-events-auto">
                        <MapControls
                          activeLayers={activeLayers}
                          onToggle={handleToggle}
                          weatherAvailable={!!OWM_KEY}
                        />
                      </div>

                      {/* Legend panel */}
                      <div className="pointer-events-auto">
                        <MapLegend activeLayers={activeLayers} />
                      </div>

                      {/* Minimize button */}
                      <button
                        onClick={() => setExpanded(false)}
                        className="pointer-events-auto absolute top-3 right-3 w-10 h-10 flex items-center justify-center rounded-xl cursor-pointer transition-all duration-150 active:scale-95"
                        style={{
                          background: 'var(--wallpaper-card-bg)',
                          border: '0.5px solid var(--wallpaper-card-border)',
                          boxShadow: 'var(--wallpaper-card-shadow)',
                          backdropFilter: 'blur(40px)',
                          WebkitBackdropFilter: 'blur(40px)',
                        }}
                        title="Minimize map (Esc)"
                      >
                        <Minimize2 size={16} className="text-[var(--wp-text-secondary)]" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MapLibre popup style overrides */}
      <style jsx global>{`
        .maplibregl-popup-content {
          background: var(--wallpaper-card-bg) !important;
          backdrop-filter: blur(40px) saturate(180%);
          -webkit-backdrop-filter: blur(40px) saturate(180%);
          border: 0.5px solid var(--wallpaper-card-border);
          border-radius: var(--radius-md) !important;
          color: var(--wp-text);
          font-family: var(--font-sans);
          box-shadow: var(--wallpaper-card-shadow) !important;
          padding: 8px 10px !important;
        }
        .maplibregl-popup-close-button {
          color: var(--wp-text-secondary);
          font-size: 18px;
          padding: 2px 6px;
        }
        .maplibregl-popup-tip {
          border-top-color: var(--wallpaper-card-bg) !important;
        }
      `}</style>
    </>
  )
}
