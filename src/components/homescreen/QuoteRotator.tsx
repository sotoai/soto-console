'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Playfair_Display,
  Space_Mono,
  Permanent_Marker,
  Caveat,
} from 'next/font/google'
import { QUOTES, type QuoteFont } from './quotes'

// ─── Font loading ───

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
})

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
})

const permanentMarker = Permanent_Marker({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
})

const caveat = Caveat({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
})

// Map font key → className + styling
const FONT_STYLES: Record<QuoteFont, { className: string; textClass: string }> = {
  serif: {
    className: playfair.className,
    textClass: 'text-[16px] md:text-[20px] lg:text-[22px] italic font-normal leading-relaxed',
  },
  mono: {
    className: spaceMono.className,
    textClass: 'text-[13px] md:text-[15px] lg:text-[16px] font-normal leading-relaxed tracking-tight',
  },
  marker: {
    className: permanentMarker.className,
    textClass: 'text-[18px] md:text-[22px] lg:text-[26px] font-normal leading-snug',
  },
  caveat: {
    className: caveat.className,
    textClass: 'text-[22px] md:text-[28px] lg:text-[32px] font-bold leading-snug',
  },
  sans: {
    className: '',
    textClass: 'text-[16px] md:text-[20px] lg:text-[24px] font-black uppercase tracking-wider leading-tight',
  },
}

const ROTATE_INTERVAL = 10_000 // 10 seconds

// ─── Component ───

export function QuoteRotator() {
  // Shuffle once on mount to avoid always starting with the same quote
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
  const fontStyle = FONT_STYLES[quote.font]

  return (
    <div className="w-full flex items-center justify-center px-6 md:px-10" style={{ minHeight: 80 }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          className="text-center max-w-xl"
          initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <p
            className={`${fontStyle.className} ${fontStyle.textClass} text-white/70`}
            style={{
              textShadow: '0 1px 8px rgba(0,0,0,0.4)',
            }}
          >
            {quote.font === 'serif' ? `\u201C${quote.text}\u201D` : quote.text}
          </p>
          {quote.author && (
            <p
              className="mt-2 text-[11px] md:text-[12px] font-medium text-white/35 tracking-wide uppercase"
              style={{ textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}
            >
              {quote.author}
            </p>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
