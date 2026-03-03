'use client'

import { motion } from 'framer-motion'
import type { EonLayout } from './timeline-data'
import { formatYearsAgo } from './timeline-data'

interface EonSectionProps {
  layout: EonLayout
  index: number
}

const EASE = [0.16, 1, 0.3, 1] as const

/**
 * Distribute sub-events evenly across the section width,
 * inset 15% from each edge so dots don't crowd the borders.
 */
function subEventLeft(i: number, total: number): string {
  const pad = 15
  const usable = 100 - 2 * pad
  const pct = total <= 1 ? 50 : pad + (i / (total - 1)) * usable
  return `${pct}%`
}

export function EonSection({ layout, index }: EonSectionProps) {
  const { era, width } = layout

  return (
    <section
      className="relative shrink-0 flex flex-col"
      style={{ width, minWidth: width, height: '100%' }}
    >
      {/* Full-height background gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom, ${era.color.from}90, ${era.color.to}50, transparent)`,
        }}
      />

      {/* Top accent glow line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: `linear-gradient(to right, transparent, ${era.color.accent}30, transparent)`,
        }}
      />

      {/* Left divider line */}
      {index > 0 && (
        <div
          className="absolute left-0 top-0 bottom-0 w-px"
          style={{ backgroundColor: era.color.accent, opacity: 0.1 }}
        />
      )}

      {/* ─── Main cinematic content ─── */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 md:px-16 text-center">
        {/* Step 1: Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 0.7, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="mb-6"
          style={{
            fontSize: index < 3 ? '64px' : '48px',
            textShadow: `0 0 24px ${era.color.accent}40`,
          }}
        >
          {era.icon}
        </motion.div>

        {/* Step 2: Era name — cinematic title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ delay: 0.15, duration: 0.5, ease: EASE }}
          className="text-[28px] md:text-[36px] font-extralight text-white/90 tracking-[0.12em] uppercase leading-tight mb-3"
        >
          {era.label}
        </motion.h2>

        {/* Step 3: Years ago */}
        <motion.span
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.3 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="text-[11px] font-mono text-white tabular-nums mb-6"
        >
          {formatYearsAgo(era.yearsAgo)} years ago
        </motion.span>

        {/* Step 4: Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ delay: 0.35, duration: 0.5, ease: EASE }}
          className="text-[15px] md:text-[17px] text-white/50 italic font-light mb-6"
        >
          {era.description}
        </motion.p>

        {/* Step 5: Detail text */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-[13px] md:text-[14px] text-white/30 leading-[1.9] max-w-md font-light"
        >
          {era.detail}
        </motion.p>
      </div>

      {/* ─── Sub-event waypoints along the bottom ─── */}
      <div className="relative z-10 h-28 md:h-36 shrink-0 mx-4 md:mx-8">
        {/* Horizontal guide line */}
        <div
          className="absolute top-3 left-[15%] right-[15%] h-px"
          style={{ backgroundColor: era.color.accent, opacity: 0.08 }}
        />

        {era.subEvents.map((event, j) => (
          <motion.div
            key={event.label}
            className="absolute top-0 -translate-x-1/2 flex flex-col items-center max-w-[160px]"
            style={{ left: subEventLeft(j, era.subEvents.length) }}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{
              delay: 0.6 + j * 0.08,
              duration: 0.4,
              ease: EASE,
            }}
          >
            {/* Dot */}
            <div
              className="w-[6px] h-[6px] rounded-full mb-2"
              style={{ backgroundColor: era.color.accent, opacity: 0.6 }}
            />

            {/* Label */}
            <span className="text-[10px] md:text-[11px] font-medium text-white/55 text-center leading-tight mb-0.5">
              {event.label}
            </span>

            {/* Description */}
            <span className="text-[8px] md:text-[9px] text-white/25 text-center leading-snug">
              {event.description}
            </span>
          </motion.div>
        ))}
      </div>

    </section>
  )
}
