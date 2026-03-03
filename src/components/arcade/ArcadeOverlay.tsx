'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'

interface ArcadeOverlayProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
}

export function ArcadeOverlay({ open, onClose, children }: ArcadeOverlayProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Escape key + lock body scroll
  useEffect(() => {
    if (!open) return

    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col"
          style={{ touchAction: 'none' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Background */}
          <motion.div
            className="absolute inset-0 bg-[#0a0f0a]"
            initial={{ scale: 1.02 }}
            animate={{ scale: 1 }}
            exit={{ scale: 1.02 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          />

          {/* Game content — fills viewport */}
          <div
            className="relative z-[1] w-full h-full"
            style={{
              paddingTop: 'max(0.5rem, env(safe-area-inset-top, 0.5rem))',
              paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom, 0.5rem))',
              paddingLeft: 'max(0.5rem, env(safe-area-inset-left, 0.5rem))',
              paddingRight: 'max(0.5rem, env(safe-area-inset-right, 0.5rem))',
            }}
          >
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
