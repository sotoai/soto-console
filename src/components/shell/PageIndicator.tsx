'use client'

import { motion } from 'framer-motion'

interface PageIndicatorProps {
  total: number
  current: number
  onPageSelect: (index: number) => void
}

export function PageIndicator({ total, current, onPageSelect }: PageIndicatorProps) {
  if (total <= 1) return null

  return (
    <div className="flex items-center justify-center gap-2 py-2">
      {Array.from({ length: total }, (_, i) => (
        <button
          key={i}
          onClick={() => onPageSelect(i)}
          className="relative w-[7px] h-[7px] cursor-pointer outline-none"
        >
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'var(--wp-text-tertiary)',
              opacity: 0.4,
            }}
          />
          {i === current && (
            <motion.div
              layoutId="homescreen-dot"
              className="absolute inset-[-1px] rounded-full"
              style={{ background: 'var(--wp-text)' }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
        </button>
      ))}
    </div>
  )
}
