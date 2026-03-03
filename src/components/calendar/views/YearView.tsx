'use client'

import { useMemo } from 'react'
import { getMonthsOfYear, isToday, MONTH_NAMES } from '../calendar-utils'
import type { CalendarEvent } from '../mock-events'

interface YearViewProps {
  events?: CalendarEvent[]
}

export function YearView({ events }: YearViewProps) {
  const today = useMemo(() => new Date(), [])
  const year = today.getFullYear()
  const months = useMemo(() => getMonthsOfYear(year), [year])

  return (
    <div className="space-y-4">
      {/* Year */}
      <p className="text-[22px] font-bold text-[var(--wp-text)] tracking-[-0.02em]" style={{ textShadow: 'var(--wp-shadow-strong)' }}>
        {year}
      </p>

      {/* 4×3 grid of mini months */}
      <div className="grid grid-cols-4 gap-x-4 gap-y-3">
        {months.map(({ name, month, days }) => (
          <div key={month} className="space-y-1.5">
            {/* Month name */}
            <p className="text-[10px] font-semibold text-[var(--wp-text-tertiary)] uppercase tracking-wider">
              {name.slice(0, 3)}
            </p>

            {/* Tiny dot grid — 7 cols, up to 6 rows */}
            <div className="grid grid-cols-7 gap-[3px]">
              {days.flat().map((date, i) => {
                if (!date) {
                  return <div key={`e-${month}-${i}`} className="w-[5px] h-[5px]" />
                }

                const today_ = isToday(date)

                return (
                  <div
                    key={`d-${month}-${i}`}
                    className={`w-[5px] h-[5px] rounded-full ${
                      today_
                        ? 'bg-[var(--accent)]'
                        : 'bg-[var(--wp-dot)]'
                    }`}
                  />
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
