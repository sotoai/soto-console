'use client'

import { useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Pause, Play, Maximize2, Minimize2 } from 'lucide-react'
import { useDrag } from '@use-gesture/react'
import { useNoodlerEngine, type NoodlerSnapshot } from './useNoodlerEngine'
import type { Direction } from './noodler-config'
import type { GameComponentProps } from '../types'

interface NoodlerGameProps extends GameComponentProps {
  initialState?: NoodlerSnapshot
  onStateChange?: (snapshot: NoodlerSnapshot) => void
}

export function NoodlerGame({
  isFullscreen,
  onExpand,
  onCollapse,
  initialState,
  onStateChange,
  onScoreSubmit,
}: NoodlerGameProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasContainerRef = useRef<HTMLDivElement>(null)
  const scoreSubmittedRef = useRef(false)

  const {
    canvasRef,
    gameState,
    score,
    highScore,
    start,
    pause,
    resume,
    restart,
    setDirection,
    render,
    getSnapshot,
  } = useNoodlerEngine(initialState)

  // Observe container size and re-render canvas
  useEffect(() => {
    const el = canvasContainerRef.current
    if (!el) return

    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        if (width > 0 && height > 0) {
          render(width, height)
        }
      }
    })

    observer.observe(el)
    return () => observer.disconnect()
  }, [render])

  // Initial render
  useEffect(() => {
    const el = canvasContainerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    if (rect.width > 0 && rect.height > 0) {
      render(rect.width, rect.height)
    }
  }, [render])

  // Submit score to leaderboard on gameover
  useEffect(() => {
    if (gameState === 'gameover' && score > 0 && !scoreSubmittedRef.current) {
      scoreSubmittedRef.current = true
      onScoreSubmit?.('noodler', score)
    }
    if (gameState === 'playing') {
      scoreSubmittedRef.current = false
    }
  }, [gameState, score, onScoreSubmit])

  const handleCanvasTap = useCallback(() => {
    if (gameState === 'idle') start()
    else if (gameState === 'gameover') restart()
  }, [gameState, start, restart])

  // Swipe controls — works with both touch and mouse
  const bind = useDrag(
    ({ movement: [mx, my], first, memo, tap }) => {
      if (tap) {
        handleCanvasTap()
        return
      }
      if (first) return [0, 0]
      const dx = mx - (memo?.[0] ?? 0)
      const dy = my - (memo?.[1] ?? 0)
      const threshold = 15

      if (Math.abs(dx) > threshold || Math.abs(dy) > threshold) {
        let dir: Direction
        if (Math.abs(dx) > Math.abs(dy)) {
          dir = dx > 0 ? 'right' : 'left'
        } else {
          dir = dy > 0 ? 'down' : 'up'
        }
        setDirection(dir)
        return [mx, my]
      }
      return memo
    },
    { filterTaps: true }
  )

  const handlePauseToggle = useCallback(() => {
    if (gameState === 'playing') pause()
    else if (gameState === 'paused') resume()
  }, [gameState, pause, resume])

  const handleExpand = useCallback(() => {
    if (gameState === 'playing') pause()
    onStateChange?.(getSnapshot())
    onExpand?.()
  }, [gameState, pause, onExpand, onStateChange, getSnapshot])

  const handleCollapse = useCallback(() => {
    if (gameState === 'playing') pause()
    onStateChange?.(getSnapshot())
    onCollapse?.()
  }, [gameState, pause, onCollapse, onStateChange, getSnapshot])

  return (
    <div
      ref={containerRef}
      className="flex flex-col w-full h-full select-none"
      onPointerDown={e => e.stopPropagation()}
      style={{ touchAction: 'none' }}
    >
      {/* HUD */}
      <div className="flex items-center justify-between px-2 shrink-0" style={{ height: 40 }}>
        <div className="flex items-center gap-3">
          <span className="text-[13px] font-mono tabular-nums font-semibold text-[var(--wp-text)]">
            {score}
          </span>
          <span className="text-[11px] font-mono tabular-nums text-[var(--wp-text-tertiary)]">
            HI {highScore}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {(gameState === 'playing' || gameState === 'paused') && (
            <button
              onClick={handlePauseToggle}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center text-[var(--wp-text-secondary)] active:text-[var(--wp-text)] cursor-pointer"
            >
              {gameState === 'playing' ? (
                <Pause size={16} strokeWidth={1.5} />
              ) : (
                <Play size={16} strokeWidth={1.5} />
              )}
            </button>
          )}
          {isFullscreen ? (
            <button
              onClick={handleCollapse}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center text-[var(--wp-text-secondary)] active:text-[var(--wp-text)] cursor-pointer"
            >
              <Minimize2 size={16} strokeWidth={1.5} />
            </button>
          ) : (
            <button
              onClick={handleExpand}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center text-[var(--wp-text-secondary)] active:text-[var(--wp-text)] cursor-pointer"
            >
              <Maximize2 size={16} strokeWidth={1.5} />
            </button>
          )}
        </div>
      </div>

      {/* Canvas + overlays */}
      <div
        ref={canvasContainerRef}
        className="flex-1 min-h-0 relative overflow-hidden rounded-[var(--radius-sm)]"
        {...bind()}
        onClick={handleCanvasTap}
        role="button"
        tabIndex={0}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0"
        />

        {/* Idle overlay */}
        <AnimatePresence>
          {gameState === 'idle' && (
            <motion.div
              className="absolute inset-0 flex flex-col items-center justify-center z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-center">
                <p className="text-[28px] md:text-[36px] font-bold text-green-400 mb-2 tracking-tight">
                  🐍
                </p>
                <p className="text-[18px] md:text-[22px] font-bold text-white/90 mb-1 tracking-tight">
                  Noodler
                </p>
                <p className="text-[12px] text-white/40 font-medium">
                  Tap to play
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Paused overlay */}
        <AnimatePresence>
          {gameState === 'paused' && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center z-10 bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => { e.stopPropagation(); resume() }}
            >
              <div className="text-center">
                <Play size={32} className="text-white/60 mx-auto mb-2" strokeWidth={1.5} />
                <p className="text-[13px] text-white/40 font-medium">
                  Tap to resume
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Game over overlay */}
        <AnimatePresence>
          {gameState === 'gameover' && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center z-10 bg-black/60"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="text-center">
                <p className="text-[20px] md:text-[24px] font-bold text-white/90 mb-1">
                  Game Over
                </p>
                <p className="text-[32px] md:text-[40px] font-bold text-green-400 tabular-nums mb-1">
                  {score}
                </p>
                {score >= highScore && score > 0 && (
                  <p className="text-[11px] font-semibold text-orange-400 uppercase tracking-wider mb-3">
                    New High Score!
                  </p>
                )}
                {score < highScore && (
                  <p className="text-[11px] text-white/30 font-mono tabular-nums mb-3">
                    Best: {highScore}
                  </p>
                )}
                <p className="text-[12px] text-white/40 font-medium">
                  Tap to restart
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
