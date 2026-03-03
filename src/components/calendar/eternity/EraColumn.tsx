'use client'

import { motion, AnimatePresence } from 'framer-motion'
import type { Era, DetailLevel } from './timeline-data'
import { formatYearsAgo } from './timeline-data'
import { EraDetail } from './EraDetail'

interface EraColumnProps {
  era: Era
  index: number
  isSelected: boolean
  isAnySelected: boolean
  overviewFlex: number
  detailLevel?: DetailLevel
  onSelect: () => void
  onBack: () => void
  isLast?: boolean
}

export function EraColumn({
  era,
  index,
  isSelected,
  isAnySelected,
  overviewFlex,
  detailLevel = 'overview',
  onSelect,
  onBack,
}: EraColumnProps) {
  const flex = isSelected ? 8 : isAnySelected ? 0.3 : overviewFlex
  const showMarkers = detailLevel !== 'overview'
  const showLabels = detailLevel === 'labels' || detailLevel === 'full'
  const showDescriptions = detailLevel === 'full'

  // Hide text content when column is very narrow to prevent overlap
  const isTiny = !isSelected && overviewFlex < 0.5 && detailLevel === 'overview'

  return (
    <motion.div
      layout
      className="relative overflow-hidden cursor-pointer select-none group"
      style={{ flex, minWidth: 0 }}
      initial={{ opacity: 0, y: 16 }}
      animate={{
        opacity: isAnySelected && !isSelected ? 0.4 : 1,
        y: 0,
      }}
      transition={{
        opacity: { duration: 0.3 },
        y: { delay: index * 0.03, duration: 0.45, ease: [0.16, 1, 0.3, 1] },
        layout: { type: 'spring', stiffness: 250, damping: 28, mass: 0.8 },
      }}
      onClick={(e) => {
        e.stopPropagation()
        isSelected ? onBack() : onSelect()
      }}
    >
      {/* Gradient background — richer color presence */}
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          background: `linear-gradient(to bottom, ${era.color.from}80, ${era.color.to}40, transparent)`,
          opacity: isAnySelected && !isSelected ? 0.3 : 0.5,
        }}
      />

      {/* Accent glow at top */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] group-hover:h-[3px] transition-all duration-300"
        style={{
          background: `linear-gradient(to right, ${era.color.accent}40, ${era.color.accent}15)`,
        }}
      />

      {/* Left accent border — more visible */}
      <div
        className="absolute left-0 top-0 bottom-0 w-px opacity-[0.15] group-hover:opacity-[0.4] transition-opacity duration-300"
        style={{ backgroundColor: era.color.accent }}
      />

      {/* Bottom accent fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-16 opacity-[0.08]"
        style={{
          background: `linear-gradient(to top, ${era.color.accent}, transparent)`,
        }}
      />

      {/* Overview content — visible when not expanded */}
      <AnimatePresence>
        {!isSelected && (
          <motion.div
            className="relative z-10 flex flex-col items-center justify-center h-full py-6 px-1 gap-1.5 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
          >
            {/* Icon — slightly larger, more visible */}
            <span
              className="shrink-0 opacity-50 group-hover:opacity-90 transition-opacity duration-300"
              style={{ fontSize: showLabels ? '20px' : '16px' }}
            >
              {era.icon}
            </span>

            {/* Label — hidden when column is too narrow */}
            {!isTiny && (
              <span
                className="text-[9px] font-semibold text-white/30 uppercase tracking-[0.14em] whitespace-nowrap group-hover:text-white/70 transition-colors duration-300 max-h-full overflow-hidden"
                style={
                  showLabels
                    ? undefined
                    : { writingMode: 'vertical-lr', textOrientation: 'mixed' }
                }
              >
                {era.label}
              </span>
            )}

            {/* Years — only in overview, not compressed */}
            {!isAnySelected && !isTiny && (
              <motion.span
                className="text-[7px] text-white/20 whitespace-nowrap font-mono shrink-0"
                style={
                  showLabels
                    ? undefined
                    : { writingMode: 'vertical-lr', textOrientation: 'mixed' }
                }
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 + index * 0.03 }}
              >
                {formatYearsAgo(era.yearsAgo)}
              </motion.span>
            )}

            {/* Sub-event markers — appear at zoom detail levels */}
            {showMarkers && (
              <div className="flex flex-col gap-2 mt-3 w-full px-2 overflow-hidden">
                {era.subEvents.map((event, j) => (
                  <motion.div
                    key={event.label}
                    className="flex items-start gap-1.5 min-w-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 + j * 0.04 }}
                  >
                    {/* Dot marker — colored */}
                    <div
                      className="w-1.5 h-1.5 rounded-full shrink-0 mt-0.5"
                      style={{ backgroundColor: era.color.accent, opacity: 0.6 }}
                    />
                    <div className="min-w-0 flex-1">
                      {showLabels && (
                        <span className="block text-[9px] text-white/50 truncate leading-tight font-medium">
                          {event.label}
                        </span>
                      )}
                      {showDescriptions && (
                        <span className="block text-[7px] text-white/25 leading-snug mt-0.5">
                          {event.description}
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded detail — visible when selected */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            className="relative z-10 h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, delay: 0.12 }}
          >
            <EraDetail era={era} onBack={onBack} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
