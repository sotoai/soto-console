'use client'

import { useRef, useEffect, useCallback, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Pause, Play, Minimize2 } from 'lucide-react'
import { useDrag } from '@use-gesture/react'
import { useChunkoEngine, type ChunkoSnapshot } from './useChunkoEngine'
import { CHUNKO_EMOJIS } from './chunko-config'
import { NextPiecePreview } from './NextPiecePreview'
import { MiniLeaderboard } from './MiniLeaderboard'
import { TouchControls } from './TouchControls'
import type { GameComponentProps } from '../types'

interface ChunkoGameProps extends GameComponentProps {
  initialState?: ChunkoSnapshot
  onStateChange?: (snapshot: ChunkoSnapshot) => void
}

// ─── CHUNKO! Celebration ───

interface EmojiParticle {
  id: number
  emoji: string
  x: number       // % from left
  delay: number    // seconds
  duration: number // seconds
}

function ChunkoCelebration({ onComplete }: { onComplete: () => void }) {
  const particles = useMemo<EmojiParticle[]>(() => {
    return Array.from({ length: 14 }, (_, i) => ({
      id: i,
      emoji: CHUNKO_EMOJIS[Math.floor(Math.random() * CHUNKO_EMOJIS.length)],
      x: 5 + Math.random() * 90,
      delay: Math.random() * 0.6,
      duration: 1.6 + Math.random() * 0.8,
    }))
  }, [])

  useEffect(() => {
    const timer = setTimeout(onComplete, 2800)
    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: [0, 1, 1, 0], scale: [0.5, 1.1, 1, 1] }}
        transition={{ duration: 2, times: [0, 0.15, 0.7, 1] }}
      >
        <span
          className="text-[32px] md:text-[48px] font-black tracking-tighter"
          style={{
            color: '#FACC15',
            textShadow: '0 0 20px rgba(250,204,21,0.7), 0 0 40px rgba(250,204,21,0.4), 0 2px 4px rgba(0,0,0,0.5)',
          }}
        >
          CHUNKO!
        </span>
      </motion.div>

      {particles.map(p => (
        <motion.span
          key={p.id}
          className="absolute text-[20px] md:text-[26px]"
          style={{ left: `${p.x}%`, bottom: -40 }}
          initial={{ y: 0, opacity: 0 }}
          animate={{
            y: -500,
            opacity: [0, 1, 1, 0],
            x: [0, (Math.random() - 0.5) * 40],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: 'easeOut',
            opacity: { duration: p.duration, times: [0, 0.1, 0.7, 1] },
          }}
        >
          {p.emoji}
        </motion.span>
      ))}
    </div>
  )
}

// ─── Main component ───

