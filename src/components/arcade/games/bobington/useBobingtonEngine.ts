'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import type { GameState } from '../types'
import {
  type PadColor,
  type BobingtonPhase,
  type PlayerState,
  type BobingtonSnapshot,
  BOBINGTON,
  PADS,
  PAD_QUADRANTS,
  getPadDef,
  randomPad,
  noteDuration,
} from './bobington-config'

// ── Public interface ──
export interface BobingtonEngineReturn {
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  gameState: GameState
  phase: BobingtonPhase
  score: number
  highScore: number
  currentPlayerName: string
  players: PlayerState[]
  playerCount: number
  activePad: PadColor | null
  inputProgress: { current: number; total: number; awaitingNew: boolean }

  start: () => void
  pause: () => void
  resume: () => void
  restart: () => void
  selectPlayerCount: (n: number) => void
  handlePadTap: (pad: PadColor) => void
  render: (width: number, height: number) => void
  getSnapshot: () => BobingtonSnapshot
}

// ── Stored high score ──
function getStoredHighScore(): number {
  if (typeof window === 'undefined') return 0
  return parseInt(localStorage.getItem(BOBINGTON.HIGHSCORE_KEY) || '0', 10)
}

function setStoredHighScore(score: number) {
  if (typeof window === 'undefined') return
  localStorage.setItem(BOBINGTON.HIGHSCORE_KEY, String(score))
}

