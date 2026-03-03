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
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const sizeRef = useRef({ width: 0, height: 0 })

  // Reactive state (for UI)
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'paused' | 'gameover'>(
    initialState ? 'paused' : 'idle'
  )
  const [score, setScore] = useState(initialState?.score ?? 0)
  const [highScore, setHighScore] = useState(getStoredHighScore)

  const scoreRef = useRef(initialState?.score ?? 0)

  // ---------- Canvas rendering ----------

  const render = useCallback((width: number, height: number) => {
    sizeRef.current = { width, height }
    const canvas = canvasRef.current
    if (!canvas) return

    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
    if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
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

    // Food (pulsing)
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

  // ---------- Game tick ----------

  const tick = useCallback(() => {
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

    // Wall collision
    if (
      newHead.x < 0 || newHead.x >= NOODLER.GRID_COLS ||
      newHead.y < 0 || newHead.y >= NOODLER.GRID_ROWS
    ) {
      setGameState('gameover')
      const finalScore = scoreRef.current
      if (finalScore > getStoredHighScore()) {
        setStoredHighScore(finalScore)
        setHighScore(finalScore)
      }
      return
    }

    // Self collision
    if (snake.some(s => s.x === newHead.x && s.y === newHead.y)) {
      setGameState('gameover')
      const finalScore = scoreRef.current
      if (finalScore > getStoredHighScore()) {
        setStoredHighScore(finalScore)
        setHighScore(finalScore)
      }
      return
    }

    // Ate food?
    const food = foodRef.current
    const ate = newHead.x === food.x && newHead.y === food.y

    const newSnake = [newHead, ...snake]
    if (!ate) {
      newSnake.pop()
    } else {
      scoreRef.current += 1
      setScore(scoreRef.current)
      foodRef.current = randomFood(newSnake)
      speedRef.current = Math.max(NOODLER.MIN_SPEED, speedRef.current - NOODLER.SPEED_INCREMENT)
      // Restart interval at new speed
      if (tickRef.current) clearInterval(tickRef.current)
      tickRef.current = setInterval(tick, speedRef.current)
    }

    snakeRef.current = newSnake

    // Render
    render(sizeRef.current.width, sizeRef.current.height)
  }, [render])

  // ---------- Controls ----------

  const clearTick = useCallback(() => {
    if (tickRef.current) {
      clearInterval(tickRef.current)
      tickRef.current = null
    }
  }, [])

  const startTick = useCallback(() => {
    clearTick()
    tickRef.current = setInterval(tick, speedRef.current)
  }, [tick, clearTick])

  const start = useCallback(() => {
    snakeRef.current = initialSnake()
    foodRef.current = randomFood(snakeRef.current)
    dirRef.current = NOODLER.INITIAL_DIRECTION
    nextDirRef.current = NOODLER.INITIAL_DIRECTION
    speedRef.current = NOODLER.INITIAL_SPEED
    scoreRef.current = 0
    setScore(0)
    setGameState('playing')
    startTick()
  }, [startTick])

  const pause = useCallback(() => {
    clearTick()
    setGameState('paused')
  }, [clearTick])

  const resume = useCallback(() => {
    setGameState('playing')
    startTick()
  }, [startTick])

  const restart = useCallback(() => {
    clearTick()
    start()
  }, [clearTick, start])

  const setDirection = useCallback((dir: Direction) => {
    // Prevent reversing
    if (OPPOSITE_DIRECTION[dir] !== dirRef.current) {
      nextDirRef.current = dir
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
        if (gameState === 'playing') pause()
        else if (gameState === 'paused') resume()
        else if (gameState === 'idle' || gameState === 'gameover') start()
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [gameState, setDirection, pause, resume, start])

  // Cleanup on unmount
  useEffect(() => {
    return () => clearTick()
  }, [clearTick])

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
