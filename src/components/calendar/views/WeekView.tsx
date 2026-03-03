'use client'

import { useMemo } from 'react'
import { getWeekDays, DAY_NAMES, isToday } from '../calendar-utils'
import type { CalendarEvent } from '../mock-events'

interface WeekViewProps {
  events?: CalendarEvent[]
}

export function WeekView({ events = [] }: WeekViewProps) {
  const today = useMemo(() => new Date(), [])
  const weekDays = useMemo(() => getWeekDays(today), [today])

  const monthYear = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  // Group events by date
  function getEventsForDate(date: Date): CalendarEvent[] {
    return events
      .filter(e =>
        e.start.getFullYear() === date.getFullYear() &&
        e.start.getMonth() === date.getMonth() &&
        e.start.getDate() === date.getDate()
      )
      .sort((a, b) => a.start.getTime() - b.start.getTime())
  }

  const MAX_VISIBLE = 3

  return (
    <div className="space-y-4">
      <p className="text-[15px] font-semibold text-[var(--wp-text)]" style={{ textShadow: 'var(--wp-shadow)' }}>
        {monthYear}
      </p>

      <div className="grid grid-cols-7 gap-1 md:gap-2">
        {/* Day name headers */}
        {DAY_NAMES.map(name => (
          <div key={name} className="text-center">
            <span className="text-[9px] md:text-[10px] font-medium text-[var(--wp-text-tertiary)] uppercase tracking-wider">
              {name}
            </span>
          </div>
        ))}

        {/* Date cells with events */}
        {weekDays.map((date, i) => {
          const today_ = isToday(date)
          const dayEvents = getEventsForDate(date)
          const overflow = dayEvents.length - MAX_VISIBLE

          return (
            <div key={i} className="flex flex-col items-center pt-1.5 md:pt-2 gap-1 md:gap-1.5">
              {/* Date circle */}
              <div
                className={`w-7 h-7 md:w-9 md:h-9 flex items-center justify-center rounded-full transition-colors ${
                  today_
                    ? 'bg-[var(--accent)] text-white'
                    : 'text-[var(--wp-text-secondary)]'
                }`}
              >
                <span className={`text-[13px] md:text-[15px] tabular-nums ${today_ ? 'font-bold' : 'font-medium'}`}>
                  {date.getDate()}
                </span>
              </div>

              {/* Event pills — hidden on mobile, show dots instead */}
              {dayEvents.length > 0 && (
                <>
                  {/* Mobile: colored dots */}
                  <div className="flex gap-0.5 md:hidden">
                    {dayEvents.slice(0, 3).map(event => (
                      <div
                        key={event.id}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: event.color || '#007AFF' }}
                      />
                    ))}
                  </div>
                  {/* Tablet+: event pills */}
                  <div className="w-full space-y-0.5 hidden md:block">
                    {dayEvents.slice(0, MAX_VISIBLE).map(event => (
                      <div
                        key={event.id}
                        className="rounded-sm px-1 py-px truncate"
                        style={{
                          backgroundColor: `${event.color || '#007AFF'}35`,
                          borderLeft: `2px solid ${event.color || '#007AFF'}`,
                        }}
                      >
                        <span className="text-[8px] font-medium text-[var(--wp-text-secondary)] truncate block leading-tight">
                          {event.title}
                        </span>
                      </div>
                    ))}
                    {overflow > 0 && (
                      <span className="text-[8px] text-[var(--wp-text-tertiary)] text-center block">
                        +{overflow} more
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
