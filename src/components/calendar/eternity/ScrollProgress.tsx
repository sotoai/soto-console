'use client'

import { motion, AnimatePresence } from 'framer-motion'
import type { EonLayout } from './timeline-data'

interface ScrollProgressProps {
  progress: number
  layouts: EonLayout[]
  currentEraIndex: number
}

export function ScrollProgress({ progress, layouts, currentEraIndex }: ScrollProgressProps) {
  const totalWidth = layouts.reduce((sum, l) => sum + l.width, 0)
  const currentEra = layouts[currentEraIndex]?.era

  return (
    <motion.div
      className="absolute left-6 right-6 z-20"
      style={{ bottom: 'max(1.25rem, env(safe-area-inset-bottom, 1.25rem))' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.8, duration: 0.6 }}
    >
      {/* Track */}
      <div className="relative h-[3px] rounded-full overflow-hidden bg-white/[0.06]">
        {/* Era color segments */}
        <div className="flex h-full">
          {layouts.map((layout, i) => (
            <div
              key={layout.era.id}
              className="transition-opacity duration-700"
              style={{
                flex: layout.width / totalWidth,
                backgroundColor: layout.era.color.accent,
                opacity: i === currentEraIndex ? 0.5 : 0.12,
              }}
            />
          ))}
        </div>

        {/* Sliding position indicator */}
        <div
          className="absolute top-1/2 w-2.5 h-2.5 rounded-full"
          style={{
            left: `${progress * 100}%`,
            backgroundColor: currentEra?.color.accent ?? '#67e8f9',
            boxShadow: `0 0 10px ${currentEra?.color.accent ?? '#67e8f9'}60`,
            transform: 'translate(-50%, -50%)',
            transition: 'left 0.08s linear, background-color 0.6s ease',
          }}
        />
      </div>

      {/* Current era label */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentEra?.id}
          className="mt-2 text-center"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.3 }}
        >
          <span
            className="text-[9px] font-mono tracking-[0.1em] uppercase transition-colors duration-500"
            style={{ color: currentEra?.color.accent ?? '#67e8f9', opacity: 0.5 }}
          >
            {currentEra?.label}
          </span>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}
