'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getDayOfYear, daysInYear, formatTime } from '../calendar-utils'
import type { CalendarEvent } from '../mock-events'

type DayMode = 'schedule' | 'timeline'

interface DayViewProps {
  events?: CalendarEvent[]
}

export function DayView({ events = [] }: DayViewProps) {
  const [now, setNow] = useState(new Date())
  const [mode, setMode] = useState<DayMode>('schedule')

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(interval)
  }, [])

  const dayNum = getDayOfYear(now)
  const totalDays = daysInYear(now.getFullYear())

  const dayName = now.toLocaleDateString('en-US', { weekday: 'long' })
  const monthDay = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })

  // Filter events for today
  const todayEvents = events.filter(e =>
    e.start.getFullYear() === now.getFullYear() &&
    e.start.getMonth() === now.getMonth() &&
    e.start.getDate() === now.getDate()
  ).sort((a, b) => a.start.getTime() - b.start.getTime())

  return (
    <div className="h-full flex flex-col">
      {/* Date header + mode toggle */}
      <div className="flex items-start justify-between mb-3 md:mb-4">
        <div className="space-y-1">
          <p
            className="text-[18px] md:text-[22px] font-bold text-[var(--wp-text)] tracking-[-0.02em]"
            style={{ textShadow: 'var(--wp-shadow-strong)' }}
          >
            {dayName}
          </p>
          <div className="flex items-baseline gap-2 md:gap-3">
            <p className="text-[13px] md:text-[14px] text-[var(--wp-text-secondary)]" style={{ textShadow: 'var(--wp-shadow)' }}>
              {monthDay}
            </p>
            <span className="text-[11px] md:text-[12px] text-[var(--wp-text-tertiary)] font-mono tabular-nums">
              Day {dayNum} of {totalDays}
            </span>
          </div>
        </div>

        {/* Schedule / Timeline toggle */}
        <div className="flex items-center gap-0.5 bg-[var(--wp-control-bg)] rounded-md p-[2px]">
          {(['schedule', 'timeline'] as const).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className="relative px-2 py-1 text-[10px] md:text-[11px] font-semibold uppercase tracking-wider rounded-[4px] cursor-pointer select-none transition-colors duration-150"
              style={{
                color: mode === m ? 'var(--wp-text)' : 'var(--wp-text-muted)',
                background: mode === m ? 'var(--wp-control-active)' : 'transparent',
              }}
            >
              {m === 'schedule' ? 'List' : 'Hour'}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {mode === 'schedule' ? (
            <motion.div
              key="schedule"
              className="absolute inset-0 overflow-y-auto"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              <ScheduleView events={todayEvents} now={now} />
            </motion.div>
          ) : (
            <motion.div
              key="timeline"
              className="absolute inset-0 overflow-hidden"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              <TimelineView events={todayEvents} now={now} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ─── Schedule (simplified list) ───

function ScheduleView({ events, now }: { events: CalendarEvent[]; now: Date }) {
  if (events.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-[13px] text-[var(--wp-text-muted)]">No events today</p>
      </div>
    )
  }

  const currentTime = now.getTime()

  return (
    <div className="space-y-1">
      {events.map(event => {
        const isPast = event.end.getTime() < currentTime
        const isNow = event.start.getTime() <= currentTime && event.end.getTime() > currentTime

        return (
          <div
            key={event.id}
            className="flex items-start gap-3 py-2.5 px-1"
            style={{ opacity: isPast ? 0.4 : 1 }}
          >
            {/* Time column */}
            <div className="w-[52px] md:w-[58px] shrink-0 text-right">
              <p className="text-[11px] md:text-[12px] font-mono tabular-nums text-[var(--wp-text-secondary)]">
                {formatTime(event.start)}
              </p>
              <p className="text-[9px] md:text-[10px] font-mono tabular-nums text-[var(--wp-text-muted)]">
                {formatTime(event.end)}
              </p>
            </div>

            {/* Color bar */}
            <div
              className="w-[3px] self-stretch rounded-full shrink-0"
              style={{
                backgroundColor: event.color || 'var(--accent)',
                boxShadow: isNow ? `0 0 8px ${event.color || 'var(--accent)'}60` : 'none',
              }}
            />

            {/* Details */}
            <div className="flex-1 min-w-0">
              <p className="text-[13px] md:text-[14px] font-medium text-[var(--wp-text)] truncate">
                {event.title}
                {isNow && (
                  <span className="ml-2 text-[9px] font-semibold uppercase tracking-wider text-[var(--accent)]">
                    Now
                  </span>
                )}
              </p>
              {event.location && (
                <p className="text-[10px] md:text-[11px] text-[var(--wp-text-muted)] truncate mt-0.5">
                  {event.location}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Timeline (hour-by-hour) ───

function TimelineView({ events, now }: { events: CalendarEvent[]; now: Date }) {
  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()

  // Visible hours: 6 AM – 11 PM
  const startHour = 6
  const endHour = 23
  const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i)

  // Current time position as percentage within visible range
  const timeInMinutes = currentHour * 60 + currentMinute
  const rangeStart = startHour * 60
  const rangeEnd = (endHour + 1) * 60
  const timePercent = Math.max(0, Math.min(100, ((timeInMinutes - rangeStart) / (rangeEnd - rangeStart)) * 100))

  function getEventPosition(event: CalendarEvent) {
    const startMin = event.start.getHours() * 60 + event.start.getMinutes()
    const endMin = event.end.getHours() * 60 + event.end.getMinutes()
    const top = ((startMin - rangeStart) / (rangeEnd - rangeStart)) * 100
    const height = ((endMin - startMin) / (rangeEnd - rangeStart)) * 100
    return { top: `${Math.max(0, top)}%`, height: `${Math.max(2, height)}%` }
  }

  function formatHour(hour: number): string {
    if (hour === 0) return '12a'
    if (hour < 12) return `${hour}a`
    if (hour === 12) return '12p'
    return `${hour - 12}p`
  }

  return (
    <div className="h-full relative">
      {/* Hour grid lines */}
      <div className="absolute inset-0 flex flex-col justify-between py-1">
        {hours.filter((_, i) => i % 2 === 0).map(hour => (
          <div key={hour} className="flex items-center gap-2">
            <span className="text-[9px] md:text-[10px] font-mono text-[var(--wp-text-tertiary)] w-[24px] md:w-[28px] text-right tabular-nums">
              {formatHour(hour)}
            </span>
            <div className="flex-1 h-px bg-[var(--wp-line)]" />
          </div>
        ))}
      </div>

      {/* Event blocks */}
      {events.map(event => {
        const pos = getEventPosition(event)
        return (
          <div
            key={event.id}
            className="absolute left-[32px] md:left-[38px] right-1 rounded-md overflow-hidden"
            style={{
              top: pos.top,
              height: pos.height,
              minHeight: '22px',
            }}
          >
            <div
              className="h-full px-2 py-0.5 flex flex-col justify-center"
              style={{
                backgroundColor: `${event.color || '#007AFF'}30`,
                borderLeft: `2.5px solid ${event.color || '#007AFF'}`,
              }}
            >
              <span className="text-[10px] md:text-[11px] font-semibold text-[var(--wp-text)] truncate">
                {event.title}
              </span>
              <span className="text-[8px] md:text-[9px] text-[var(--wp-text-secondary)] font-mono tabular-nums">
                {formatTime(event.start)} – {formatTime(event.end)}
              </span>
            </div>
          </div>
        )
      })}

      {/* Current time indicator */}
      {timePercent > 0 && timePercent < 100 && (
        <div
          className="absolute left-[32px] md:left-[38px] right-0 flex items-center z-10"
          style={{ top: `${timePercent}%` }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_6px_rgba(0,122,255,0.5)]" />
          <div className="flex-1 h-[1px] bg-[var(--accent)]" />
        </div>
      )}
    </div>
  )
}
