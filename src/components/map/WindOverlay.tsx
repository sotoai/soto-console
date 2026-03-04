'use client'

import { useEffect, useRef, useCallback } from 'react'
import type { MapRef } from 'react-map-gl/maplibre'
import {
  fetchWindField,
  createFallbackWindField,
  type WindField,
} from './layers/wind-field'

const BASE_PARTICLE_COUNT = 2500
const PARTICLE_MAX_AGE = 120 // frames
const SPEED_FACTOR = 0.15 // controls how fast particles move
const BASE_TRAIL_FADE = 0.93 // higher = longer trails (0–1)
const LINE_WIDTH = 1.2

/** Scale particle count down at high zoom so the screen isn't overwhelmed */
function getParticleCount(zoom: number): number {
  if (zoom <= 4) return BASE_PARTICLE_COUNT
  // Reduce by ~40% per zoom level above 4, floor at 200
  return Math.max(200, Math.round(BASE_PARTICLE_COUNT * Math.pow(0.6, zoom - 4)))
}

/** Trail fade shortens at high zoom so trails don't pile up */
function getTrailFade(zoom: number): number {
  if (zoom <= 4) return BASE_TRAIL_FADE
  // Faster fade at high zoom
  return Math.max(0.8, BASE_TRAIL_FADE - (zoom - 4) * 0.02)
}

/** Particle opacity dims at high zoom */
function getOpacityScale(zoom: number): number {
  if (zoom <= 5) return 1
  return Math.max(0.3, 1 - (zoom - 5) * 0.1)
}

interface Particle {
  x: number
  y: number
  prevX: number
  prevY: number
  age: number
  maxAge: number
}

interface WindOverlayProps {
  mapRef: React.RefObject<MapRef | null>
  active: boolean
  resolvedTheme?: string
}

