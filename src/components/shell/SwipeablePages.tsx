'use client'

import { useState, useEffect, useRef, type ReactNode } from 'react'
import { motion, useMotionValue, animate, type PanInfo } from 'framer-motion'

interface SwipeablePagesProps {
  children: ReactNode[]
  currentPage: number
  onPageChange: (page: number) => void
}

export function SwipeablePages({ children, currentPage, onPageChange }: SwipeablePagesProps) {
  const x = useMotionValue(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const [pageWidth, setPageWidth] = useState(0)

  useEffect(() => {
    const updateWidth = () => setPageWidth(window.innerWidth)
    updateWidth()
    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [])

  useEffect(() => {
    if (pageWidth > 0) {
      animate(x, -currentPage * pageWidth, {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      })
    }
  }, [currentPage, pageWidth, x])

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const offset = info.offset.x
    const velocity = info.velocity.x
    const threshold = pageWidth * 0.15

    let newPage = currentPage
    if (offset < -threshold || velocity < -500) {
      newPage = Math.min(currentPage + 1, children.length - 1)
    } else if (offset > threshold || velocity > 500) {
      newPage = Math.max(currentPage - 1, 0)
    }

    onPageChange(newPage)
    animate(x, -newPage * pageWidth, {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    })
  }

  if (!pageWidth) return null

  return (
    <div ref={containerRef} className="w-full h-full overflow-hidden">
      <motion.div
        className="flex h-full"
        style={{ x, width: children.length * pageWidth }}
        drag="x"
        dragConstraints={{
          left: -(children.length - 1) * pageWidth,
          right: 0,
        }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        dragMomentum={false}
      >
        {children.map((child, i) => (
          <div
            key={i}
            style={{ width: pageWidth, flexShrink: 0 }}
            className="h-full"
          >
            {child}
          </div>
        ))}
      </motion.div>
    </div>
  )
}
