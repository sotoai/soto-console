'use client'

import { useEffect, useState } from 'react'
import { getDayOfYear, daysInYear, formatTime } from '../calendar-utils'
import type { CalendarEvent } from '../mock-events'

interface DayViewProps {
  events?: CalendarEvent[]
}

export function DayView({ events = [] }: DayViewProps) {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(interval)
  }, [])

  const dayNum = getDayOfYear(now)
  const totalDays = daysInYear(now.getFullYear())
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

  const dayName = now.toLocaleDateString('en-US', { weekday: 'long' })
  const monthDay = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })

  // Filter events for today
  const todayEvents = events.filter(e =>
    e.start.getFullYear() === now.getFullYear() &&
    e.start.getMonth() === now.getMonth() &&
    e.start.getDate() === now.getDate()
  )

  // Calculate event position as percentage of visible range
  function getEventPosition(event: CalendarEvent) {
    const startMin = event.start.getHours() * 60 + event.start.getMinutes()
    const endMin = event.end.getHours() * 60 + event.end.getMinutes()
    const top = ((startMin - rangeStart) / (rangeEnd - rangeStart)) * 100
    const height = ((endMin - startMin) / (rangeEnd - rangeStart)) * 100
    return { top: `${Math.max(0, top)}%`, height: `${Math.max(2, height)}%` }
  }

  function formatHour(hour: number): string {
    if (hour === 0) return '12 AM'
    if (hour < 12) return `${hour} AM`
    if (hour === 12) return '12 PM'
    return `${hour - 12} PM`
  }

  return (
    <div className="h-full flex flex-col">
      {/* Date header */}
      <div className="space-y-1 mb-4">
        <p className="text-[22px] font-bold text-[var(--wp-text)] tracking-[-0.02em]" style={{ textShadow: 'var(--wp-shadow-strong)' }}>
          {dayName}
        </p>
        <div className="flex items-baseline gap-3">
          <p className="text-[14px] text-[var(--wp-text-secondary)]" style={{ textShadow: 'var(--wp-shadow)' }}>
            {monthDay}
          </p>
          <span className="text-[12px] text-[var(--wp-text-tertiary)] font-mono tabular-nums">
            Day {dayNum} of {totalDays}
          </span>
        </div>
      </div>

      {/* Timeline with events */}
      <div className="flex-1 relative overflow-hidden">
        {/* Hour grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between py-1">
          {hours.filter((_, i) => i % 2 === 0).map(hour => (
            <div key={hour} className="flex items-center gap-3">
              <span className="text-[10px] font-mono text-[var(--wp-text-tertiary)] w-[42px] text-right tabular-nums">
                {formatHour(hour)}
              </span>
              <div className="flex-1 h-px bg-[var(--wp-line)]" />
            </div>
          ))}
        </div>

        {/* Event blocks */}
        {todayEvents.map(event => {
          const pos = getEventPosition(event)
          return (
            <div
              key={event.id}
              className="absolute left-[54px] right-2 rounded-md overflow-hidden"
              style={{
                top: pos.top,
                height: pos.height,
                minHeight: '24px',
              }}
            >
              <div
                className="h-full px-2.5 py-1 flex flex-col justify-center"
                style={{
                  backgroundColor: `${event.color || '#007AFF'}30`,
                  borderLeft: `3px solid ${event.color || '#007AFF'}`,
                }}
              >
                <span className="text-[11px] font-semibold text-[var(--wp-text)] truncate">
                  {event.title}
                </span>
                <span className="text-[9px] text-[var(--wp-text-secondary)] font-mono tabular-nums">
                  {formatTime(event.start)} – {formatTime(event.end)}
                </span>
              </div>
            </div>
          )
        })}

        {/* Current time indicator — on top of events */}
        {timePercent > 0 && timePercent < 100 && (
          <div
            className="absolute left-[54px] right-0 flex items-center z-10"
            style={{ top: `${timePercent}%` }}
          >
            <div className="w-2 h-2 rounded-full bg-[var(--accent)] shadow-[0_0_8px_rgba(0,122,255,0.5)]" />
            <div className="flex-1 h-[1.5px] bg-[var(--accent)]" />
          </div>
        )}
      </div>
    </div>
  )
}
