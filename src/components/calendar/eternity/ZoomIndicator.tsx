'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ZoomIndicatorProps {
  scale: number
  isZoomed: boolean
  onReset: () => void
}

export function ZoomIndicator({ scale, isZoomed, onReset }: ZoomIndicatorProps) {
  const [visible, setVisible] = useState(false)
  const [lastScale, setLastScale] = useState(scale)

  // Show indicator when zoom changes, auto-hide after 1.5s of no change
  useEffect(() => {
    if (Math.abs(scale - lastScale) > 0.01) {
      setVisible(true)
      setLastScale(scale)
    }

    const timer = setTimeout(() => setVisible(false), 1500)
    return () => clearTimeout(timer)
  }, [scale, lastScale])

  // Always show when zoomed and user might need the reset button
  const show = isZoomed && (visible || scale > 1.2)

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          onClick={(e) => {
            e.stopPropagation()
            onReset()
          }}
          className="absolute bottom-14 left-4 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-sm cursor-pointer select-none transition-colors"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
        >
          <span className="text-[9px] font-mono text-white/40 tabular-nums">
            {scale.toFixed(1)}x
          </span>
          <span className="text-[8px] text-white/25">
            reset
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  )
}
