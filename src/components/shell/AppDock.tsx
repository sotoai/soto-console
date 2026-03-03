'use client'

import Link from 'next/link'
import { apps } from '@/lib/app-registry'

export function AppDock() {
  if (apps.length === 0) return null

  return (
    <div className="flex justify-center">
      <div
        className="inline-flex items-center rounded-[var(--radius-xl)]"
        style={{
          gap: 'var(--dock-gap)',
          padding: `var(--dock-padding-y) var(--dock-padding-x)`,
          background: 'var(--wallpaper-bar-bg)',
          border: '0.5px solid var(--wallpaper-card-border)',
          backdropFilter: 'blur(40px) saturate(180%)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          boxShadow: 'var(--wallpaper-card-shadow)',
        }}
      >
        {apps.map(app => (
          <Link
            key={app.id}
            href={app.basePath}
            className="flex flex-col items-center gap-1 group"
          >
            {/* App icon */}
            <div
              className={`rounded-[var(--radius-md)] bg-gradient-to-br ${app.gradient} flex items-center justify-center group-active:scale-95 transition-transform duration-200 shadow-md`}
              style={{ width: 'var(--dock-icon-size)', height: 'var(--dock-icon-size)' }}
            >
              <app.icon
                className="text-white"
                strokeWidth={1.5}
                style={{
                  width: 'calc(var(--dock-icon-size) * 0.46)',
                  height: 'calc(var(--dock-icon-size) * 0.46)',
                }}
              />
            </div>
            {/* App name — hidden in mobile landscape via --dock-label-size: 0px */}
            <span
              className="font-medium text-[var(--wp-text-secondary)] leading-tight"
              style={{
                fontSize: 'var(--dock-label-size)',
                textShadow: 'var(--wp-shadow)',
              }}
            >
              {app.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
