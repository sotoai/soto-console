'use client'

import { motion } from 'framer-motion'

const EASE = [0.16, 1, 0.3, 1] as const

export function YouAreHere() {
  const now = new Date()
  const dateStr = now.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <motion.div
      className="flex flex-col items-center gap-3 text-center"
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.8, ease: EASE }}
    >
      {/* Pulsing dot */}
      <motion.div
        className="w-3 h-3 rounded-full animate-pulse-glow"
        style={{ backgroundColor: '#67e8f9' }}
      />

      {/* Main text */}
      <h3 className="text-[24px] md:text-[28px] font-extralight text-white/85 tracking-[0.15em] uppercase">
        You Are Here
      </h3>

      {/* Date */}
      <span className="text-[10px] font-mono text-white/25 tabular-nums">
        {dateStr}
      </span>

      {/* Tagline */}
      <motion.p
        className="text-[12px] text-white/20 font-light italic mt-1"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        13.8 billion years later
      </motion.p>
    </motion.div>
  )
}