// ── Engine Hook ──
export function useBobingtonEngine(initialState?: BobingtonSnapshot): BobingtonEngineReturn {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  // ── Mutable state (refs — no re-renders per tick) ──
  const sequenceRef = useRef<PadColor[]>(initialState?.sequence ?? [])
  const playersRef = useRef<PlayerState[]>(initialState?.players ?? [])
  const currentPlayerRef = useRef(initialState?.currentPlayerIndex ?? 0)
  const inputIndexRef = useRef(0)
  const awaitingNewRef = useRef(false)
  const phaseRef = useRef<BobingtonPhase>(initialState?.phase ?? 'idle')
  const activePadRef = useRef<PadColor | null>(null)
  const activePadStartRef = useRef(0)
  const playerCountRef = useRef(initialState?.playerCount ?? 2)
  const scoreRef = useRef(initialState?.score ?? 0)
  const highScoreRef = useRef(getStoredHighScore())
  const gameStateRef = useRef<GameState>('idle')
  const failedPlayerRef = useRef('')

  // Playback timing
  const playbackIndexRef = useRef(0)
  const playbackStartRef = useRef(0)
  const playbackNotePlayedRef = useRef<Set<number>>(new Set())

  // Phase transition timestamps
  const successStartRef = useRef(0)
  const failureStartRef = useRef(0)

  // Animation
  const rafRef = useRef<number | null>(null)
  const sizeRef = useRef({ width: 0, height: 0 })

  // Audio
  const audioCtxRef = useRef<AudioContext | null>(null)

  // ── Reactive state (for UI) ──
  const [gameState, setGameState] = useState<GameState>('idle')
  const [phase, setPhase] = useState<BobingtonPhase>('idle')
  const [score, setScore] = useState(initialState?.score ?? 0)
  const [highScore, setHighScore] = useState(getStoredHighScore())
  const [currentPlayerName, setCurrentPlayerName] = useState('')
  const [players, setPlayers] = useState<PlayerState[]>([])
  const [playerCount, setPlayerCount] = useState(initialState?.playerCount ?? 2)
  const [activePad, setActivePad] = useState<PadColor | null>(null)
  const [inputProgress, setInputProgress] = useState({ current: 0, total: 0, awaitingNew: false })

  // ── Sync helpers ──
  const syncUI = useCallback(() => {
    setPhase(phaseRef.current)
    setScore(scoreRef.current)
    setActivePad(activePadRef.current)
    setCurrentPlayerName(
      playersRef.current[currentPlayerRef.current]?.name ?? '',
    )
    setPlayers([...playersRef.current])
    setInputProgress({
      current: inputIndexRef.current,
      total: sequenceRef.current.length,
      awaitingNew: awaitingNewRef.current,
    })

    // Map phase → GameState
    const p = phaseRef.current
    let gs: GameState
    if (p === 'idle') gs = 'idle'
    else if (p === 'gameover') gs = 'gameover'
    else gs = 'playing'

    if (gs !== gameStateRef.current) {
      gameStateRef.current = gs
      setGameState(gs)
    }
  }, [])

  // ── Audio ──
  const getAudioCtx = useCallback(() => {
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      audioCtxRef.current = new AudioContext()
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume()
    }
    return audioCtxRef.current
  }, [])

  const playTone = useCallback(
    (frequency: number, durationMs: number) => {
      try {
        const ctx = getAudioCtx()
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.type = BOBINGTON.AUDIO_TYPE
        osc.frequency.value = frequency

        const now = ctx.currentTime
        const dur = durationMs / 1000
        gain.gain.setValueAtTime(0, now)
        gain.gain.linearRampToValueAtTime(BOBINGTON.AUDIO_GAIN, now + 0.01)
        gain.gain.setValueAtTime(BOBINGTON.AUDIO_GAIN, now + dur - 0.05)
        gain.gain.linearRampToValueAtTime(0, now + dur)

        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now)
        osc.stop(now + dur + 0.01)
      } catch {
        // Audio not available
      }
    },
    [getAudioCtx],
  )

  const playPadTone = useCallback(
    (pad: PadColor) => {
      const def = getPadDef(pad)
      const dur = noteDuration(sequenceRef.current.length)
      playTone(def.frequency, dur)
    },
    [playTone],
  )

  const playSuccessSound = useCallback(() => {
    playTone(BOBINGTON.SUCCESS_FREQ, 150)
    setTimeout(() => playTone(BOBINGTON.SUCCESS_FREQ_2, 120), 100)
  }, [playTone])

  const playFailureSound = useCallback(() => {
    playTone(BOBINGTON.FAILURE_FREQ, 500)
  }, [playTone])

  // ── Pad activation (visual + audio) ──
  const activatePad = useCallback(
    (pad: PadColor, withSound = true) => {
      activePadRef.current = pad
      activePadStartRef.current = performance.now()
      if (withSound) playPadTone(pad)
    },
    [playPadTone],
  )

  const deactivatePad = useCallback(() => {
    activePadRef.current = null
  }, [])

  // ── Begin playback phase ──
  const beginPlayback = useCallback(() => {
    phaseRef.current = 'playback'
    playbackIndexRef.current = 0
    playbackStartRef.current = performance.now()
    playbackNotePlayedRef.current = new Set()
    deactivatePad()
    syncUI()
  }, [deactivatePad, syncUI])

  // ── Advance to next non-eliminated player ──
  const advanceToNextPlayer = useCallback(() => {
    const ps = playersRef.current
    let next = currentPlayerRef.current
    let attempts = 0
    do {
      next = (next + 1) % ps.length
      attempts++
    } while (ps[next].isEliminated && attempts <= ps.length)

    currentPlayerRef.current = next
    beginPlayback()
  }, [beginPlayback])

  // ── Check game over or continue ──
  const checkGameOverOrContinue = useCallback(() => {
    const remaining = playersRef.current.filter(p => !p.isEliminated)
    if (remaining.length <= 1) {
      // Game over
      phaseRef.current = 'gameover'
      scoreRef.current = sequenceRef.current.length

      // Update high score
      if (scoreRef.current > highScoreRef.current) {
        highScoreRef.current = scoreRef.current
        setStoredHighScore(scoreRef.current)
        setHighScore(scoreRef.current)
      }

      syncUI()
      // Stop the loop
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
      // Re-render one last time
      renderCanvas(sizeRef.current.width, sizeRef.current.height)
      gameStateRef.current = 'gameover'
      setGameState('gameover')
    } else {
      advanceToNextPlayer()
    }
  }, [advanceToNextPlayer, syncUI])

  // ── Handle failure ──
  const handleFailure = useCallback(() => {
    const player = playersRef.current[currentPlayerRef.current]
    player.isEliminated = true
    player.roundSurvived = sequenceRef.current.length
    failedPlayerRef.current = player.name

    playFailureSound()

    phaseRef.current = 'failure'
    failureStartRef.current = performance.now()
    deactivatePad()
    syncUI()
  }, [playFailureSound, deactivatePad, syncUI])

  // ── Handle pad tap (during input phase) ──
  const handlePadTap = useCallback(
    (pad: PadColor) => {
      if (phaseRef.current !== 'input') return

      activatePad(pad)

      if (awaitingNewRef.current) {
        // Player is adding their new pad to the sequence
        sequenceRef.current = [...sequenceRef.current, pad]
        scoreRef.current = sequenceRef.current.length
        awaitingNewRef.current = false

        playSuccessSound()
        phaseRef.current = 'success'
        successStartRef.current = performance.now()
        syncUI()
        return
      }

      // Player is replaying the existing sequence
      const expected = sequenceRef.current[inputIndexRef.current]
      if (pad === expected) {
        // Correct!
        inputIndexRef.current++

        if (inputIndexRef.current >= sequenceRef.current.length) {
          // Finished replaying — now awaiting their new addition
          awaitingNewRef.current = true
        }
        syncUI()
      } else {
        // Wrong! Eliminate this player
        handleFailure()
      }
    },
    [activatePad, playSuccessSound, handleFailure, syncUI],
  )

  // ── Playback advance (called from game loop) ──
  const advancePlayback = useCallback(
    (timestamp: number) => {
      const seq = sequenceRef.current
      if (seq.length === 0) return

      const round = seq.length
      const noteDur = noteDuration(round)
      const stepDur = noteDur + BOBINGTON.PLAYBACK_GAP_DURATION
      const elapsed = timestamp - playbackStartRef.current

      const noteIndex = Math.floor(elapsed / stepDur)
      const withinNote = elapsed - noteIndex * stepDur

      if (noteIndex >= seq.length) {
        // Playback finished → switch to input phase
        deactivatePad()
        phaseRef.current = 'input'
        inputIndexRef.current = 0
        awaitingNewRef.current = false
        syncUI()
        return
      }

      // Light up the current note's pad (if within note duration, not gap)
      if (withinNote < noteDur) {
        if (!playbackNotePlayedRef.current.has(noteIndex)) {
          playbackNotePlayedRef.current.add(noteIndex)
          activatePad(seq[noteIndex])
        }
        activePadRef.current = seq[noteIndex]
      } else {
        // In the gap
        activePadRef.current = null
      }
    },
    [activatePad, deactivatePad, syncUI],
  )

  // ── Canvas rendering ──
  const renderCanvas = useCallback(
    (width: number, height: number) => {
      const canvas = canvasRef.current
      if (!canvas || width <= 0 || height <= 0) return

      const dpr = window.devicePixelRatio || 1
      const cw = Math.round(width * dpr)
      const ch = Math.round(height * dpr)

      if (canvas.width !== cw || canvas.height !== ch) {
        canvas.width = cw
        canvas.height = ch
        canvas.style.width = `${width}px`
        canvas.style.height = `${height}px`
      }

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.save()
      ctx.scale(dpr, dpr)

      // Background
      ctx.fillStyle = BOBINGTON.BG_COLOR
      ctx.fillRect(0, 0, width, height)

      // Calculate pad area (square, centered)
      const padAreaSize = Math.min(width, height) * 0.88
      const ox = (width - padAreaSize) / 2
      const oy = (height - padAreaSize) / 2
      const halfSize = padAreaSize / 2
      const gap = padAreaSize * BOBINGTON.PAD_GAP
      const cornerR = padAreaSize * BOBINGTON.PAD_CORNER_RADIUS
      const centerR = padAreaSize * BOBINGTON.CENTER_CIRCLE_RADIUS

      const isInputPhase = phaseRef.current === 'input'
      const currentPhase = phaseRef.current

      // Draw each pad quadrant
      for (const padDef of PADS) {
        const quad = PAD_QUADRANTS[padDef.color]
        const isActive = activePadRef.current === padDef.color

        const px = ox + quad.col * halfSize + (quad.col === 1 ? gap / 2 : 0)
        const py = oy + quad.row * halfSize + (quad.row === 1 ? gap / 2 : 0)
        const pw = halfSize - gap / 2
        const ph = halfSize - gap / 2

        // Glow effect when active
        if (isActive) {
          ctx.shadowColor = padDef.glowColor
          ctx.shadowBlur = 25
        }

        ctx.fillStyle = isActive ? padDef.activeColor : padDef.baseColor

        // Draw rounded rectangle
        ctx.beginPath()
        ctx.roundRect(px, py, pw, ph, cornerR)
        ctx.fill()

        ctx.shadowColor = 'transparent'
        ctx.shadowBlur = 0

        // Dim pads during playback (not the active one)
        if (currentPhase === 'playback' && !isActive) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.4)'
          ctx.beginPath()
          ctx.roundRect(px, py, pw, ph, cornerR)
          ctx.fill()
        }

        // During failure, tint everything red
        if (currentPhase === 'failure') {
          ctx.fillStyle = 'rgba(239, 68, 68, 0.15)'
          ctx.beginPath()
          ctx.roundRect(px, py, pw, ph, cornerR)
          ctx.fill()
        }
      }

      // Center circle
      const cx = ox + halfSize
      const cy = oy + halfSize

      ctx.fillStyle = BOBINGTON.CENTER_COLOR
      ctx.beginPath()
      ctx.arc(cx, cy, centerR, 0, Math.PI * 2)
      ctx.fill()

      // Center circle border
      ctx.strokeStyle = BOBINGTON.CENTER_BORDER_COLOR
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(cx, cy, centerR, 0, Math.PI * 2)
      ctx.stroke()

      // Center text
      if (
        currentPhase === 'playback' ||
        currentPhase === 'input' ||
        currentPhase === 'success'
      ) {
        const player = playersRef.current[currentPlayerRef.current]
        if (player) {
          // Player name
          ctx.fillStyle = 'rgba(255,255,255,0.9)'
          ctx.font = `bold ${padAreaSize * 0.04}px -apple-system, system-ui, sans-serif`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(player.name, cx, cy - padAreaSize * 0.02)

          // Round info
          ctx.fillStyle = 'rgba(255,255,255,0.45)'
          ctx.font = `${padAreaSize * 0.025}px -apple-system, system-ui, sans-serif`
          ctx.fillText(
            `Round ${sequenceRef.current.length}`,
            cx,
            cy + padAreaSize * 0.025,
          )
        }
      } else if (currentPhase === 'failure') {
        ctx.fillStyle = '#ef4444'
        ctx.font = `bold ${padAreaSize * 0.035}px -apple-system, system-ui, sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(failedPlayerRef.current, cx, cy - padAreaSize * 0.015)
        ctx.fillStyle = 'rgba(255,255,255,0.5)'
        ctx.font = `${padAreaSize * 0.025}px -apple-system, system-ui, sans-serif`
        ctx.fillText('is out!', cx, cy + padAreaSize * 0.025)
      } else if (currentPhase === 'idle') {
        // Title in center
        ctx.fillStyle = 'rgba(255,255,255,0.8)'
        ctx.font = `bold ${padAreaSize * 0.04}px -apple-system, system-ui, sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('🧠', cx, cy - padAreaSize * 0.02)
      } else if (currentPhase === 'gameover') {
        ctx.fillStyle = 'rgba(255,255,255,0.7)'
        ctx.font = `bold ${padAreaSize * 0.035}px -apple-system, system-ui, sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        const winner = playersRef.current.find(p => !p.isEliminated)
        if (winner) {
          ctx.fillText('👑', cx, cy - padAreaSize * 0.02)
          ctx.font = `${padAreaSize * 0.025}px -apple-system, system-ui, sans-serif`
          ctx.fillText(winner.name, cx, cy + padAreaSize * 0.025)
        }
      }

      ctx.restore()
    },
    [],
  )

  // ── Game loop ──
  const gameLoop = useCallback(
    (timestamp: number) => {
      const gs = gameStateRef.current
      const p = phaseRef.current

      if (gs === 'idle' || gs === 'gameover') {
        renderCanvas(sizeRef.current.width, sizeRef.current.height)
        rafRef.current = null
        return
      }

      if (gs === 'paused') {
        renderCanvas(sizeRef.current.width, sizeRef.current.height)
        rafRef.current = null
        return
      }

      // ── Phase-specific updates ──

      if (p === 'playback') {
        advancePlayback(timestamp)
      }

      // Auto-deactivate pad after flash duration
      if (
        activePadRef.current &&
        p === 'input' &&
        timestamp - activePadStartRef.current > BOBINGTON.INPUT_FLASH_DURATION
      ) {
        activePadRef.current = null
      }

      // Success delay → advance to next player
      if (p === 'success') {
        if (timestamp - successStartRef.current > BOBINGTON.SUCCESS_DELAY) {
          advanceToNextPlayer()
        }
      }

      // Failure display → check game over or continue
      if (p === 'failure') {
        if (timestamp - failureStartRef.current > BOBINGTON.FAILURE_DISPLAY_DURATION) {
          checkGameOverOrContinue()
        }
      }

      // Render
      renderCanvas(sizeRef.current.width, sizeRef.current.height)

      // Continue loop
      if (gameStateRef.current === 'playing') {
        rafRef.current = requestAnimationFrame(gameLoop)
      } else {
        rafRef.current = null
      }
    },
    [advancePlayback, advanceToNextPlayer, checkGameOverOrContinue, renderCanvas],
  )

  // ── Start the rAF loop ──
  const startLoop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(gameLoop)
  }, [gameLoop])

  // ── Public methods ──

  const selectPlayerCount = useCallback(
    (n: number) => {
      if (n < BOBINGTON.MIN_PLAYERS || n > BOBINGTON.MAX_PLAYERS) return
      playerCountRef.current = n
      setPlayerCount(n)
    },
    [],
  )

  const start = useCallback(() => {
    // Initialize players
    const count = playerCountRef.current
    const ps: PlayerState[] = []
    for (let i = 0; i < count; i++) {
      ps.push({
        name: BOBINGTON.DEFAULT_PLAYER_NAMES[i],
        isEliminated: false,
        roundSurvived: 0,
      })
    }
    playersRef.current = ps

    // Initialize sequence with one random pad
    sequenceRef.current = [randomPad()]
    scoreRef.current = 1
    currentPlayerRef.current = 0
    inputIndexRef.current = 0
    awaitingNewRef.current = false

    // Init audio context (needs user gesture)
    getAudioCtx()

    // Start playback for first player
    phaseRef.current = 'playback'
    gameStateRef.current = 'playing'
    setGameState('playing')
    beginPlayback()
    startLoop()
  }, [getAudioCtx, beginPlayback, startLoop])

  const pause = useCallback(() => {
    if (gameStateRef.current !== 'playing') return
    gameStateRef.current = 'paused'
    setGameState('paused')
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    deactivatePad()
    renderCanvas(sizeRef.current.width, sizeRef.current.height)
  }, [deactivatePad, renderCanvas])

  const resume = useCallback(() => {
    if (gameStateRef.current !== 'paused') return
    gameStateRef.current = 'playing'
    setGameState('playing')
    // Restart playback from the beginning of current phase
    if (phaseRef.current === 'playback') {
      beginPlayback()
    }
    startLoop()
  }, [beginPlayback, startLoop])

  const restart = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    phaseRef.current = 'idle'
    gameStateRef.current = 'idle'
    sequenceRef.current = []
    playersRef.current = []
    currentPlayerRef.current = 0
    scoreRef.current = 0
    deactivatePad()

    setGameState('idle')
    setPhase('idle')
    setScore(0)
    setPlayers([])
    setCurrentPlayerName('')
    setActivePad(null)
    setInputProgress({ current: 0, total: 0, awaitingNew: false })

    renderCanvas(sizeRef.current.width, sizeRef.current.height)
  }, [deactivatePad, renderCanvas])

  const render = useCallback(
    (width: number, height: number) => {
      sizeRef.current = { width, height }
      renderCanvas(width, height)
    },
    [renderCanvas],
  )

  const getSnapshot = useCallback((): BobingtonSnapshot => {
    return {
      sequence: [...sequenceRef.current],
      players: playersRef.current.map(p => ({ ...p })),
      currentPlayerIndex: currentPlayerRef.current,
      score: scoreRef.current,
      phase: phaseRef.current,
      playerCount: playerCountRef.current,
    }
  }, [])

  // ── Keyboard input ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault()
        if (gameStateRef.current === 'idle') start()
        else if (gameStateRef.current === 'paused') resume()
        else if (gameStateRef.current === 'gameover') restart()
        else if (gameStateRef.current === 'playing' && phaseRef.current === 'input') pause()
        return
      }

      // Pad keys
      const padMap: Record<string, PadColor> = {
        '1': 'green',
        '2': 'red',
        '3': 'yellow',
        '4': 'blue',
        q: 'green',
        w: 'red',
        a: 'yellow',
        s: 'blue',
      }
      const pad = padMap[e.key.toLowerCase()]
      if (pad && phaseRef.current === 'input') {
        handlePadTap(pad)
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [start, resume, restart, pause, handlePadTap])

  // ── Cleanup ──
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close()
      }
    }
  }, [])

  return {
    canvasRef,
    gameState,
    phase,
    score,
    highScore,
    currentPlayerName,
    players,
    playerCount,
    activePad,
    inputProgress,
    start,
    pause,
    resume,
    restart,
    selectPlayerCount,
    handlePadTap,
    render,
    getSnapshot,
  }
}

// ── Hit test: which pad did the user tap? ──
export function hitTestPad(
  tapX: number,
  tapY: number,
  width: number,
  height: number,
): PadColor | null {
  const padAreaSize = Math.min(width, height) * 0.88
  const ox = (width - padAreaSize) / 2
  const oy = (height - padAreaSize) / 2
  const halfSize = padAreaSize / 2
  const centerR = padAreaSize * BOBINGTON.CENTER_CIRCLE_RADIUS

  const cx = ox + halfSize
  const cy = oy + halfSize

  // Exclude center circle
  const dist = Math.sqrt((tapX - cx) ** 2 + (tapY - cy) ** 2)
  if (dist < centerR) return null

  // Exclude outside pad area
  if (tapX < ox || tapX > ox + padAreaSize || tapY < oy || tapY > oy + padAreaSize) return null

  // Determine quadrant
  const col = tapX < cx ? 0 : 1
  const row = tapY < cy ? 0 : 1

  for (const [color, quad] of Object.entries(PAD_QUADRANTS)) {
    if (quad.row === row && quad.col === col) return color as PadColor
  }
  return null
}
