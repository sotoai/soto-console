'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useTheme } from 'next-themes'
import { Map, Source, Layer, Popup, type MapRef } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { MapLayerMouseEvent } from 'maplibre-gl'
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
  const [activeLayers, setActiveLayers] = useState<Set<string>>(new Set())
  const [ufoData, setUfoData] = useState<GeoJSON.FeatureCollection | null>(null)
  const [terminatorGeoJson, setTerminatorGeoJson] = useState<GeoJSON.Feature>(() =>
    computeTerminator(),
  )
  const [popupInfo, setPopupInfo] = useState<PopupData | null>(null)

  // Prevent SSR rendering of WebGL canvas
  useEffect(() => setMounted(true), [])

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
    // Close popup when toggling layers
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

  // ── Map style (reactive to theme + relief toggle) ──
  const mapStyle = useMemo(
    () => getBaseStyle(resolvedTheme, activeLayers.has('relief')),
    [resolvedTheme, activeLayers],
  )

  // ── UFO click handling ──
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

  // ── Cursor style for clickable UFO points ──
  const handleMouseEnter = useCallback(() => {
    const canvas = mapRef.current?.getMap()?.getCanvas()
    if (canvas) canvas.style.cursor = 'pointer'
  }, [])

  const handleMouseLeave = useCallback(() => {
    const canvas = mapRef.current?.getMap()?.getCanvas()
    if (canvas) canvas.style.cursor = ''
  }, [])

  // Heatmap + circle layer configs (stable refs)
  const heatmapLayer = useMemo(() => getUfoHeatmapLayer(), [])
  const circleLayer = useMemo(() => getUfoCircleLayer(), [])

  return (
    <div className={className} style={{ ...style, position: 'relative', overflow: 'hidden' }}>
      {!mounted ? (
        <div className="w-full h-full bg-[var(--wallpaper-card-bg)] animate-scale-in" />
      ) : (
        <>
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
            interactiveLayerIds={activeLayers.has('ufo') ? ['ufo-circles'] : []}
          >
            {/* ── UFO layers ── */}
            {ufoActive && ufoData && (
              <Source id={UFO_SOURCE_ID} type="geojson" data={ufoData}>
                <Layer {...heatmapLayer} />
                <Layer {...circleLayer} />
              </Source>
            )}

            {/* ── Daylight terminator ── */}
            {daylightActive && (
              <Source id="daylight-terminator" type="geojson" data={terminatorGeoJson}>
                <Layer
                  id="terminator-fill"
                  type="fill"
                  source="daylight-terminator"
                  paint={{
                    'fill-color': '#000000',
                    'fill-opacity': 0.3,
                  }}
                />
                <Layer
                  id="terminator-line"
                  type="line"
                  source="daylight-terminator"
                  paint={{
                    'line-color': '#ff990040',
                    'line-width': 1.5,
                  }}
                />
              </Source>
            )}

            {/* ── Weather tile layers ── */}
            {OWM_KEY &&
              WEATHER_IDS.filter(id => activeLayers.has(id)).map(id => (
                <Source key={id} id={`weather-${id}`} {...getWeatherSourceConfig(id, OWM_KEY)}>
                  <Layer {...getWeatherLayerConfig(id)} />
                </Source>
              ))}

            {/* ── UFO popup ── */}
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

          {/* ── Floating controls ── */}
          <MapControls
            activeLayers={activeLayers}
            onToggle={handleToggle}
            weatherAvailable={!!OWM_KEY}
          />
        </>
      )}

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
    </div>
  )
}
