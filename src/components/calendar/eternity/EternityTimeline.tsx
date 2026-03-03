'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { motion, LayoutGroup } from 'framer-motion'
import { ERAS, getEraWidths, formatYearsAgo } from './timeline-data'
import { EraColumn } from './EraColumn'
import { YouAreHere } from './YouAreHere'
import { ZoomIndicator } from './ZoomIndicator'
import { useTimelineZoom } from './useTimelineZoom'

export function EternityTimeline() {
  const [selectedEraId, setSelectedEraId] = useState<string | null>(null)
  const logWidths = useMemo(() => getEraWidths(), [])
  const viewportRef = useRef<HTMLDivElement>(null)

  const {
    scale,
    scrollLeft,
    containerWidth,
    isZoomed,
    getEraDetailLevel,
    bindGestures,
    resetZoom,
  } = useTimelineZoom({ viewportRef })

  // Clear selection when zooming starts
  useEffect(() => {
    if (isZoomed && selectedEraId) {
      setSelectedEraId(null)
    }
  }, [isZoomed, selectedEraId])

  // Escape key: collapse selected era (capture phase fires before overlay's handler)
  useEffect(() => {
    if (!selectedEraId) return

    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        setSelectedEraId(null)
      }
    }
    document.addEventListener('keydown', handler, true)
    return () => document.removeEventListener('keydown', handler, true)
  }, [selectedEraId])

  // Viewport width for minimap calculations
  const viewportWidth = viewportRef.current?.clientWidth ?? 0
  const minimapHighlightWidth = containerWidth > 0 ? (viewportWidth / containerWidth) * 100 : 100
  const minimapHighlightLeft = containerWidth > 0 ? (scrollLeft / containerWidth) * 100 : 0

  return (
    <div className="flex flex-col w-full h-full px-6 pt-16 pb-8">
      {/* Zoomable viewport */}
      <div
        ref={viewportRef}
        className="flex-1 overflow-hidden relative"
        style={{ touchAction: 'none' }}
        {...(bindGestures as any)()}
      >
        {/* Content track — grows with zoom, translated for scroll */}
        <div
          className="h-full"
          style={{
            width: isZoomed ? containerWidth : '100%',
            transform: isZoomed ? `translateX(-${scrollLeft}px)` : undefined,
            willChange: isZoomed ? 'transform' : undefined,
          }}
        >
          <LayoutGroup>
            <div className="flex h-full items-stretch gap-0">
              {ERAS.map((era, i) => (
                <EraColumn
                  key={era.id}
                  era={era}
                  index={i}
                  isSelected={selectedEraId === era.id}
                  isAnySelected={selectedEraId !== null}
                  overviewFlex={logWidths[i]}
                  detailLevel={getEraDetailLevel(i)}
                  onSelect={() => !isZoomed && setSelectedEraId(era.id)}
                  onBack={() => setSelectedEraId(null)}
                  isLast={i === ERAS.length - 1}
                />
              ))}
            </div>
          </LayoutGroup>
        </div>
      </div>

      {/* Zoom indicator */}
      <ZoomIndicator scale={scale} isZoomed={isZoomed} onReset={resetZoom} />

      {/* Bottom bar: timeline ruler */}
      <div className="relative mt-3">
        {/* The timeline line */}
        <div className="absolute left-0 right-0 top-0 h-px bg-white/[0.08]" />

        {/* Minimap viewport highlight (only when zoomed) */}
        {isZoomed && (
          <div
            className="absolute -top-px h-[3px] rounded-full bg-white/25"
            style={{
              left: `${minimapHighlightLeft}%`,
              width: `${Math.max(minimapHighlightWidth, 1)}%`,
            }}
          />
        )}

        {/* Colored era segments along the bottom */}
        <div className="flex h-[2px] mt-px">
          {ERAS.map((era, i) => {
            const f = selectedEraId === era.id ? 8 : selectedEraId !== null ? 0.3 : logWidths[i]
            return (
              <div
                key={era.id}
                style={{
                  flex: f,
                  backgroundColor: era.color.accent,
                  opacity: 0.15,
                }}
              />
            )
          })}
        </div>

        {/* Tick marks + labels */}
        <div className="flex items-start gap-0 pt-1">
          {ERAS.map((era, i) => {
            const f = selectedEraId === era.id ? 8 : selectedEraId !== null ? 0.3 : logWidths[i]
            return (
              <div key={era.id} style={{ flex: f }} className="relative min-w-0">
                {/* Tick mark — colored */}
                <div
                  className="absolute -top-[5px] left-0 w-px h-[5px]"
                  style={{ backgroundColor: era.color.accent, opacity: 0.4 }}
                />
                {/* Label — only show if column is wide enough */}
                {(!selectedEraId || selectedEraId === era.id) && logWidths[i] > 0.3 && (
                  <motion.span
                    className="block text-[7px] font-mono text-white/20 tabular-nums truncate pl-1 leading-tight"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 + i * 0.03 }}
                  >
                    {formatYearsAgo(era.yearsAgo)}
                  </motion.span>
                )}
              </div>
            )
          })}
        </div>

        {/* "You Are Here" map pin — anchored to the far right (present day) */}
        <div className="absolute right-0 bottom-full mb-1">
          <YouAreHere />
        </div>
      </div>
    </div>
  )
}
