'use client'

import { useState, useCallback } from 'react'
import { launcherApps, type LauncherApp } from '@/config/launcher-apps'

function AppIcon({ app }: { app: LauncherApp }) {
  const [showBadge, setShowBadge] = useState(false)

  const handleTap = useCallback(() => {
    if (app.status === 'live' && app.url) {
      window.open(app.url, '_blank')
      return
    }
    // Coming soon pulse
    setShowBadge(true)
    setTimeout(() => setShowBadge(false), 1400)
  }, [app])

  return (
    <button
      onClick={handleTap}
      className="flex flex-col items-center cursor-pointer outline-none group"
      style={{ gap: '6px' }}
    >
      {/* Icon square */}
      <div className="relative">
        <div
          className={`bg-gradient-to-br ${app.gradient} flex items-center justify-center rounded-[var(--radius-md)] shadow-lg group-active:scale-90 transition-transform duration-200`}
          style={{
            width: 'var(--launcher-icon-size)',
            height: 'var(--launcher-icon-size)',
          }}
        >
          <span
            className="select-none"
            style={{ fontSize: 'calc(var(--launcher-icon-size) * 0.48)' }}
          >
            {app.emoji}
          </span>
        </div>

        {/* Coming Soon badge */}
        {showBadge && (
          <div
            className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded-full text-white font-semibold whitespace-nowrap animate-fade-in"
            style={{
              fontSize: '8px',
              background: 'rgba(0, 0, 0, 0.7)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              letterSpacing: '0.02em',
            }}
          >
            Soon
          </div>
        )}
      </div>

      {/* Label */}
      <span
        className="font-medium leading-tight text-center truncate max-w-[80px]"
        style={{
          fontSize: 'var(--launcher-label-size)',
          color: 'var(--wp-text-secondary)',
          textShadow: 'var(--wp-shadow)',
        }}
      >
        {app.name}
      </span>
    </button>
  )
}

export function AppLauncher() {
  return (
    <div
      className="h-full flex items-center justify-center"
      style={{ padding: 'var(--shell-padding-top) var(--shell-padding-x)' }}
    >
      <div
        className="grid animate-fade-in stagger"
        style={{
          gridTemplateColumns: `repeat(auto-fit, var(--launcher-icon-size))`,
          gap: 'var(--launcher-gap)',
          justifyContent: 'center',
          maxWidth: '400px',
        }}
      >
        {launcherApps.map(app => (
          <AppIcon key={app.id} app={app} />
        ))}
      </div>
    </div>
  )
}
