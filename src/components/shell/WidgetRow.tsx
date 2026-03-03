'use client'

import { apps } from '@/lib/app-registry'

export function WidgetRow() {
  if (apps.length === 0) return null

  return (
    <div>
      <h2
        className="text-[15px] font-semibold text-white/70 mb-5"
        style={{ textShadow: '0 1px 4px rgba(0,0,0,0.15)' }}
      >
        At a Glance
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 stagger">
        {apps.map(app => (
          <app.widget key={app.id} className="rounded-[var(--radius-lg)] bg-[var(--wallpaper-card-bg)] p-5" style={{ border: '0.5px solid var(--wallpaper-card-border)', boxShadow: 'var(--wallpaper-card-shadow)', backdropFilter: 'blur(40px) saturate(180%)', WebkitBackdropFilter: 'blur(40px) saturate(180%)' }} />
        ))}
      </div>
    </div>
  )
}
