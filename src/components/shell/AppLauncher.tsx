'use client'

import { useState, useCallback, lazy, Suspense } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { launcherApps, type LauncherApp } from '@/config/launcher-apps'

// Lazy-load app components
const appComponents: Record<string, React.ComponentType<{ onClose: () => void }>> = {
  'screaming-chicken': lazy(() => import('@/components/apps/ScreamingChickenApp')),
}

function AppIcon({ app, onOpen }: { app: LauncherApp; onOpen: (id: string) => void }) {
  const [showBadge, setShowBadge] = useState(false)

  const handleTap = useCallback(() => {
    // Has a built-in component → open as overlay
    if (app.status === 'live' && appComponents[app.id]) {
      onOpen(app.id)
      return
    }
    // Has an external URL → open in new tab
    if (app.status === 'live' && app.url) {
      window.open(app.url, '_blank')
      return
    }
    // Coming soon pulse
    setShowBadge(true)
    setTimeout(() => setShowBadge(false), 1400)
  }, [app, onOpen])

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
  const [openAppId, setOpenAppId] = useState<string | null>(null)

  const handleOpen = useCallback((id: string) => setOpenAppId(id), [])
  const handleClose = useCallback(() => setOpenAppId(null), [])

  const ActiveComponent = openAppId ? appComponents[openAppId] : null

  return (
    <>
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
            <AppIcon key={app.id} app={app} onOpen={handleOpen} />
          ))}
        </div>
      </div>

      {/* Fullscreen app overlay */}
      <AnimatePresence>
        {ActiveComponent && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed inset-0 z-50"
          >
            <Suspense
              fallback={
                <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
                  <span className="text-white/50 text-sm">Loading...</span>
                </div>
              }
            >
              <ActiveComponent onClose={handleClose} />
            </Suspense>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
