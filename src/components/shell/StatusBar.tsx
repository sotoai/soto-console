'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Home } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { cn } from '@/lib/utils'

export function StatusBar() {
  const pathname = usePathname()
  const router = useRouter()
  const isHome = pathname === '/'
  const [time, setTime] = useState('')
  const [date, setDate] = useState('')

  useEffect(() => {
    function updateClock() {
      const now = new Date()
      setTime(
        now.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        })
      )
      setDate(
        now.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
        })
      )
    }

    updateClock()
    const interval = setInterval(updateClock, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <header
      className={cn(
        'flex items-center justify-between relative z-30 shrink-0 transition-colors duration-300',
        isHome
          ? 'bg-[var(--wallpaper-bar-bg)]'
          : 'bg-[var(--bg-primary)]'
      )}
      style={{
        height: 'var(--status-bar-h)',
        paddingLeft: 'var(--shell-padding-x)',
        paddingRight: 'var(--shell-padding-x)',
        ...(isHome
          ? { backdropFilter: 'blur(40px) saturate(180%)', WebkitBackdropFilter: 'blur(40px) saturate(180%)' }
          : { borderBottom: '0.5px solid var(--border-strong)' }
        ),
      }}
    >
      {/* Left: Home button (hidden on home screen) */}
      <div className="flex-1 min-w-0">
        {!isHome && (
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 px-3 min-h-[44px] rounded-[var(--radius-sm)] text-[14px] md:text-[15px] font-medium text-[var(--text-secondary)] active:text-[var(--text-primary)] active:bg-[var(--bg-tertiary)] transition-all duration-200 active:scale-95 cursor-pointer"
          >
            <Home size={16} strokeWidth={1.5} />
            <span className="hidden sm:inline">Home</span>
          </button>
        )}
      </div>

      {/* Center: Clock + Date */}
      <div className="flex items-center gap-2 md:gap-3 select-none">
        <span
          className={cn(
            'text-[15px] md:text-[17px] font-bold tracking-[-0.02em]',
            isHome ? 'text-[var(--wp-text)]' : 'text-[var(--text-primary)]'
          )}
          style={isHome ? { textShadow: 'var(--wp-shadow-strong)' } : undefined}
        >
          {time}
        </span>
        <span
          className={cn(
            'text-[11px] md:text-[13px] hidden sm:inline',
            isHome ? 'text-[var(--wp-text-secondary)]' : 'text-[var(--text-secondary)]'
          )}
          style={isHome ? { textShadow: 'var(--wp-shadow)' } : undefined}
        >
          {date}
        </span>
      </div>

      {/* Right: Theme toggle */}
      <div className="flex-1 min-w-0 flex justify-end">
        <ThemeToggle />
      </div>
    </header>
  )
}
