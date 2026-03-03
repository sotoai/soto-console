'use client'

import { useMemo } from 'react'
import { getMonthGrid, DAY_NAMES, isToday, MONTH_NAMES } from '../calendar-utils'
import type { CalendarEvent } from '../mock-events'

interface MonthViewProps {
  events?: CalendarEvent[]
}

export function MonthView({ events }: MonthViewProps) {
  const today = useMemo(() => new Date(), [])
  const year = today.getFullYear()
  const month = today.getMonth()
  const grid = useMemo(() => getMonthGrid(year, month), [year, month])

  return (
    <div className="space-y-3">
      {/* Month + Year */}
      <p className="text-[15px] font-semibold text-[var(--wp-text)]" style={{ textShadow: 'var(--wp-shadow)' }}>
        {MONTH_NAMES[month]} {year}
      </p>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-px">
        {DAY_NAMES.map(name => (
          <div key={name} className="text-center pb-2">
            <span className="text-[10px] font-medium text-[var(--wp-text-tertiary)] uppercase tracking-wider">
              {name}
            </span>
          </div>
        ))}
      </div>

      {/* Date grid */}
      <div className="grid grid-cols-7 gap-px">
        {grid.flat().map((date, i) => {
          if (!date) {
            return <div key={`empty-${i}`} className="h-8" />
          }

          const today_ = isToday(date)

          return (
            <div key={i} className="flex justify-center items-center h-8">
              <div
                className={`w-7 h-7 flex items-center justify-center rounded-full transition-colors ${
                  today_
                    ? 'bg-[var(--accent)] text-white'
                    : 'text-[var(--wp-text-secondary)]'
                }`}
              >
                <span className={`text-[12px] tabular-nums ${today_ ? 'font-bold' : ''}`}>
                  {date.getDate()}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
