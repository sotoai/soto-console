'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { EternityTimeline } from './EternityTimeline'

interface EternityOverlayProps {
  open: boolean
  onClose: () => void
}

export function EternityOverlay({ open, onClose }: EternityOverlayProps) {
  const [mounted, setMounted] = useState(false)

  // Wait for client mount so createPortal has a target
  useEffect(() => {
    setMounted(true)
  }, [])

  // Escape key handler + lock body scroll
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
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{ touchAction: 'none' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Background */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse at 50% 50%, #0a0a1a 0%, #050510 70%)',
            }}
            initial={{ scale: 1.02 }}
            animate={{ scale: 1 }}
            exit={{ scale: 1.02 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 z-10 p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/80 transition-all duration-200 cursor-pointer"
          >
            <X size={20} strokeWidth={1.5} />
          </button>

          {/* Title — top center */}
          <motion.div
            className="absolute top-6 left-0 right-0 text-center z-10"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <h2 className="text-[13px] font-semibold text-white/30 uppercase tracking-[0.2em]">
              The Timeline of Everything
            </h2>
          </motion.div>

          {/* Timeline */}
          <div className="relative w-full h-full z-[1]">
            <EternityTimeline />
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
