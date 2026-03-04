'use client'

import { useState, useCallback } from 'react'
import { CalendarWidget } from '@/components/calendar/CalendarWidget'
import { UpcomingEvents } from '@/components/calendar/UpcomingEvents'
import { ArcadePanel } from '@/components/arcade/ArcadePanel'
import { Leaderboard } from '@/components/arcade/Leaderboard'
import { QuoteRotator } from '@/components/homescreen/QuoteRotator'
import { WorldMap } from '@/components/map/WorldMap'
import { AppDock } from '@/components/shell/AppDock'
import { SwipeablePages } from '@/components/shell/SwipeablePages'
import { PageIndicator } from '@/components/shell/PageIndicator'
import { useRealtimeEvents } from '@/hooks/useRealtimeEvents'

const glassStyle = {
  border: '0.5px solid var(--wallpaper-card-border)',
  boxShadow: 'var(--wallpaper-card-shadow)',
  backdropFilter: 'blur(40px) saturate(180%)',
  WebkitBackdropFilter: 'blur(40px) saturate(180%)',
} as React.CSSProperties

export default function HomePage() {
  const [currentPage, setCurrentPage] = useState(0)
  const [scoreRefresh, setScoreRefresh] = useState(0)
  const { onlineUsers, leaderboardVersion, isConnected } = useRealtimeEvents()

  const handleScoreSubmitted = useCallback(() => {
    setScoreRefresh(Date.now())
  }, [])

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
            {/* Page 1: Calendar + Upcoming Events + Quote */}
            <div
              className="h-full flex flex-col items-center justify-start overflow-y-auto md:overflow-hidden"
              style={{ padding: 'var(--shell-padding-top) var(--shell-padding-x) 0.5rem' }}
            >
              <div
                className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-[1fr_280px] lg:grid-cols-[1fr_320px] animate-fade-in md:flex-1 md:min-h-0"
                style={{ gap: 'var(--shell-gap)' }}
              >
                <CalendarWidget
                  className="rounded-[var(--radius-lg)] bg-[var(--wallpaper-card-bg)] p-4 md:p-5 flex flex-col"
                  style={glassStyle}
                />
                <UpcomingEvents
                  className="rounded-[var(--radius-lg)] bg-[var(--wallpaper-card-bg)] p-4 md:p-5 flex flex-col"
                  style={glassStyle}
                />
              </div>

              {/* Rotating quote — ambient text over wallpaper */}
              <div className="mt-4 md:mt-6 w-full max-w-5xl animate-fade-in shrink-0">
                <QuoteRotator />
              </div>
            </div>

            {/* Page 2: Arcade + Leaderboard */}
            <div
              className="h-full flex items-start justify-center overflow-y-auto"
              style={{ padding: 'var(--shell-padding-top) var(--shell-padding-x) 0.5rem' }}
            >
              <div
                className="w-full max-w-5xl animate-fade-in h-full flex flex-col md:flex-row"
                style={{ gap: 'var(--shell-gap)' }}
              >
                <ArcadePanel
                  className="rounded-[var(--radius-lg)] bg-[var(--wallpaper-card-bg)] p-4 md:p-5 h-full flex-1 min-w-0"
                  style={glassStyle}
                  onScoreSubmitted={handleScoreSubmitted}
                />
                <Leaderboard
                  refreshTrigger={scoreRefresh + leaderboardVersion}
                  onlineUsers={onlineUsers}
                  isConnected={isConnected}
                  className="rounded-[var(--radius-lg)] bg-[var(--wallpaper-card-bg)] p-4 md:p-5 w-full md:w-72 lg:w-80 shrink-0 flex flex-col"
                  style={glassStyle}
                />
              </div>
            </div>
            {/* Page 3: World Map */}
            <div className="h-full">
              <WorldMap className="w-full h-full" />
            </div>
          </SwipeablePages>
        </div>

        {/* Page dots */}
        <PageIndicator
          total={3}
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
