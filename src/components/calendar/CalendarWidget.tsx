'use client'

import { useState, type CSSProperties } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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

  const ActiveComponent = VIEW_COMPONENTS[activeView]

  return (
    <>
      <div className={className} style={style}>
        {/* Segmented control — minimal inline tabs */}
        <div className="flex items-center gap-3 mb-2">
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
        </div>

        {/* Responsive-height content area */}
        <div className="overflow-hidden relative" style={{ height: 'var(--calendar-height)' }}>
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

      {/* Eternity overlay (portal to body) */}
      <EternityOverlay open={eternityOpen} onClose={() => setEternityOpen(false)} />
    </>
  )
}
