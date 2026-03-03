'use client'

import { useRef, useEffect, useMemo, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ERAS, computeEonWidths, getTotalTimelineWidth } from './timeline-data'
import { EonSection } from './EonSection'
import { ScrollProgress } from './ScrollProgress'
import { YouAreHere } from './YouAreHere'

const CODA_WIDTH = 400 // px for the "You Are Here" ending

export function EternityTimeline() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const layouts = useMemo(() => computeEonWidths(), [])
  const totalWidth = useMemo(() => getTotalTimelineWidth(), [])
  const [scrollProgress, setScrollProgress] = useState(0)
  const [currentEraIndex, setCurrentEraIndex] = useState(0)

  // ── Mouse wheel → horizontal scroll mapping ──
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const handler = (e: WheelEvent) => {
      // Convert vertical wheel to horizontal scroll (ignore trackpad horizontal gestures)
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault()
        el.scrollLeft += e.deltaY
      }
    }

    el.addEventListener('wheel', handler, { passive: false })
    return () => el.removeEventListener('wheel', handler)
  }, [])

  // ── Keyboard navigation ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const el = scrollRef.current
      if (!el) return

      if (e.key === 'ArrowRight') {
        e.preventDefault()
        el.scrollBy({ left: 300, behavior: 'smooth' })
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        el.scrollBy({ left: -300, behavior: 'smooth' })
      }
    }

    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  // ── Track scroll position for progress bar + background ──
  const handleScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return

    const maxScroll = el.scrollWidth - el.clientWidth
    const progress = maxScroll > 0 ? el.scrollLeft / maxScroll : 0
    setScrollProgress(progress)

    // Which era is centered in the viewport?
    const centerX = el.scrollLeft + el.clientWidth / 2
    let idx = layouts.findIndex(l => centerX >= l.startX && centerX < l.startX + l.width)
    // Past the last era (in coda section) → clamp to last era
    if (idx < 0 && layouts.length > 0) {
      idx = centerX >= layouts[layouts.length - 1].startX ? layouts.length - 1 : 0
    }
    if (idx >= 0 && idx !== currentEraIndex) {
      setCurrentEraIndex(idx)
    }
  }, [layouts, currentEraIndex])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => el.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  // ── Background color that shifts with the current era ──
  const currentEra = ERAS[currentEraIndex]

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Dynamic background — transitions between era color palettes */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: `radial-gradient(ellipse at 40% 40%, ${currentEra.color.from} 0%, ${currentEra.color.to} 40%, #050510 90%)`,
        }}
        transition={{ duration: 1.5, ease: 'easeInOut' }}
      />

      {/* Intro prompt — fades out once scrolled */}
      <motion.div
        className="absolute left-8 md:left-12 top-1/2 -translate-y-1/2 z-20 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: scrollProgress < 0.01 ? 0.4 : 0 }}
        transition={{ duration: 0.6 }}
      >
        <p className="text-[11px] text-white font-mono tracking-[0.15em] uppercase">
          Scroll to begin
        </p>
        <motion.div
          className="mt-3 flex items-center gap-2"
          animate={{ x: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        >
          <div className="w-6 h-px bg-white/30" />
          <div className="text-[10px] text-white/30">&#x2192;</div>
        </motion.div>
      </motion.div>

      {/* Hide WebKit scrollbar */}
      <style>{`
        [data-eternity-scroll]::-webkit-scrollbar { display: none; }
      `}</style>

      {/* ── Horizontal scroll container ── */}
      <div
        ref={scrollRef}
        data-eternity-scroll
        className="relative z-10 h-full overflow-x-auto overflow-y-hidden"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <div
          className="flex h-full items-stretch"
          style={{ width: totalWidth + CODA_WIDTH }}
        >
          {layouts.map((layout, i) => (
            <EonSection
              key={layout.era.id}
              layout={layout}
              index={i}
            />
          ))}

          {/* Coda: "You Are Here" — the journey's end */}
          <div
            className="shrink-0 flex items-center justify-center"
            style={{ width: CODA_WIDTH, minWidth: CODA_WIDTH }}
          >
            <YouAreHere />
          </div>
        </div>
      </div>

      {/* Progress bar at bottom */}
      <ScrollProgress
        progress={scrollProgress}
        layouts={layouts}
        currentEraIndex={currentEraIndex}
      />
    </div>
  )
}
