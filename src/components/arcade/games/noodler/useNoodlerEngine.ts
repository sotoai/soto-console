'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import {
  NOODLER,
  OPPOSITE_DIRECTION,
  type Direction,
  type Point,
} from './noodler-config'

export interface NoodlerSnapshot {
  snake: Point[]
  food: Point
  direction: Direction
  score: number
  speed: number
}

interface EngineReturn {
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  gameState: 'idle' | 'playing' | 'paused' | 'gameover'
  score: number
  highScore: number
  start: () => void
  pause: () => void
  resume: () => void
  restart: () => void
  setDirection: (dir: Direction) => void
  render: (width: number, height: number) => void
  getSnapshot: () => NoodlerSnapshot
}

function randomFood(snake: Point[]): Point {
  let p: Point
  do {
    p = {
      x: Math.floor(Math.random() * NOODLER.GRID_COLS),
      y: Math.floor(Math.random() * NOODLER.GRID_ROWS),
    }
  } while (snake.some(s => s.x === p.x && s.y === p.y))
  return p
}

function initialSnake(): Point[] {
  const mid = Math.floor(NOODLER.GRID_ROWS / 2)
  return Array.from({ length: NOODLER.INITIAL_LENGTH }, (_, i) => ({
    x: Math.floor(NOODLER.GRID_COLS / 2) - i,
    y: mid,
  }))
}

function getStoredHighScore(): number {
  if (typeof window === 'undefined') return 0
  return parseInt(localStorage.getItem('noodler-highscore') || '0', 10)
}

function setStoredHighScore(score: number) {
  if (typeof window === 'undefined') return
  localStorage.setItem('noodler-highscore', String(score))
}

