'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const DAY_GRADIENT = 'linear-gradient(135deg, #4A90D9 0%, #87CEEB 100%)'
const NIGHT_GRADIENT = 'linear-gradient(135deg, #0F1729 0%, #1a1f3e 100%)'

/* ---- Tiny cloud shapes for the day scene ---- */
function Clouds() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="absolute inset-0"
    >
      {/* Cloud 1 — upper right area */}
      <div
        className="absolute bg-white/60 rounded-full"
        style={{ width: 10, height: 5, top: 4, right: 8 }}
      />
      <div
        className="absolute bg-white/50 rounded-full"
        style={{ width: 7, height: 4, top: 2, right: 12 }}
      />
      {/* Cloud 2 — lower center-right */}
      <div
        className="absolute bg-white/40 rounded-full"
        style={{ width: 8, height: 4, bottom: 5, right: 16 }}
      />
    </motion.div>
  )
}

/* ---- Tiny star dots for the night scene ---- */
function Stars() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, delay: 0.15 }}
      className="absolute inset-0"
    >
      <div
        className="absolute w-[2px] h-[2px] rounded-full bg-white animate-twinkle"
        style={{ top: 6, left: 10 }}
      />
      <div
        className="absolute w-[1.5px] h-[1.5px] rounded-full bg-white/80 animate-twinkle"
        style={{ top: 14, left: 18, animationDelay: '0.7s' }}
      />
      <div
        className="absolute w-[2px] h-[2px] rounded-full bg-white/90 animate-twinkle"
        style={{ top: 5, left: 24, animationDelay: '1.3s' }}
      />
      <div
        className="absolute w-[1.5px] h-[1.5px] rounded-full bg-white/60 animate-twinkle"
        style={{ top: 16, left: 8, animationDelay: '0.4s' }}
      />
    </motion.div>
  )
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const isDark = theme === 'dark'

  // Placeholder while hydrating — matches final toggle size
  if (!mounted) {
    return <div className="w-[52px] h-[26px] rounded-full bg-white/10" />
  }

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="relative w-[52px] h-[26px] rounded-full overflow-hidden cursor-pointer shrink-0 border-0 p-0 outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-1 active:scale-95 transition-transform duration-150"
      aria-label="Toggle theme"
    >
      {/* Background gradient — cross-fades between day/night */}
      <div
        className="absolute inset-0 transition-all duration-500 ease-in-out"
        style={{ background: isDark ? NIGHT_GRADIENT : DAY_GRADIENT }}
      />

      {/* Subtle inner border for depth */}
      <div className="absolute inset-0 rounded-full border border-white/15" />

      {/* Scene elements */}
      <AnimatePresence mode="wait">
        {isDark ? <Stars key="stars" /> : <Clouds key="clouds" />}
      </AnimatePresence>

      {/* Sliding thumb — the sun or moon */}
      <motion.div
        className="absolute top-[3px] left-[3px] w-5 h-5 rounded-full"
        animate={{ x: isDark ? 26 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
        {/* Sun / Moon body */}
        <div
          className="w-full h-full rounded-full transition-all duration-500 relative overflow-hidden"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, #e8e8e8 0%, #c8c8d0 100%)'
              : 'linear-gradient(135deg, #FFD93D 0%, #FF8E42 100%)',
            boxShadow: isDark
              ? '0 0 6px rgba(200, 200, 220, 0.3)'
              : '0 0 8px rgba(255, 180, 50, 0.5)',
          }}
        >
          {/* Crescent shadow for moon — slides in when dark */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 14,
              height: 14,
              top: -2,
              left: -3,
              background: isDark ? '#1a1f3e' : 'transparent',
            }}
            animate={{
              opacity: isDark ? 1 : 0,
              x: isDark ? 0 : -6,
            }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          />
        </div>
      </motion.div>
    </button>
  )
}
