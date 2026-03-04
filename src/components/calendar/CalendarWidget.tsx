'use client'

import { useState, useEffect, useRef, type CSSProperties } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Minimize2 } from 'lucide-react'
import { DayView } from './views/DayView'
import { WeekView } from './views/WeekView'
import { MonthView } from './views/MonthView'
import { YearView } from './views/YearView'
import { EternityOverlay } from './eternity/EternityOverlay'
import { MOCK_EVENTS, type CalendarEvent } from './mock-events'

type CalendarView = 'day' | 'week' | 'month' | 'year'

const VIEWS: { key: CalendarView; label: string }[] = [
  { key: 'day', label: 'Day' },
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
  { key: 'year', label: 'Year' },
]

const VIEW_COMPONENTS: Record<CalendarView, React.ComponentType<{ events?: CalendarEvent[] }>> = {
  day: DayView,
  week: WeekView,
  month: MonthView,
  year: YearView,
}

interface CalendarWidgetProps {
  className?: string
  style?: CSSProperties
}

export function CalendarWidget({ className, style }: CalendarWidgetProps) {
  const [activeView, setActiveView] = useState<CalendarView>('month')
  const [eternityOpen, setEternityOpen] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [mounted, setMounted] = useState(false)

  // DOM reparenting refs (same pattern as WorldMap)
  const portalHostRef = useRef<HTMLDivElement | null>(null)
  const calContainerRef = useRef<HTMLDivElement>(null)
  const placeholderRef = useRef<HTMLDivElement>(null)

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

  // Create portal host on body
  useEffect(() => {
    if (!mounted) return
    if (!portalHostRef.current) {
      const div = document.createElement('div')
      div.id = 'calendar-fullscreen-host'
      div.style.cssText =
        'position:fixed;inset:0;z-index:9999;display:none;'
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

  // Reparent on expand/collapse
  useEffect(() => {
    if (!mounted || !calContainerRef.current || !portalHostRef.current || !placeholderRef.current)
      return
    const calNode = calContainerRef.current
    const portalHost = portalHostRef.current
    const placeholder = placeholderRef.current

    if (expanded) {
      portalHost.appendChild(calNode)
      portalHost.style.display = 'block'
      document.body.style.overflow = 'hidden'
    } else {
      placeholder.appendChild(calNode)
      portalHost.style.display = 'none'
      document.body.style.overflow = ''
    }
  }, [expanded, mounted])

  const ActiveComponent = VIEW_COMPONENTS[activeView]

  return (
    <>
      {/* Placeholder keeps the card's position in the layout flow */}
      <div ref={placeholderRef} className={expanded ? 'contents' : className} style={expanded ? undefined : style}>
        <div
          ref={calContainerRef}
          className={
            expanded
              ? 'fixed inset-0 z-[9999] flex flex-col p-5 md:p-8'
              : 'flex flex-col h-full'
          }
          style={
            expanded
              ? {
                  background: 'var(--wallpaper-card-bg)',
                  backdropFilter: 'blur(60px) saturate(200%)',
                  WebkitBackdropFilter: 'blur(60px) saturate(200%)',
                }
              : undefined
          }
        >
          {/* Segmented control — minimal inline tabs */}
          <div className="flex items-center gap-3 mb-2 shrink-0">
            {VIEWS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveView(key)}
                className="relative text-[11px] md:text-[12px] font-semibold uppercase tracking-wider cursor-pointer select-none transition-colors duration-200 py-1"
                style={{
                  color: activeView === key ? 'var(--wp-text)' : 'var(--wp-text-muted)',
                }}
              >
                {label}
                {activeView === key && (
                  <motion.div
                    layoutId="calendar-segment"
                    className="absolute -bottom-[1px] left-0 right-0 h-[1.5px] rounded-full bg-[var(--wp-text)]"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            ))}
            <button
              onClick={() => setEternityOpen(true)}
              className="text-[13px] md:text-[14px] font-semibold cursor-pointer select-none transition-colors duration-200 text-[var(--wp-text-muted)] hover:text-[var(--wp-text-secondary)] py-1"
            >
              &infin;
            </button>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Expand / Minimize button */}
            {expanded ? (
              <button
                onClick={() => setExpanded(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer transition-all duration-150 active:scale-95"
                style={{
                  background: 'var(--wp-control-bg)',
                  border: '0.5px solid var(--wallpaper-card-border)',
                }}
                title="Minimize calendar (Esc)"
              >
                <Minimize2 size={14} className="text-[var(--wp-text-secondary)]" />
              </button>
            ) : (
              <button
                onClick={() => setExpanded(true)}
                className="w-7 h-7 flex items-center justify-center rounded-md cursor-pointer transition-all duration-150 active:scale-95 opacity-50 hover:opacity-80"
                title="Expand calendar"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 14 14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  className="text-[var(--wp-text-secondary)]"
                >
                  <path d="M1 5V1h4M9 1h4v4M13 9v4H9M5 13H1V9" />
                </svg>
              </button>
            )}
          </div>

          {/* Content area — flex-fills available space, min-height as floor */}
          <div
            className="overflow-hidden relative flex-1 min-h-0"
            style={{ minHeight: expanded ? undefined : 'var(--calendar-height)' }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeView}
                className="absolute inset-0"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                <ActiveComponent events={MOCK_EVENTS} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Eternity overlay (portal to body) */}
      <EternityOverlay open={eternityOpen} onClose={() => setEternityOpen(false)} />
    </>
  )
}
