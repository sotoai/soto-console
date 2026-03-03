'use client'

import { useState } from 'react'
import { CalendarWidget } from '@/components/calendar/CalendarWidget'
import { UpcomingEvents } from '@/components/calendar/UpcomingEvents'
import { ArcadePanel } from '@/components/arcade/ArcadePanel'
import { AppDock } from '@/components/shell/AppDock'
import { SwipeablePages } from '@/components/shell/SwipeablePages'
import { PageIndicator } from '@/components/shell/PageIndicator'

const glassStyle = {
  border: '0.5px solid var(--wallpaper-card-border)',
  boxShadow: 'var(--wallpaper-card-shadow)',
  backdropFilter: 'blur(40px) saturate(180%)',
  WebkitBackdropFilter: 'blur(40px) saturate(180%)',
} as React.CSSProperties

export default function HomePage() {
  const [currentPage, setCurrentPage] = useState(0)

  return (
    <>
      {/* Full-viewport wallpaper */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: 'url(/wallpaper.jpg)' }}
      >
        <div className="absolute inset-0 bg-[var(--wallpaper-overlay)]" />
      </div>

      {/* Content — fills viewport below StatusBar */}
      <div className="relative z-10 flex flex-col h-full overflow-hidden">
        {/* Swipeable page area */}
        <div className="flex-1 min-h-0">
          <SwipeablePages currentPage={currentPage} onPageChange={setCurrentPage}>
            {/* Page 1: Calendar + Upcoming Events */}
            <div
              className="h-full flex items-start justify-center overflow-y-auto md:overflow-hidden"
              style={{ padding: 'var(--shell-padding-top) var(--shell-padding-x) 0.5rem' }}
            >
              <div
                className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-[1fr_280px] lg:grid-cols-[1fr_320px] animate-fade-in"
                style={{ gap: 'var(--shell-gap)' }}
              >
                <CalendarWidget
                  className="rounded-[var(--radius-lg)] bg-[var(--wallpaper-card-bg)] p-4 md:p-5"
                  style={glassStyle}
                />
                <UpcomingEvents
                  className="rounded-[var(--radius-lg)] bg-[var(--wallpaper-card-bg)] p-4 md:p-5"
                  style={glassStyle}
                />
              </div>
            </div>

            {/* Page 2: Arcade */}
            <div
              className="h-full flex items-start justify-center overflow-y-auto md:overflow-hidden"
              style={{ padding: 'var(--shell-padding-top) var(--shell-padding-x) 0.5rem' }}
            >
              <div className="w-full max-w-5xl animate-fade-in h-full">
                <ArcadePanel
                  className="rounded-[var(--radius-lg)] bg-[var(--wallpaper-card-bg)] p-4 md:p-5 h-full"
                  style={glassStyle}
                />
              </div>
            </div>
          </SwipeablePages>
        </div>

        {/* Page dots */}
        <PageIndicator
          total={2}
          current={currentPage}
          onPageSelect={setCurrentPage}
        />

        {/* App dock — bottom */}
        <div className="pb-2 pt-0 md:pb-3 lg:pb-6 lg:pt-1 shrink-0">
          <AppDock />
        </div>
      </div>
    </>
  )
}
