'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTheme } from 'next-themes'
import { Map, Source, Layer, Popup, type MapRef } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { MapLayerMouseEvent } from 'maplibre-gl'
import { Minimize2 } from 'lucide-react'
import { MapControls } from './MapControls'
import { getBaseStyle } from './map-styles'
import { computeTerminator } from './layers/daylight'
import {
  getWeatherSourceConfig,
  getWeatherLayerConfig,
  type WeatherLayerId,
} from './layers/weather-layers'
import { UFO_SOURCE_ID, getUfoHeatmapLayer, getUfoCircleLayer } from './layers/ufo-layer'

const WEATHER_IDS: WeatherLayerId[] = ['temp', 'wind', 'precipitation']
const OWM_KEY = process.env.NEXT_PUBLIC_OWM_API_KEY ?? ''

interface WorldMapProps {
  className?: string
  style?: React.CSSProperties
}

interface PopupData {
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
  // The map container DOM node is moved between the in-flow card placeholder
  // and a portal host div on document.body. This escapes all parent stacking
  // contexts (transform from SwipeablePages, backdropFilter from glass card)
  // so that fullscreen mode truly covers the entire viewport.
  const portalHostRef = useRef<HTMLDivElement | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const placeholderRef = useRef<HTMLDivElement>(null)

  // Create a persistent portal host on document.body
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

  // Move the map container DOM node between card and portal host
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

    // Trigger MapLibre resize after DOM move settles
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

  // ── Map style ──
  const mapStyle = useMemo(
    () => getBaseStyle(resolvedTheme, activeLayers.has('relief')),
    [resolvedTheme, activeLayers],
  )

  // ── UFO click handling (only in expanded mode) ──
  const handleMapClick = useCallback(
    (e: MapLayerMouseEvent) => {
      if (!activeLayers.has('ufo')) return
      const map = mapRef.current?.getMap()
      if (!map) return

      const features = map.queryRenderedFeatures(e.point, {
        layers: ['ufo-circles'],
      })

      if (features && features.length > 0) {
        const f = features[0]
        const geom = f.geometry as GeoJSON.Point
        setPopupInfo({
          lng: geom.coordinates[0],
          lat: geom.coordinates[1],
          properties: f.properties as Record<string, string>,
        })
      } else {
        setPopupInfo(null)
      }
    },
    [activeLayers],
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

  const heatmapLayer = useMemo(() => getUfoHeatmapLayer(), [])
  const circleLayer = useMemo(() => getUfoCircleLayer(), [])

  return (
    <>
      {/* Outer page container — always in flow */}
      <div className={className} style={style}>
        <div
          className="w-full h-full flex items-center justify-center"
          style={{ padding: 'var(--shell-padding-top) var(--shell-padding-x) 0.5rem' }}
        >
          {/* Glass card — always in card style, never goes fullscreen */}
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
            {/* Placeholder — map container lives here in card mode.
                When expanded, the map container DOM node is moved to portal host on body. */}
            <div ref={placeholderRef} className="w-full h-full">
              {/* Map container — this DOM node gets reparented */}
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
                    interactiveLayerIds={expanded && activeLayers.has('ufo') ? ['ufo-circles'] : []}
                    scrollZoom={expanded}
                    dragPan={expanded}
                    dragRotate={expanded}
                    touchZoomRotate={expanded}
                    touchPitch={expanded}
                    doubleClickZoom={expanded}
                    keyboard={expanded}
                  >
                    {ufoActive && ufoData && (
                      <Source id={UFO_SOURCE_ID} type="geojson" data={ufoData}>
                        <Layer {...heatmapLayer} />
                        <Layer {...circleLayer} />
                      </Source>
                    )}

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

                    {OWM_KEY &&
                      WEATHER_IDS.filter(id => activeLayers.has(id)).map(id => (
                        <Source key={id} id={`weather-${id}`} {...getWeatherSourceConfig(id, OWM_KEY)}>
                          <Layer {...getWeatherLayerConfig(id)} />
                        </Source>
                      ))}

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
                        <div className="p-1">
                          <p className="text-[12px] font-semibold mb-1">
                            {popupInfo.properties.city}, {popupInfo.properties.state}
                          </p>
                          <p className="text-[10px] opacity-70 mb-1">
                            {popupInfo.properties.date} &middot; {popupInfo.properties.shape} &middot;{' '}
                            {popupInfo.properties.duration}
                          </p>
                          <p className="text-[11px] leading-snug">{popupInfo.properties.summary}</p>
                        </div>
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

                {/* Controls + minimize (expanded mode only) */}
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
