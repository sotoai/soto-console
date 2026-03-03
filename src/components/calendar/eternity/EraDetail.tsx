'use client'

import { motion } from 'framer-motion'
import type { Era } from './timeline-data'
import { formatYearsAgo } from './timeline-data'

interface EraDetailProps {
  era: Era
  onBack: () => void
}

export function EraDetail({ era, onBack }: EraDetailProps) {
  return (
    <div className="flex flex-col h-full px-8 py-6 overflow-y-auto">
      {/* Back */}
      <motion.button
        onClick={(e) => { e.stopPropagation(); onBack() }}
        className="text-[10px] text-white/25 hover:text-white/60 transition-colors duration-200 mb-8 self-start cursor-pointer uppercase tracking-[0.15em] font-medium"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        ← back
      </motion.button>

      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <span className="text-[24px] block mb-4 opacity-60">{era.icon}</span>

        <h2 className="text-[20px] font-semibold text-white/90 tracking-[-0.01em] mb-1">
          {era.label}
        </h2>

        <p className="text-[11px] font-mono text-white/25 tabular-nums mb-5">
          {formatYearsAgo(era.yearsAgo)} years ago
        </p>

        <p className="text-[13px] text-white/50 leading-[1.7] max-w-lg">
          {era.detail}
        </p>
      </motion.div>

      {/* Sub-events */}
      <div className="flex flex-col gap-5 max-w-lg">
        {era.subEvents.map((event, i) => (
          <motion.div
            key={event.label}
            className="flex items-start gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 + i * 0.06 }}
          >
            {/* Tiny dot */}
            <div
              className="w-1 h-1 rounded-full mt-[7px] shrink-0 opacity-50"
              style={{ backgroundColor: era.color.accent }}
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-[12px] font-medium text-white/70">
                  {event.label}
                </span>
                <span className="text-[9px] font-mono text-white/20 tabular-nums">
                  {formatYearsAgo(event.yearsAgo)}
                </span>
              </div>
              <p className="text-[11px] text-white/35 mt-0.5 leading-[1.6]">
                {event.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
