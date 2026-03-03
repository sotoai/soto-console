'use client'

import { motion } from 'framer-motion'
import { MapPin } from 'lucide-react'

export function YouAreHere() {
  const now = new Date()
  const dateStr = now.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <motion.div
      className="relative flex flex-col items-center"
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Map pin */}
      <div className="relative text-[var(--accent,#67e8f9)]">
        <MapPin size={18} strokeWidth={2} className="fill-current opacity-80" />
        {/* Subtle glow behind the pin */}
        <div
          className="absolute inset-0 blur-[6px] opacity-30"
          style={{ color: 'inherit' }}
        >
          <MapPin size={18} strokeWidth={2} className="fill-current" />
        </div>
      </div>

      {/* Label below the pin */}
      <div className="flex flex-col items-center mt-0.5">
        <span className="text-[9px] font-semibold text-white/60 tracking-[0.04em]">
          You Are Here
        </span>
        <span className="text-[7px] text-white/20 font-mono tabular-nums">
          {dateStr}
        </span>
      </div>
    </motion.div>
  )
}