export function useNoodlerEngine(initialState?: NoodlerSnapshot): EngineReturn {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  // Mutable game state (refs for performance — no re-renders per tick)
  const snakeRef = useRef<Point[]>(initialState?.snake ?? initialSnake())
  const foodRef = useRef<Point>(initialState?.food ?? randomFood(initialState?.snake ?? initialSnake()))
  const dirRef = useRef<Direction>(initialState?.direction ?? NOODLER.INITIAL_DIRECTION)
  const nextDirRef = useRef<Direction>(initialState?.direction ?? NOODLER.INITIAL_DIRECTION)
  const speedRef = useRef(initialState?.speed ?? NOODLER.INITIAL_SPEED)
  const sizeRef = useRef({ width: 0, height: 0 })

  // rAF-based game loop refs
  const rafRef = useRef<number | null>(null)
  const lastTickTimeRef = useRef(0)
  const dirChangedRef = useRef(false)
  const gameStateRef = useRef<'idle' | 'playing' | 'paused' | 'gameover'>(
    initialState ? 'paused' : 'idle'
  )

  // Reactive state (for UI only — game loop reads refs, not these)
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'paused' | 'gameover'>(
    initialState ? 'paused' : 'idle'
  )
  const [score, setScore] = useState(initialState?.score ?? 0)
  const [highScore, setHighScore] = useState(getStoredHighScore)

  const scoreRef = useRef(initialState?.score ?? 0)

  // Sync both reactive state and mutable ref
  const updateGameState = useCallback((state: 'idle' | 'playing' | 'paused' | 'gameover') => {
    gameStateRef.current = state
    setGameState(state)
  }, [])

  // ---------- Canvas rendering ----------

  const renderCanvas = useCallback((width: number, height: number) => {
    const canvas = canvasRef.current
    if (!canvas || width <= 0 || height <= 0) return

    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
    const roundedW = Math.round(width * dpr)
    const roundedH = Math.round(height * dpr)

    if (canvas.width !== roundedW || canvas.height !== roundedH) {
      canvas.width = roundedW
      canvas.height = roundedH
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.save()
    ctx.scale(dpr, dpr)

    const cellSize = Math.floor(Math.min(width / NOODLER.GRID_COLS, height / NOODLER.GRID_ROWS))
    const gridW = cellSize * NOODLER.GRID_COLS
    const gridH = cellSize * NOODLER.GRID_ROWS
    const ox = Math.floor((width - gridW) / 2)
    const oy = Math.floor((height - gridH) / 2)

    // Background
    ctx.fillStyle = NOODLER.BG_COLOR
    ctx.fillRect(0, 0, width, height)

    // Grid lines
    ctx.strokeStyle = NOODLER.GRID_LINE_COLOR
    ctx.lineWidth = 0.5
    for (let x = 0; x <= NOODLER.GRID_COLS; x++) {
      ctx.beginPath()
      ctx.moveTo(ox + x * cellSize, oy)
      ctx.lineTo(ox + x * cellSize, oy + gridH)
      ctx.stroke()
    }
    for (let y = 0; y <= NOODLER.GRID_ROWS; y++) {
      ctx.beginPath()
      ctx.moveTo(ox, oy + y * cellSize)
      ctx.lineTo(ox + gridW, oy + y * cellSize)
      ctx.stroke()
    }

    // Food (pulsing — smooth at 60fps thanks to rAF)
    const food = foodRef.current
    const pulse = 0.85 + Math.sin(Date.now() / 200) * 0.15
    ctx.fillStyle = NOODLER.FOOD_COLOR
    ctx.shadowColor = NOODLER.FOOD_COLOR
    ctx.shadowBlur = 8
    ctx.beginPath()
    ctx.arc(
      ox + food.x * cellSize + cellSize / 2,
      oy + food.y * cellSize + cellSize / 2,
      (cellSize / 2 - 2) * pulse,
      0,
      Math.PI * 2
    )
    ctx.fill()
    ctx.shadowBlur = 0

    // Snake
    const snake = snakeRef.current
    snake.forEach((seg, i) => {
      const isHead = i === 0
      ctx.fillStyle = isHead ? NOODLER.SNAKE_HEAD_COLOR : NOODLER.SNAKE_COLOR
      if (isHead) {
        ctx.shadowColor = NOODLER.SNAKE_HEAD_COLOR
        ctx.shadowBlur = 6
      }
      const r = NOODLER.BORDER_RADIUS
      const sx = ox + seg.x * cellSize + 1
      const sy = oy + seg.y * cellSize + 1
      const sw = cellSize - 2
      const sh = cellSize - 2
      ctx.beginPath()
      ctx.moveTo(sx + r, sy)
      ctx.lineTo(sx + sw - r, sy)
      ctx.quadraticCurveTo(sx + sw, sy, sx + sw, sy + r)
      ctx.lineTo(sx + sw, sy + sh - r)
      ctx.quadraticCurveTo(sx + sw, sy + sh, sx + sw - r, sy + sh)
      ctx.lineTo(sx + r, sy + sh)
      ctx.quadraticCurveTo(sx, sy + sh, sx, sy + sh - r)
      ctx.lineTo(sx, sy + r)
      ctx.quadraticCurveTo(sx, sy, sx + r, sy)
      ctx.closePath()
      ctx.fill()
      if (isHead) ctx.shadowBlur = 0
    })

    ctx.restore()
  }, [])

  // Public render (stores size + draws)
  const render = useCallback((width: number, height: number) => {
    sizeRef.current = { width, height }
    renderCanvas(width, height)
  }, [renderCanvas])

  // ---------- Game logic tick ----------

  const doTick = useCallback(() => {
    const snake = snakeRef.current
    const dir = nextDirRef.current

    // Validate direction (can't reverse)
    if (OPPOSITE_DIRECTION[dir] !== dirRef.current) {
      dirRef.current = dir
    }

    const head = snake[0]
    const d = dirRef.current
    const newHead: Point = {
      x: head.x + (d === 'right' ? 1 : d === 'left' ? -1 : 0),
      y: head.y + (d === 'down' ? 1 : d === 'up' ? -1 : 0),
    }

    // Wall collision → gameover (rAF loop stops automatically via gameStateRef check)
    if (
      newHead.x < 0 || newHead.x >= NOODLER.GRID_COLS ||
      newHead.y < 0 || newHead.y >= NOODLER.GRID_ROWS
    ) {
      updateGameState('gameover')
      const finalScore = scoreRef.current
      if (finalScore > getStoredHighScore()) {
        setStoredHighScore(finalScore)
        setHighScore(finalScore)
      }
      return
    }

    // Check food BEFORE self-collision so we know whether the tail will be removed
    const food = foodRef.current
    const ate = newHead.x === food.x && newHead.y === food.y

    // Self collision → gameover
    // When NOT eating food, the tail is about to be popped this tick,
    // so exclude it from collision — the cell it occupies will be free.
    const bodyToCheck = ate ? snake : snake.slice(0, -1)
    if (bodyToCheck.some(s => s.x === newHead.x && s.y === newHead.y)) {
      updateGameState('gameover')
      const finalScore = scoreRef.current
      if (finalScore > getStoredHighScore()) {
        setStoredHighScore(finalScore)
        setHighScore(finalScore)
      }
      return
    }

    const newSnake = [newHead, ...snake]
    if (!ate) {
      newSnake.pop()
    } else {
      scoreRef.current += 1
      setScore(scoreRef.current)
      foodRef.current = randomFood(newSnake)
      speedRef.current = Math.max(NOODLER.MIN_SPEED, speedRef.current - NOODLER.SPEED_INCREMENT)
    }

    snakeRef.current = newSnake
  }, [updateGameState])

  // ---------- rAF game loop ----------

  const stopLoop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [])

  const gameLoop = useCallback((timestamp: number) => {
    // If no longer playing, render one final frame and exit
    if (gameStateRef.current !== 'playing') {
      renderCanvas(sizeRef.current.width, sizeRef.current.height)
      rafRef.current = null
      return
    }

    const elapsed = timestamp - lastTickTimeRef.current
    const speed = speedRef.current

    // Early tick if direction changed and ≥30% of interval elapsed
    // This makes swipe/key input feel near-instant (~45ms worst case at 150ms speed)
    const earlyTick = dirChangedRef.current && elapsed >= speed * 0.3

    if (elapsed >= speed || earlyTick) {
      lastTickTimeRef.current = timestamp
      dirChangedRef.current = false
      doTick()
    }

    // Render every frame — smooth 60fps food pulsing + immediate visual updates
    renderCanvas(sizeRef.current.width, sizeRef.current.height)

    // Continue loop only if still playing (doTick may have set gameover)
    if (gameStateRef.current === 'playing') {
      rafRef.current = requestAnimationFrame(gameLoop)
    } else {
      // Final render already done above, just stop
      rafRef.current = null
    }
  }, [doTick, renderCanvas])

  const startLoop = useCallback(() => {
    stopLoop()
    lastTickTimeRef.current = performance.now()
    rafRef.current = requestAnimationFrame(gameLoop)
  }, [stopLoop, gameLoop])

  // ---------- Controls ----------

  const start = useCallback(() => {
    snakeRef.current = initialSnake()
    foodRef.current = randomFood(snakeRef.current)
    dirRef.current = NOODLER.INITIAL_DIRECTION
    nextDirRef.current = NOODLER.INITIAL_DIRECTION
    speedRef.current = NOODLER.INITIAL_SPEED
    scoreRef.current = 0
    setScore(0)
    updateGameState('playing')
    startLoop()
  }, [startLoop, updateGameState])

  const pause = useCallback(() => {
    stopLoop()
    updateGameState('paused')
  }, [stopLoop, updateGameState])

  const resume = useCallback(() => {
    updateGameState('playing')
    startLoop()
  }, [startLoop, updateGameState])

  const restart = useCallback(() => {
    stopLoop()
    start()
  }, [stopLoop, start])

  const setDirection = useCallback((dir: Direction) => {
    // Prevent reversing into yourself
    if (OPPOSITE_DIRECTION[dir] !== dirRef.current) {
      nextDirRef.current = dir
      dirChangedRef.current = true  // signals rAF loop to tick early
    }
  }, [])

  const getSnapshot = useCallback((): NoodlerSnapshot => ({
    snake: [...snakeRef.current],
    food: { ...foodRef.current },
    direction: dirRef.current,
    score: scoreRef.current,
    speed: speedRef.current,
  }), [])

  // ---------- Keyboard ----------

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const keyMap: Record<string, Direction> = {
        ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
        w: 'up', s: 'down', a: 'left', d: 'right',
        W: 'up', S: 'down', A: 'left', D: 'right',
      }

      if (keyMap[e.key]) {
        e.preventDefault()
        setDirection(keyMap[e.key])
      }

      if (e.key === ' ') {
        e.preventDefault()
        // Read from ref so this handler never goes stale
        const state = gameStateRef.current
        if (state === 'playing') pause()
        else if (state === 'paused') resume()
        else if (state === 'idle' || state === 'gameover') start()
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [setDirection, pause, resume, start])

  // Cleanup on unmount
  useEffect(() => {
    return () => stopLoop()
  }, [stopLoop])

  return {
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
  }
}
