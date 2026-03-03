'use client'

import { useState, useCallback, useRef, useEffect, type RefObject } from 'react'
import { useGesture } from '@use-gesture/react'
import { getEraPixelWidths, ZOOM_THRESHOLDS, type DetailLevel } from './timeline-data'

interface UseTimelineZoomConfig {
  viewportRef: RefObject<HTMLDivElement | null>
  minScale?: number
  maxScale?: number
}

interface UseTimelineZoomReturn {
  scale: number
  scrollLeft: number
  containerWidth: number
  isZoomed: boolean
  getEraDetailLevel: (eraIndex: number) => DetailLevel
  bindGestures: ReturnType<typeof useGesture>
  resetZoom: () => void
}

export function useTimelineZoom({
  viewportRef,
  minScale = 1,
  maxScale = 50,
}: UseTimelineZoomConfig): UseTimelineZoomReturn {
  const [scale, setScale] = useState(1)
  const [scrollLeft, setScrollLeft] = useState(0)

  // Refs for gesture math (avoid stale closures)
  const scaleRef = useRef(scale)
  const scrollRef = useRef(scrollLeft)
  scaleRef.current = scale
  scrollRef.current = scrollLeft

  // Track the scale at the start of a pinch
  const pinchStartScale = useRef(1)

  const getViewportWidth = useCallback(() => {
    return viewportRef.current?.clientWidth ?? window.innerWidth
  }, [viewportRef])

  const getContainerWidth = useCallback(
    (s: number) => getViewportWidth() * s,
    [getViewportWidth]
  )

  const clampScroll = useCallback(
    (scroll: number, s: number) => {
      const vw = getViewportWidth()
      const cw = getContainerWidth(s)
      return Math.max(0, Math.min(scroll, cw - vw))
    },
    [getViewportWidth, getContainerWidth]
  )

  // Focal-point zoom: adjust scroll so the point under the focal stays put
  const zoomAtPoint = useCallback(
    (newScale: number, focalViewportX: number) => {
      const clamped = Math.max(minScale, Math.min(maxScale, newScale))
      const oldCW = getContainerWidth(scaleRef.current)
      const newCW = getContainerWidth(clamped)

      const focalTimelineX = scrollRef.current + focalViewportX
      const focalRatio = oldCW > 0 ? focalTimelineX / oldCW : 0
      const newFocalTimelineX = focalRatio * newCW
      const newScroll = clampScroll(newFocalTimelineX - focalViewportX, clamped)

      setScale(clamped)
      setScrollLeft(newScroll)
    },
    [minScale, maxScale, getContainerWidth, clampScroll]
  )

  // Native wheel listener (more reliable than @use-gesture for ctrl+wheel)
  useEffect(() => {
    const el = viewportRef.current
    if (!el) return

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        // Trackpad pinch (macOS sends ctrl+wheel) or ctrl+scroll
        e.preventDefault()
        const rect = el.getBoundingClientRect()
        const focalX = e.clientX - rect.left
        const zoomFactor = 1 - e.deltaY * 0.005
        zoomAtPoint(scaleRef.current * zoomFactor, focalX)
      } else if (scaleRef.current > 1) {
        // Regular scroll → pan horizontally when zoomed
        e.preventDefault()
        setScrollLeft(prev => clampScroll(prev + e.deltaY, scaleRef.current))
      }
    }

    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [viewportRef, zoomAtPoint, clampScroll])

  // Keyboard zoom: +/- keys
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const vw = getViewportWidth()
      const center = vw / 2

      if (e.key === '=' || e.key === '+') {
        e.preventDefault()
        zoomAtPoint(scaleRef.current * 1.3, center)
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault()
        zoomAtPoint(scaleRef.current / 1.3, center)
      } else if (e.key === '0') {
        e.preventDefault()
        setScale(1)
        setScrollLeft(0)
      }
    }

    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [getViewportWidth, zoomAtPoint])

  // Gesture bindings (pinch + drag for touch)
  const bind = useGesture(
    {
      onPinchStart: () => {
        pinchStartScale.current = scaleRef.current
      },
      onPinch: ({ origin: [ox], offset: [d], first }) => {
        if (first) return
        const newScale = pinchStartScale.current * d
        const rect = viewportRef.current?.getBoundingClientRect()
        const focalX = rect ? ox - rect.left : ox
        zoomAtPoint(newScale, focalX)
      },
      onDrag: ({ delta: [dx], pinching, cancel }) => {
        if (pinching) {
          cancel()
          return
        }
        if (scaleRef.current <= 1) return
        setScrollLeft(prev => clampScroll(prev - dx, scaleRef.current))
      },
    },
    {
      pinch: {
        scaleBounds: { min: minScale, max: maxScale },
        rubberband: true,
      },
      drag: {
        filterTaps: true,
        pointer: { touch: true },
      },
    }
  )

  // Compute detail level per era
  const containerWidth = getContainerWidth(scale)
  const eraPixelWidths = getEraPixelWidths(containerWidth)

  const getEraDetailLevel = useCallback(
    (eraIndex: number): DetailLevel => {
      const px = eraPixelWidths[eraIndex] ?? 0
      if (px >= ZOOM_THRESHOLDS.FULL_PX) return 'full'
      if (px >= ZOOM_THRESHOLDS.LABELS_PX) return 'labels'
      if (px >= ZOOM_THRESHOLDS.MARKERS_PX) return 'markers'
      return 'overview'
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [scale]
  )

  const resetZoom = useCallback(() => {
    setScale(1)
    setScrollLeft(0)
  }, [])

  // Reset scroll when scale returns to 1
  useEffect(() => {
    if (scale <= 1) setScrollLeft(0)
  }, [scale])

  return {
    scale,
    scrollLeft,
    containerWidth,
    isZoomed: scale > 1.05,
    getEraDetailLevel,
    bindGestures: bind,
    resetZoom,
  }
}
