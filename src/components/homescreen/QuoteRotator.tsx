'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Inter } from 'next/font/google'
import { QUOTES } from './quotes'

const inter = Inter({
  subsets: ['latin'],
  weight: ['300'],
  display: 'swap',
})

const ROTATE_INTERVAL = 10_000 // 10 seconds

export function QuoteRotator() {
  const shuffled = useMemo(() => {
    const arr = [...QUOTES]
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
  }, [])

  const [index, setIndex] = useState(0)

  const advance = useCallback(() => {
    setIndex(prev => (prev + 1) % shuffled.length)
  }, [shuffled.length])

  useEffect(() => {
    const timer = setInterval(advance, ROTATE_INTERVAL)
    return () => clearInterval(timer)
  }, [advance])

  const quote = shuffled[index]

  return (
    <div className="w-full flex items-center justify-center px-6 md:px-10" style={{ minHeight: 80 }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          className="text-center max-w-2xl"
          initial={{ opacity: 0, y: 6, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -6, filter: 'blur(4px)' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <p
            className={`${inter.className} text-[15px] md:text-[17px] lg:text-[19px] font-light leading-relaxed tracking-wide text-white/60`}
            style={{ textShadow: '0 1px 12px rgba(0,0,0,0.3)' }}
          >
            {quote.text}
          </p>
          {quote.author && (
            <p
              className={`${inter.className} mt-3 text-[10px] md:text-[11px] font-light text-white/25 tracking-[0.2em] uppercase`}
              style={{ textShadow: '0 1px 4px rgba(0,0,0,0.2)' }}
            >
              {quote.author}
            </p>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
