'use client'

import Link from 'next/link'
import { apps } from '@/lib/app-registry'

export function AppLauncher() {
  return (
    <div>
      <h2
        className="text-[15px] font-semibold text-white/70 mb-5"
        style={{ textShadow: '0 1px 4px rgba(0,0,0,0.15)' }}
      >
        Apps
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 stagger">
        {apps.map(app => (
          <Link
            key={app.id}
            href={app.basePath}
            className="group rounded-[var(--radius-lg)] bg-[var(--wallpaper-card-bg)] p-6 flex flex-col items-center gap-4 text-center min-h-[160px] justify-center active:scale-[0.97] transition-all duration-200 hover:brightness-105"
            style={{ border: '0.5px solid var(--wallpaper-card-border)', boxShadow: 'var(--wallpaper-card-shadow)', backdropFilter: 'blur(40px) saturate(180%)', WebkitBackdropFilter: 'blur(40px) saturate(180%)' }}
          >
            {/* Icon with gradient background */}
            <div
              className={`w-16 h-16 rounded-[var(--radius-xl)] bg-gradient-to-br ${app.gradient} flex items-center justify-center group-hover:scale-105 transition-transform duration-200`}
            >
              <app.icon size={30} className="text-white" strokeWidth={1.5} />
            </div>

            {/* App name */}
            <span className="text-[15px] font-semibold text-[var(--text-primary)]">
              {app.name}
            </span>

            {/* Description */}
            <span className="text-[13px] text-[var(--text-secondary)] leading-tight">
              {app.description}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
