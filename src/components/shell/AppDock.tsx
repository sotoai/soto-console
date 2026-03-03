'use client'

import Link from 'next/link'
import { apps } from '@/lib/app-registry'

export function AppDock() {
  if (apps.length === 0) return null

  return (
    <div className="flex justify-center">
      <div
        className="inline-flex items-center gap-5 px-6 py-3 rounded-[var(--radius-xl)]"
        style={{
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
            className="flex flex-col items-center gap-1.5 group"
          >
            {/* App icon */}
            <div
              className={`w-12 h-12 rounded-[var(--radius-md)] bg-gradient-to-br ${app.gradient} flex items-center justify-center group-hover:scale-110 group-active:scale-95 transition-transform duration-200 shadow-md`}
            >
              <app.icon size={22} className="text-white" strokeWidth={1.5} />
            </div>
            {/* App name */}
            <span
              className="text-[10px] font-medium text-[var(--wp-text-secondary)]"
              style={{ textShadow: 'var(--wp-shadow)' }}
            >
              {app.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