export function ChunkoGame({
  isFullscreen,
  onCollapse,
  initialState,
  onStateChange,
  onScoreSubmit,
}: ChunkoGameProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasContainerRef = useRef<HTMLDivElement>(null)
  const scoreSubmittedRef = useRef(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [leaderboardRefresh, setLeaderboardRefresh] = useState(0)

  const {
    canvasRef,
    gameState,
    score,
    level,
    linesCleared,
    highScore,
    nextType,
    chunkoFired,
    chunkoCount,
    clearChunko,
    start,
    pause,
    resume,
    restart,
    moveLeft,
    moveRight,
    moveDown,
    hardDrop,
    rotateCW,
    rotateCCW,
    render,
    getSnapshot,
  } = useChunkoEngine(initialState)

  // Observe container size and re-render
  useEffect(() => {
    const el = canvasContainerRef.current
    if (!el) return

    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        if (width > 0 && height > 0) render(width, height)
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
    if (rect.width > 0 && rect.height > 0) render(rect.width, rect.height)
  }, [render])

  // Submit score on gameover
  useEffect(() => {
    if (gameState === 'gameover' && score > 0 && !scoreSubmittedRef.current) {
      scoreSubmittedRef.current = true
      onScoreSubmit?.('chunko', score, chunkoCount)
      setLeaderboardRefresh(prev => prev + 1)
    }
    if (gameState === 'playing') {
      scoreSubmittedRef.current = false
    }
  }, [gameState, score, chunkoCount, onScoreSubmit])

  // Trigger celebration
  useEffect(() => {
    if (chunkoFired) {
      setShowCelebration(true)
      clearChunko()
    }
  }, [chunkoFired, clearChunko])

  const handleCelebrationComplete = useCallback(() => {
    setShowCelebration(false)
  }, [])

  const handleCanvasTap = useCallback(() => {
    if (gameState === 'idle') start()
    else if (gameState === 'gameover') restart()
    else if (gameState === 'playing') rotateCW()
  }, [gameState, start, restart, rotateCW])

  // Swipe controls (still works on mobile + desktop)
  const bind = useDrag(
    ({ movement: [mx, my], first, memo, tap }) => {
      if (tap) {
        handleCanvasTap()
        return
      }
      if (first) return [0, 0]

      const dx = mx - (memo?.[0] ?? 0)
      const dy = my - (memo?.[1] ?? 0)
      const threshold = 20

      if (Math.abs(dx) > threshold || Math.abs(dy) > threshold) {
        if (Math.abs(dx) > Math.abs(dy)) {
          if (dx > 0) moveRight()
          else moveLeft()
        } else {
          if (dy > 0) moveDown()
          else hardDrop()
        }
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
    >
      {/* HUD */}
      <div className="flex items-center justify-between px-2 shrink-0" style={{ height: 40 }}>
        <div className="flex items-center gap-3">
          {/* Mobile-only: show stats in HUD (sidebars are hidden) */}
          <span className="md:hidden text-[13px] font-mono tabular-nums font-semibold text-[var(--wp-text)]">
            {score.toLocaleString()}
          </span>
          {chunkoCount > 0 && (
            <span className="text-[11px] font-mono tabular-nums text-red-400 flex items-center gap-0.5">
              🌶️ {chunkoCount}
            </span>
          )}
          <span className="md:hidden text-[11px] font-mono tabular-nums text-[var(--wp-text-tertiary)]">
            LV {level}
          </span>
          {/* Desktop: just show game name */}
          <span className="hidden md:inline text-[13px] font-semibold text-[var(--wp-text-tertiary)] uppercase tracking-wider">
            Chunko
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
          {isFullscreen && (
            <button
              onClick={handleCollapse}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center text-[var(--wp-text-secondary)] active:text-[var(--wp-text)] cursor-pointer"
            >
              <Minimize2 size={16} strokeWidth={1.5} />
            </button>
          )}
        </div>
      </div>

      {/* Main 3-column area */}
      <div className="flex-1 min-h-0 flex">
        {/* Left sidebar: Mini Leaderboard (hidden on mobile) */}
        <div className="hidden md:flex flex-col shrink-0 px-2 py-1" style={{ width: 150 }}>
          <MiniLeaderboard refreshTrigger={leaderboardRefresh} />
        </div>

        {/* Center: Canvas + Touch Controls */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Canvas container */}
          <div
            ref={canvasContainerRef}
            className="flex-1 min-h-0 relative overflow-hidden rounded-[var(--radius-sm)]"
            style={{ touchAction: 'none' }}
            {...bind()}
            onClick={handleCanvasTap}
            role="button"
            tabIndex={0}
          >
            <canvas ref={canvasRef} className="absolute inset-0" />

            {/* CHUNKO! celebration */}
            <AnimatePresence>
              {showCelebration && (
                <ChunkoCelebration onComplete={handleCelebrationComplete} />
              )}
            </AnimatePresence>

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
                    <p className="text-[28px] md:text-[36px] font-bold text-cyan-400 mb-2 tracking-tight">
                      🧱
                    </p>
                    <p className="text-[18px] md:text-[22px] font-bold text-white/90 mb-1 tracking-tight">
                      Chunko
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
                    <p className="text-[32px] md:text-[40px] font-bold text-cyan-400 tabular-nums mb-1">
                      {score.toLocaleString()}
                    </p>
                    {chunkoCount > 0 && (
                      <p className="text-[13px] text-red-400 font-mono tabular-nums mb-2">
                        🌶️ × {chunkoCount} Chunko{chunkoCount !== 1 ? 's' : ''}
                      </p>
                    )}
                    {score >= highScore && score > 0 && (
                      <p className="text-[11px] font-semibold text-orange-400 uppercase tracking-wider mb-3">
                        New High Score!
                      </p>
                    )}
                    {score < highScore && (
                      <p className="text-[11px] text-white/30 font-mono tabular-nums mb-3">
                        Best: {highScore.toLocaleString()}
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

          {/* Touch Controls */}
          <TouchControls
            onMoveLeft={moveLeft}
            onMoveRight={moveRight}
            onMoveDown={() => { moveDown() }}
            onRotateCW={rotateCW}
            onRotateCCW={rotateCCW}
            onHardDrop={hardDrop}
            disabled={gameState !== 'playing'}
          />
        </div>

        {/* Right sidebar: Next Piece + Stats (hidden on mobile) */}
        <div className="hidden md:flex flex-col shrink-0 px-2 py-1" style={{ width: 150 }}>
          <NextPiecePreview
            pieceType={nextType}
            score={score}
            level={level}
            linesCleared={linesCleared}
            highScore={highScore}
            gameState={gameState}
          />
        </div>
      </div>
    </div>
  )
}