export function WindOverlay({ mapRef, active, resolvedTheme }: WindOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const windFieldRef = useRef<WindField | null>(null)
  const particlesRef = useRef<Particle[]>([])
  const animFrameRef = useRef<number>(0)
  const fadeCanvasRef = useRef<HTMLCanvasElement | null>(null)

  const isDark = resolvedTheme === 'dark'

  // Reset a particle to a random position
  const resetParticle = useCallback((p: Particle, w: number, h: number) => {
    p.x = Math.random() * w
    p.y = Math.random() * h
    p.prevX = p.x
    p.prevY = p.y
    p.age = Math.floor(Math.random() * PARTICLE_MAX_AGE)
    p.maxAge = PARTICLE_MAX_AGE + Math.floor(Math.random() * 40 - 20)
  }, [])

  // Fetch wind data for current viewport
  const loadWindData = useCallback(async () => {
    const map = mapRef.current?.getMap()
    if (!map) return

    const bounds = map.getBounds()
    const viewBounds = {
      north: bounds.getNorth(),
      south: bounds.getSouth(),
      east: bounds.getEast(),
      west: bounds.getWest(),
    }

    try {
      windFieldRef.current = await fetchWindField(viewBounds, 6)
    } catch {
      // Fallback to modeled circulation
      windFieldRef.current = createFallbackWindField(viewBounds)
    }
  }, [mapRef])

  useEffect(() => {
    if (!active) {
      // Clean up when deactivated
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
      windFieldRef.current = null
      particlesRef.current = []
      // Clear canvas
      const ctx = canvasRef.current?.getContext('2d')
      if (ctx) ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
      return
    }

    const canvas = canvasRef.current
    const map = mapRef.current?.getMap()
    if (!canvas || !map) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Create offscreen canvas for trail fading
    if (!fadeCanvasRef.current) {
      fadeCanvasRef.current = document.createElement('canvas')
    }
    const fadeCanvas = fadeCanvasRef.current

    // Resize handler
    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect()
      if (!rect) return
      const dpr = window.devicePixelRatio || 1
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
      ctx.scale(dpr, dpr)
      fadeCanvas.width = canvas.width
      fadeCanvas.height = canvas.height

      // Reinitialize particles (count based on zoom)
      const w = rect.width
      const h = rect.height
      const zoom = map.getZoom()
      const count = getParticleCount(zoom)
      particlesRef.current = Array.from({ length: count }, () => {
        const p: Particle = { x: 0, y: 0, prevX: 0, prevY: 0, age: 0, maxAge: PARTICLE_MAX_AGE }
        resetParticle(p, w, h)
        return p
      })
    }
    resize()

    // Load initial wind data
    loadWindData()

    // Reload wind data on map move + adjust particle count for zoom
    const handleMoveEnd = () => {
      loadWindData()
      const rect = canvas.parentElement?.getBoundingClientRect()
      if (rect) {
        const zoom = map.getZoom()
        const targetCount = getParticleCount(zoom)
        const current = particlesRef.current

        if (current.length > targetCount) {
          // Trim particles
          particlesRef.current = current.slice(0, targetCount)
        } else if (current.length < targetCount) {
          // Add particles
          const toAdd = targetCount - current.length
          for (let i = 0; i < toAdd; i++) {
            const p: Particle = { x: 0, y: 0, prevX: 0, prevY: 0, age: 0, maxAge: PARTICLE_MAX_AGE }
            resetParticle(p, rect.width, rect.height)
            current.push(p)
          }
        }
        // Reset positions
        particlesRef.current.forEach(p => resetParticle(p, rect.width, rect.height))
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
    map.on('moveend', handleMoveEnd)
    map.on('resize', resize)

    // Animation loop
    const animate = () => {
      const windField = windFieldRef.current
      if (!windField || !canvas.parentElement) {
        animFrameRef.current = requestAnimationFrame(animate)
        return
      }

      const rect = canvas.parentElement.getBoundingClientRect()
      const w = rect.width
      const h = rect.height
      const dpr = window.devicePixelRatio || 1
      const zoom = map.getZoom()
      const trailFade = getTrailFade(zoom)
      const opacityScale = getOpacityScale(zoom)

      // Fade existing trails by drawing semi-transparent rect
      const fadeCtx = fadeCanvas.getContext('2d')
      if (fadeCtx) {
        fadeCtx.clearRect(0, 0, fadeCanvas.width, fadeCanvas.height)
        fadeCtx.globalAlpha = trailFade
        fadeCtx.drawImage(canvas, 0, 0)
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.save()
        ctx.setTransform(1, 0, 0, 1, 0, 0) // reset transform for raw pixel copy
        ctx.drawImage(fadeCanvas, 0, 0)
        ctx.restore()
      }

      // Draw and update particles
      const particles = particlesRef.current
      ctx.lineWidth = LINE_WIDTH
      ctx.lineCap = 'round'

      for (const p of particles) {
        // Convert screen position to geo coordinates
        const lngLat = map.unproject([p.x, p.y])
        const wind = windField.sample(lngLat.lat, lngLat.lng)

        // Move particle based on wind vector
        // Scale by speed factor and zoom level (capped so high zoom doesn't overwhelm)
        const scale = SPEED_FACTOR * Math.min(Math.pow(2, zoom - 3), 4) * 0.3
        p.prevX = p.x
        p.prevY = p.y
        p.x += wind.u * scale
        p.y -= wind.v * scale // screen Y is inverted
        p.age++

        // Reset if out of bounds or too old
        if (p.age > p.maxAge || p.x < -10 || p.x > w + 10 || p.y < -10 || p.y > h + 10) {
          resetParticle(p, w, h)
          continue
        }

        // Draw trail line
        const ageFraction = p.age / p.maxAge
        const alpha = Math.min(1, (1 - ageFraction) * 1.5)
        const speedAlpha = Math.min(1, wind.speed / 15)
        const finalAlpha = alpha * (0.3 + speedAlpha * 0.7)

        if (isDark) {
          ctx.strokeStyle = `rgba(180, 220, 255, ${finalAlpha * 0.7 * opacityScale})`
        } else {
          ctx.strokeStyle = `rgba(30, 80, 180, ${finalAlpha * 0.6 * opacityScale})`
        }

        ctx.beginPath()
        ctx.moveTo(p.prevX, p.prevY)
        ctx.lineTo(p.x, p.y)
        ctx.stroke()
      }

      animFrameRef.current = requestAnimationFrame(animate)
    }

    animFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
      map.off('moveend', handleMoveEnd)
      map.off('resize', resize)
    }
  }, [active, isDark, loadWindData, mapRef, resetParticle])

  if (!active) return null

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-[1]"
      style={{ pointerEvents: 'none' }}
    />
  )
}
