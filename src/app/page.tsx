'use client'

import { useState } from 'react'
import { CalendarWidget } from '@/components/calendar/CalendarWidget'
import { UpcomingEvents } from '@/components/calendar/UpcomingEvents'
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

      {/* Content — fills viewport below StatusBar, no vertical scroll */}
      <div className="relative z-10 flex flex-col h-[calc(100vh-44px)] overflow-hidden">
        {/* Swipeable page area */}
        <div className="flex-1 min-h-0">
          <SwipeablePages currentPage={currentPage} onPageChange={setCurrentPage}>
            {/* Page 1: Calendar + Upcoming Events */}
            <div className="h-full flex items-start justify-center px-8 pt-8 pb-2 overflow-hidden">
              <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-[1fr_320px] gap-6 animate-fade-in">
                <CalendarWidget
                  className="rounded-[var(--radius-lg)] bg-[var(--wallpaper-card-bg)] p-5"
                  style={glassStyle}
                />
                <UpcomingEvents
                  className="rounded-[var(--radius-lg)] bg-[var(--wallpaper-card-bg)] p-5"
                  style={glassStyle}
                />
              </div>
            </div>

            {/* Page 2: Empty for now */}
            <div className="h-full" />
          </SwipeablePages>
        </div>

        {/* Page dots */}
        <PageIndicator
          total={2}
          current={currentPage}
          onPageSelect={setCurrentPage}
        />

        {/* App dock — bottom */}
        <div className="pb-6 pt-1">
          <AppDock />
        </div>
      </div>
    </>
  )
}
