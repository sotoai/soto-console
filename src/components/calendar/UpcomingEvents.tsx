'use client'

import { useMemo, type CSSProperties } from 'react'
import type { CalendarEvent } from './mock-events'
import { MOCK_EVENTS } from './mock-events'
import { formatTime } from './calendar-utils'

interface UpcomingEventsProps {
  className?: string
  style?: CSSProperties
  events?: CalendarEvent[]
}

/** Get a human-readable day label: "Today", "Tomorrow", or "Wednesday, Mar 4" */
function getDayLabel(date: Date): string {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })
}

export function UpcomingEvents({ className, style, events = MOCK_EVENTS }: UpcomingEventsProps) {
  // Future events within 7 days, sorted by start
  const upcoming = useMemo(() => {
    const now = new Date()
    const weekFromNow = new Date()
    weekFromNow.setDate(weekFromNow.getDate() + 7)

    return events
      .filter(e => e.start >= now && e.start <= weekFromNow)
      .sort((a, b) => a.start.getTime() - b.start.getTime())
  }, [events])

  // Group by day
  const grouped = useMemo(() => {
    const groups: { label: string; events: CalendarEvent[] }[] = []
    const seen = new Map<string, number>()

    for (const event of upcoming) {
      const label = getDayLabel(event.start)
      if (seen.has(label)) {
        groups[seen.get(label)!].events.push(event)
      } else {
        seen.set(label, groups.length)
        groups.push({ label, events: [event] })
      }
    }

    return groups
  }, [upcoming])

  return (
    <div className={className} style={style}>
      <h3
        className="text-[13px] font-semibold text-[var(--wp-text-tertiary)] uppercase tracking-wider mb-4"
        style={{ textShadow: 'var(--wp-shadow)' }}
      >
        Upcoming
      </h3>

      <div className="space-y-5 overflow-y-auto pr-1" style={{ maxHeight: 'var(--upcoming-max-h)' }}>
        {grouped.length === 0 ? (
          <p className="text-[13px] text-[var(--wp-text-muted)]">No upcoming events</p>
        ) : (
          grouped.map(({ label, events: dayEvents }) => (
            <div key={label}>
              <p className="text-[11px] font-semibold text-[var(--wp-text-tertiary)] mb-2">
                {label}
              </p>
              <div className="space-y-1.5">
                {dayEvents.map(event => (
                  <div key={event.id} className="flex items-start gap-2.5 py-2.5 min-h-[44px]">
                    {/* Color dot */}
                    <div
                      className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                      style={{ backgroundColor: event.color || 'var(--accent)' }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-[var(--wp-text)] truncate">
                        {event.title}
                      </p>
                      <p className="text-[11px] text-[var(--wp-text-tertiary)] font-mono tabular-nums">
                        {event.allDay
                          ? 'All day'
                          : `${formatTime(event.start)} – ${formatTime(event.end)}`}
                      </p>
                      {event.location && (
                        <p className="text-[10px] text-[var(--wp-text-muted)] truncate mt-0.5">
                          {event.location}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
