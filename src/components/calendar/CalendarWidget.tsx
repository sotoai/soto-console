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
        {/* Segmented control */}
        <div className="flex items-center gap-1 mb-3 md:mb-5">
          <div className="relative flex items-center bg-[var(--wp-control-bg)] rounded-full p-[3px] gap-[2px]">
            {VIEWS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveView(key)}
                className="relative z-10 rounded-full transition-colors duration-200 cursor-pointer select-none font-semibold flex items-center justify-center min-h-[44px]"
                style={{
                  padding: `var(--segment-py) var(--segment-px)`,
                  fontSize: 'var(--segment-font)',
                  color: activeView === key ? 'var(--wp-text)' : 'var(--wp-text-secondary)',
                }}
              >
                {activeView === key && (
                  <motion.div
                    layoutId="calendar-segment"
                    className="absolute inset-0 bg-[var(--wp-control-active)] rounded-full"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{label}</span>
              </button>
            ))}

            {/* Eternity button */}
            <button
              onClick={() => setEternityOpen(true)}
              className="relative z-10 px-3 text-[14px] font-semibold rounded-full transition-all duration-200 cursor-pointer select-none text-[var(--wp-text-tertiary)] active:text-[var(--wp-text-secondary)] active:bg-[var(--wp-control-bg)] flex items-center justify-center min-h-[44px]"
            >
              &infin;
            </button>
          </div>
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
