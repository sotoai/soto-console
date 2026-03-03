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
    <div className="flex items-center justify-center py-0 shrink-0">
      {Array.from({ length: total }, (_, i) => (
        <button
          key={i}
          onClick={() => onPageSelect(i)}
          className="relative cursor-pointer outline-none flex items-center justify-center"
          style={{ width: 44, height: 44 }}
        >
          <div
            className="rounded-full"
            style={{
              width: 'var(--page-dot-size)',
              height: 'var(--page-dot-size)',
              background: 'var(--wp-text-tertiary)',
              opacity: 0.4,
            }}
          />
          {i === current && (
            <motion.div
              layoutId="homescreen-dot"
              className="absolute rounded-full"
              style={{
                width: 'calc(var(--page-dot-size) + 2px)',
                height: 'calc(var(--page-dot-size) + 2px)',
                background: 'var(--wp-text)',
                top: '50%',
                left: '50%',
                x: '-50%',
                y: '-50%',
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
        </button>
      ))}
    </div>
  )
}
