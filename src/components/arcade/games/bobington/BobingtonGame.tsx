'use client'

import { useRef, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Pause, Play, Minimize2, Maximize2 } from 'lucide-react'
import type { GameComponentProps } from '../types'
import {
  useBobingtonEngine,
  hitTestPad,
} from './useBobingtonEngine'
import { BOBINGTON, BOBINGTON_EMOJIS } from './bobington-config'

type BobingtonGameProps = GameComponentProps

export function BobingtonGame({
  isFullscreen,
  onExpand,
  onCollapse,
  initialState,
  onStateChange,
  onScoreSubmit,
}: BobingtonGameProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasContainerRef = useRef<HTMLDivElement>(null)
  const scoreSubmittedRef = useRef(false)

  const engine = useBobingtonEngine(initialState)
  const {
    canvasRef,
    gameState,
    phase,
    score,
    highScore,
    currentPlayerName,
    players,
    playerCount,
    inputProgress,
    start,
    pause,
    resume,
    restart,
    selectPlayerCount,
    handlePadTap,
    render,
    getSnapshot,
  } = engine

  // ── Responsive canvas via ResizeObserver ──
  useEffect(() => {
    const el = canvasContainerRef.current
    if (!el) return

    const observer = new ResizeObserver((entries) => {
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
    const rect = canvasContainerRef.current?.getBoundingClientRect()
    if (rect && rect.width > 0 && rect.height > 0) {
      render(rect.width, rect.height)
    }
  }, [render])

  // ── Save state on pause / collapse ──
  useEffect(() => {
    if (gameState === 'paused' && onStateChange) {
      onStateChange(getSnapshot())
    }
  }, [gameState, onStateChange, getSnapshot])

  // ── Auto-submit score on gameover ──
  useEffect(() => {
    if (gameState === 'gameover' && score > 0 && !scoreSubmittedRef.current) {
      scoreSubmittedRef.current = true
      onScoreSubmit?.('bobington', score)
    }
    if (gameState === 'playing') {
      scoreSubmittedRef.current = false
    }
  }, [gameState, score, onScoreSubmit])

  // ── Handle collapse: save + close ──
  const handleCollapse = useCallback(() => {
    if (gameState === 'playing') pause()
    if (onStateChange) onStateChange(getSnapshot())
    onCollapse?.()
  }, [gameState, pause, onStateChange, getSnapshot, onCollapse])

  // ── Pointer input: tap pads ──
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (gameState === 'idle') {
        start()
        return
      }
      if (gameState === 'gameover') {
        restart()
        return
      }
      if (gameState === 'paused') {
        resume()
        return
      }
      if (phase !== 'input') return

      const rect = canvasContainerRef.current?.getBoundingClientRect()
      if (!rect) return
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const tapped = hitTestPad(x, y, rect.width, rect.height)
      if (tapped) {
        handlePadTap(tapped)
      }
    },
    [gameState, phase, start, restart, resume, handlePadTap],
  )

  // ── Winner info for gameover ──
  const winner = useMemo(
    () => players.find(p => !p.isEliminated),
    [players],
  )

  return (
    <div
      ref={containerRef}
      className="flex flex-col w-full h-full select-none"
      style={{ touchAction: 'none' }}
    >
      {/* ── HUD ── */}
      <div
        className="flex items-center justify-between px-3 shrink-0"
        style={{ height: '40px' }}
      >
        <div className="flex items-center gap-3">
          <span
            className="font-mono font-bold"
            style={{ fontSize: '14px', color: 'rgba(255,255,255,0.9)' }}
          >
            {score}
          </span>
          <span
            className="font-mono"
            style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}
          >
            HI {highScore}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {gameState === 'playing' && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                pause()
              }}
              className="p-1.5 rounded-md cursor-pointer transition-all active:scale-90"
              style={{ color: 'rgba(255,255,255,0.5)' }}
            >
              <Pause size={16} />
            </button>
          )}

          {isFullscreen ? (
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleCollapse()
              }}
              className="p-1.5 rounded-md cursor-pointer transition-all active:scale-90"
              style={{ color: 'rgba(255,255,255,0.5)' }}
            >
              <Minimize2 size={16} />
            </button>
          ) : (
            onExpand && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onExpand()
                }}
                className="p-1.5 rounded-md cursor-pointer transition-all active:scale-90"
                style={{ color: 'rgba(255,255,255,0.5)' }}
              >
                <Maximize2 size={16} />
              </button>
            )
          )}
        </div>
      </div>

      {/* ── Canvas + Overlays ── */}
      <div
        ref={canvasContainerRef}
        className="flex-1 min-h-0 relative overflow-hidden"
        onPointerDown={handlePointerDown}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0"
        />

        {/* ── IDLE Overlay ── */}
        <AnimatePresence>
          {gameState === 'idle' && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
            >
              <div
                className="text-center px-6 py-8 rounded-3xl"
                style={{
                  background: 'rgba(0, 0, 0, 0.7)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                }}
              >
                <p style={{ fontSize: '36px' }}>🧠</p>
                <p
                  className="font-bold mt-1"
                  style={{ fontSize: '22px', color: 'rgba(255,255,255,0.95)' }}
                >
                  Bobington
                </p>
                <p
                  className="mt-1"
                  style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}
                >
                  Repeat the sequence, add your own
                </p>

                {/* Player Count Selector */}
                <div className="flex items-center justify-center gap-3 mt-5">
                  {[2, 3, 4].map((n) => (
                    <button
                      key={n}
                      onClick={(e) => {
                        e.stopPropagation()
                        selectPlayerCount(n)
                      }}
                      className="w-12 h-12 rounded-xl flex items-center justify-center cursor-pointer font-bold transition-all active:scale-90"
                      style={{
                        fontSize: '18px',
                        background:
                          playerCount === n
                            ? 'linear-gradient(135deg, #8b5cf6, #6366f1)'
                            : 'rgba(255,255,255,0.08)',
                        color:
                          playerCount === n
                            ? 'white'
                            : 'rgba(255,255,255,0.5)',
                        border:
                          playerCount === n
                            ? '2px solid rgba(139,92,246,0.6)'
                            : '1px solid rgba(255,255,255,0.1)',
                      }}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <p
                  className="mt-1"
                  style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}
                >
                  players
                </p>

                <p
                  className="mt-5"
                  style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)' }}
                >
                  Tap to start
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── PLAYBACK Phase Indicator ── */}
        <AnimatePresence>
          {phase === 'playback' && gameState === 'playing' && (
            <motion.div
              className="absolute top-3 left-0 right-0 flex justify-center z-10 pointer-events-none"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div
                className="px-4 py-2 rounded-xl text-center"
                style={{
                  background: 'rgba(0, 0, 0, 0.6)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                }}
              >
                <p
                  className="font-semibold"
                  style={{ fontSize: '14px', color: 'rgba(255,255,255,0.9)' }}
                >
                  {currentPlayerName}
                </p>
                <p
                  style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)' }}
                >
                  Watch closely...
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── INPUT Phase Indicator ── */}
        <AnimatePresence>
          {phase === 'input' && gameState === 'playing' && (
            <motion.div
              className="absolute top-3 left-0 right-0 flex justify-center z-10 pointer-events-none"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div
                className="px-4 py-2 rounded-xl text-center"
                style={{
                  background: 'rgba(0, 0, 0, 0.6)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                }}
              >
                <p
                  className="font-bold"
                  style={{ fontSize: '15px', color: 'rgba(255,255,255,0.95)' }}
                >
                  {currentPlayerName}
                </p>
                <p
                  style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}
                >
                  {inputProgress.awaitingNew
                    ? '+ Add your own!'
                    : `${inputProgress.current} / ${inputProgress.total}`}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── PAUSED Overlay ── */}
        <AnimatePresence>
          {gameState === 'paused' && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
            >
              <div
                className="absolute inset-0"
                style={{ background: 'rgba(0, 0, 0, 0.5)' }}
              />
              <div className="relative text-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    resume()
                  }}
                  className="p-4 rounded-full cursor-pointer transition-all active:scale-90"
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                  }}
                >
                  <Play size={24} className="text-white/80 ml-0.5" />
                </button>
                <p
                  className="mt-3"
                  style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}
                >
                  Tap to resume
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── GAMEOVER Overlay ── */}
        <AnimatePresence>
          {gameState === 'gameover' && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
            >
              <div
                className="absolute inset-0"
                style={{ background: 'rgba(0, 0, 0, 0.65)' }}
              />
              <div
                className="relative text-center px-6 py-6 rounded-3xl max-w-xs w-full"
                style={{
                  background: 'rgba(0, 0, 0, 0.6)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <p style={{ fontSize: '32px' }}>👑</p>
                <p
                  className="font-bold mt-1"
                  style={{ fontSize: '20px', color: 'rgba(255,255,255,0.95)' }}
                >
                  {winner?.name ?? 'Game Over'}
                </p>
                <p
                  style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}
                >
                  wins!
                </p>

                {/* Score */}
                <p
                  className="font-bold font-mono mt-3"
                  style={{
                    fontSize: '36px',
                    color: '#a78bfa',
                  }}
                >
                  {score}
                </p>
                <p
                  style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}
                >
                  sequence length
                </p>

                {/* Player results */}
                <div className="mt-4 flex flex-col gap-1">
                  {players.map((p, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between px-3 py-1.5 rounded-lg"
                      style={{
                        background: p.isEliminated
                          ? 'rgba(255,255,255,0.03)'
                          : 'rgba(139,92,246,0.15)',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '13px',
                          color: p.isEliminated
                            ? 'rgba(255,255,255,0.4)'
                            : 'rgba(255,255,255,0.9)',
                        }}
                      >
                        {p.isEliminated ? '💀' : '👑'} {p.name}
                      </span>
                      <span
                        className="font-mono"
                        style={{
                          fontSize: '12px',
                          color: 'rgba(255,255,255,0.4)',
                        }}
                      >
                        {p.isEliminated
                          ? `out at ${p.roundSurvived}`
                          : 'winner'}
                      </span>
                    </div>
                  ))}
                </div>

                <p
                  className="mt-5"
                  style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)' }}
                >
                  Tap to play again
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
