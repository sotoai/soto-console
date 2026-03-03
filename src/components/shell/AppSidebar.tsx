'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ChevronLeft } from 'lucide-react'
import type { AppManifest } from '@/types'

interface AppSidebarProps {
  app: AppManifest
}

export function AppSidebar({ app }: AppSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <aside
      className="fixed left-0 top-[44px] bottom-0 w-[240px] bg-[var(--sidebar-bg)] flex flex-col z-40"
      style={{ borderRight: '0.5px solid var(--sidebar-border)' }}
    >
      {/* App Header */}
      <div className="px-4 h-[56px] flex items-center gap-3">
        <button
          onClick={() => router.push('/')}
          className="w-8 h-8 rounded-[var(--radius-sm)] bg-[var(--bg-tertiary)] flex items-center justify-center hover:bg-[var(--border-strong)] transition-colors duration-200 active:scale-95 cursor-pointer"
        >
          <ChevronLeft size={15} className="text-[var(--text-muted)]" strokeWidth={1.5} />
        </button>
        <div className="w-7 h-7 rounded-[8px] bg-[var(--accent)] flex items-center justify-center">
          <app.icon size={14} className="text-white" />
        </div>
        <span className="font-semibold text-[15px] tracking-[-0.01em] text-[var(--text-primary)]">
          {app.name}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 pt-1 space-y-0.5">
        {app.navItems.map(item => {
          const fullHref = item.href === '/'
            ? app.basePath
            : `${app.basePath}${item.href}`
          const isActive = pathname === fullHref ||
            (item.href !== '/' && pathname.startsWith(fullHref))

          return (
            <Link
              key={item.href}
              href={fullHref}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-sm)] text-[14px] font-medium transition-all duration-200',
                isActive
                  ? 'bg-[var(--sidebar-active-bg)] text-[var(--accent)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
              )}
            >
              <item.icon size={18} strokeWidth={isActive ? 1.8 : 1.5} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 flex items-center">
        <span className="text-[11px] text-[var(--text-muted)] tracking-wide uppercase">
          HomeBase
        </span>
      </div>
    </aside>
  )
}
