'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import {
  COLS,
  ROWS,
  PIECE_TYPES,
  TETROMINOES,
  PIECE_COLORS,
  PIECE_HIGHLIGHT,
  BG_COLOR,
  GRID_LINE_COLOR,
  GHOST_ALPHA,
  BORDER_COLOR,
  LOCK_DELAY,
  MAX_LOCK_RESETS,
  LINE_SCORES,
  SOFT_DROP_SCORE,
  HARD_DROP_SCORE,
  LINES_PER_LEVEL,
  getKicks,
  getSpeed,
  spawnPosition,
  type PieceType,
} from './chunko-config'

// ─── Types ───

interface ActivePiece {
  type: PieceType
  rotation: number
  row: number
  col: number
}

// Board cell: 0 = empty, 1–7 mapped to PIECE_TYPES index+1
type Board = number[][]

export interface ChunkoSnapshot {
  board: Board
  piece: ActivePiece
  nextType: PieceType
  score: number
  level: number
  lines: number
  bag: PieceType[]
  chunkoCount: number
}

interface EngineReturn {
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  gameState: 'idle' | 'playing' | 'paused' | 'gameover'
  score: number
  level: number
  linesCleared: number
  highScore: number
  nextType: PieceType
  chunkoFired: boolean
  chunkoCount: number
  clearChunko: () => void
  start: () => void
  pause: () => void
  resume: () => void
  restart: () => void
  moveLeft: () => void
  moveRight: () => void
  moveDown: () => boolean
  hardDrop: () => void
  rotateCW: () => void
  rotateCCW: () => void
  render: (width: number, height: number) => void
  getSnapshot: () => ChunkoSnapshot
}

// ─── Helpers ───

function pieceIndex(type: PieceType): number {
  return PIECE_TYPES.indexOf(type) + 1
}

function createEmptyBoard(): Board {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(0))
}

function shuffleBag(): PieceType[] {
  const bag = [...PIECE_TYPES]
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[bag[i], bag[j]] = [bag[j], bag[i]]
  }
  return bag
}

function getStoredHighScore(): number {
  if (typeof window === 'undefined') return 0
  return parseInt(localStorage.getItem('chunko-highscore') || '0', 10)
}

function setStoredHighScore(score: number) {
  if (typeof window === 'undefined') return
  localStorage.setItem('chunko-highscore', String(score))
}

// Get the absolute cell positions for a piece
function getCells(piece: ActivePiece): [number, number][] {
  const offsets = TETROMINOES[piece.type][piece.rotation]
  return offsets.map(([r, c]) => [piece.row + r, piece.col + c])
}

// Check if piece position is valid (in bounds and no collisions)
function isValid(piece: ActivePiece, board: Board): boolean {
  const cells = getCells(piece)
  for (const [r, c] of cells) {
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return false
    if (board[r][c] !== 0) return false
  }
  return true
}

// ─── Engine Hook ───

export function useChunkoEngine(initialState?: ChunkoSnapshot): EngineReturn {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  // Mutable game state (refs — no re-renders per tick)
  const boardRef = useRef<Board>(initialState?.board ?? createEmptyBoard())
  const pieceRef = useRef<ActivePiece>(initialState?.piece ?? {
    type: 'T', rotation: 0, ...spawnPosition(),
  })
  const nextTypeRef = useRef<PieceType>(initialState?.nextType ?? 'I')
  const bagRef = useRef<PieceType[]>(initialState?.bag ?? [])
  const scoreRef = useRef(initialState?.score ?? 0)
  const levelRef = useRef(initialState?.level ?? 1)
  const linesRef = useRef(initialState?.lines ?? 0)
  const sizeRef = useRef({ width: 0, height: 0 })

  // Lock delay tracking
  const lockTimerRef = useRef<number | null>(null) // timestamp when lock started
  const lockResetsRef = useRef(0)

  // rAF loop
  const rafRef = useRef<number | null>(null)
  const lastTickTimeRef = useRef(0)
  const gameStateRef = useRef<'idle' | 'playing' | 'paused' | 'gameover'>(
    initialState ? 'paused' : 'idle'
  )

  // Reactive state (for UI)
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'paused' | 'gameover'>(
    initialState ? 'paused' : 'idle'
  )
  const [score, setScore] = useState(initialState?.score ?? 0)
  const [level, setLevel] = useState(initialState?.level ?? 1)
  const [linesCleared, setLinesCleared] = useState(initialState?.lines ?? 0)
  const [highScore, setHighScore] = useState(getStoredHighScore)
  const [nextType, setNextType] = useState<PieceType>(initialState?.nextType ?? 'I')
  const [chunkoFired, setChunkoFired] = useState(false)
  const chunkoCountRef = useRef(initialState?.chunkoCount ?? 0)
  const [chunkoCount, setChunkoCount] = useState(initialState?.chunkoCount ?? 0)

  const updateGameState = useCallback((state: 'idle' | 'playing' | 'paused' | 'gameover') => {
    gameStateRef.current = state
    setGameState(state)
  }, [])

  const clearChunko = useCallback(() => setChunkoFired(false), [])

  // ─── Bag randomizer ───

  const nextFromBag = useCallback((): PieceType => {
    if (bagRef.current.length === 0) {
      bagRef.current = shuffleBag()
    }
    return bagRef.current.pop()!
  }, [])

  // ─── Piece spawning ───

  const spawnPiece = useCallback((): boolean => {
    const type = nextTypeRef.current
    const pos = spawnPosition()
    const piece: ActivePiece = { type, rotation: 0, row: pos.row, col: pos.col }

    nextTypeRef.current = nextFromBag()
    setNextType(nextTypeRef.current)
    lockTimerRef.current = null
    lockResetsRef.current = 0

    if (!isValid(piece, boardRef.current)) {
      // Game over — can't spawn
      pieceRef.current = piece
      return false
    }

    pieceRef.current = piece
    return true
  }, [nextFromBag])

  // ─── Movement ───

  const tryMove = useCallback((dRow: number, dCol: number): boolean => {
    const piece = pieceRef.current
    const moved = { ...piece, row: piece.row + dRow, col: piece.col + dCol }
    if (isValid(moved, boardRef.current)) {
      pieceRef.current = moved
      // Reset lock delay if piece moved down and was on a surface
      if (dRow > 0 && lockTimerRef.current !== null && lockResetsRef.current < MAX_LOCK_RESETS) {
        lockTimerRef.current = performance.now()
        lockResetsRef.current++
      }
      // Also reset on horizontal moves if on surface
      if (dCol !== 0 && lockTimerRef.current !== null && lockResetsRef.current < MAX_LOCK_RESETS) {
        lockTimerRef.current = performance.now()
        lockResetsRef.current++
      }
      return true
    }
    return false
  }, [])

  const tryRotate = useCallback((): boolean => {
    const piece = pieceRef.current
    const from = piece.rotation
    const to = (from + 1) % 4
    const kicks = getKicks(piece.type, from, to)

    for (const [dc, dr] of kicks) {
      const rotated = { ...piece, rotation: to, row: piece.row - dr, col: piece.col + dc }
      if (isValid(rotated, boardRef.current)) {
        pieceRef.current = rotated
        // Reset lock delay on successful rotation
        if (lockTimerRef.current !== null && lockResetsRef.current < MAX_LOCK_RESETS) {
          lockTimerRef.current = performance.now()
          lockResetsRef.current++
        }
        return true
      }
    }
    return false
  }, [])

  const tryRotateCCW = useCallback((): boolean => {
    const piece = pieceRef.current
    const from = piece.rotation
    const to = (from + 3) % 4 // CCW = 3 steps CW
    const kicks = getKicks(piece.type, from, to)

    for (const [dc, dr] of kicks) {
      const rotated = { ...piece, rotation: to, row: piece.row - dr, col: piece.col + dc }
      if (isValid(rotated, boardRef.current)) {
        pieceRef.current = rotated
        if (lockTimerRef.current !== null && lockResetsRef.current < MAX_LOCK_RESETS) {
          lockTimerRef.current = performance.now()
          lockResetsRef.current++
        }
        return true
      }
    }
    return false
  }, [])

  // ─── Ghost piece (projection) ───

  const getGhostRow = useCallback((): number => {
    const piece = pieceRef.current
    let ghostRow = piece.row
    while (true) {
      const test = { ...piece, row: ghostRow + 1 }
      if (!isValid(test, boardRef.current)) break
      ghostRow++
    }
    return ghostRow
  }, [])

  // ─── Lock piece and handle line clears ───

  const lockPiece = useCallback(() => {
    const piece = pieceRef.current
    const board = boardRef.current
    const idx = pieceIndex(piece.type)

    // Place piece on board
    const cells = getCells(piece)
    for (const [r, c] of cells) {
      if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
        board[r][c] = idx
      }
    }

    // Find completed lines
    const completedRows: number[] = []
    for (let r = ROWS - 1; r >= 0; r--) {
      if (board[r].every(cell => cell !== 0)) {
        completedRows.push(r)
      }
    }

    const cleared = completedRows.length

    if (cleared > 0) {
      // Remove completed rows and add empty rows at top
      const remaining = board.filter((_, i) => !completedRows.includes(i))
      const emptyRows = Array.from({ length: cleared }, () => Array(COLS).fill(0))
      boardRef.current = [...emptyRows, ...remaining]

      // Update score
      const lineScore = (LINE_SCORES[cleared] ?? cleared * 100) * levelRef.current
      scoreRef.current += lineScore
      setScore(scoreRef.current)

      // Update lines & level
      linesRef.current += cleared
      setLinesCleared(linesRef.current)
      const newLevel = Math.floor(linesRef.current / LINES_PER_LEVEL) + 1
      if (newLevel !== levelRef.current) {
        levelRef.current = newLevel
        setLevel(newLevel)
      }

      // CHUNKO! — 4 lines at once
      if (cleared === 4) {
        chunkoCountRef.current += 1
        setChunkoCount(chunkoCountRef.current)
        setChunkoFired(true)
      }
    }

    // Spawn next piece
    if (!spawnPiece()) {
      updateGameState('gameover')
      const finalScore = scoreRef.current
      if (finalScore > getStoredHighScore()) {
        setStoredHighScore(finalScore)
        setHighScore(finalScore)
      }
    }
  }, [spawnPiece, updateGameState])

  // ─── Canvas rendering ───

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

    const cellSize = Math.floor(Math.min(width / COLS, height / ROWS))
    const gridW = cellSize * COLS
    const gridH = cellSize * ROWS
    const ox = Math.floor((width - gridW) / 2)
    const oy = Math.floor((height - gridH) / 2)

    // Background
    ctx.fillStyle = BG_COLOR
    ctx.fillRect(0, 0, width, height)

    // Grid lines
    ctx.strokeStyle = GRID_LINE_COLOR
    ctx.lineWidth = 0.5
    for (let x = 0; x <= COLS; x++) {
      ctx.beginPath()
      ctx.moveTo(ox + x * cellSize, oy)
      ctx.lineTo(ox + x * cellSize, oy + gridH)
      ctx.stroke()
    }
    for (let y = 0; y <= ROWS; y++) {
      ctx.beginPath()
      ctx.moveTo(ox, oy + y * cellSize)
      ctx.lineTo(ox + gridW, oy + y * cellSize)
      ctx.stroke()
    }

    // Border
    ctx.strokeStyle = BORDER_COLOR
    ctx.lineWidth = 1
    ctx.strokeRect(ox, oy, gridW, gridH)

    // Helper to draw a cell
    const drawCell = (r: number, c: number, color: string, highlight: string, alpha = 1) => {
      const x = ox + c * cellSize + 1
      const y = oy + r * cellSize + 1
      const w = cellSize - 2
      const h = cellSize - 2

      ctx.globalAlpha = alpha
      ctx.fillStyle = color
      ctx.fillRect(x, y, w, h)

      // Inner highlight (top + left edge)
      ctx.fillStyle = highlight
      ctx.fillRect(x, y, w, 2)       // top edge
      ctx.fillRect(x, y, 2, h)       // left edge

      // Bottom-right shadow
      ctx.fillStyle = 'rgba(0,0,0,0.3)'
      ctx.fillRect(x, y + h - 2, w, 2) // bottom
      ctx.fillRect(x + w - 2, y, 2, h) // right

      ctx.globalAlpha = 1
    }

    // Draw locked cells
    const board = boardRef.current
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const cell = board[r][c]
        if (cell !== 0) {
          const pieceType = PIECE_TYPES[cell - 1]
          drawCell(r, c, PIECE_COLORS[pieceType], PIECE_HIGHLIGHT[pieceType])
        }
      }
    }

    // Draw ghost piece
    if (gameStateRef.current === 'playing') {
      const piece = pieceRef.current
      const ghostRow = getGhostRow()
      if (ghostRow !== piece.row) {
        const ghostPiece = { ...piece, row: ghostRow }
        const ghostCells = getCells(ghostPiece)
        for (const [r, c] of ghostCells) {
          if (r >= 0 && r < ROWS) {
            drawCell(r, c, PIECE_COLORS[piece.type], PIECE_HIGHLIGHT[piece.type], GHOST_ALPHA)
          }
        }
      }
    }

    // Draw active piece
    if (gameStateRef.current === 'playing' || gameStateRef.current === 'paused') {
      const piece = pieceRef.current
      const cells = getCells(piece)
      for (const [r, c] of cells) {
        if (r >= 0 && r < ROWS) {
          drawCell(r, c, PIECE_COLORS[piece.type], PIECE_HIGHLIGHT[piece.type])
        }
      }
    }

    ctx.restore()
  }, [getGhostRow])

  // Public render
  const render = useCallback((width: number, height: number) => {
    sizeRef.current = { width, height }
    renderCanvas(width, height)
  }, [renderCanvas])

  // ─── Game tick (gravity) ───

  const doTick = useCallback(() => {
    const moved = tryMove(1, 0)

    if (moved) {
      // Piece moved down — clear lock timer if it was set
      if (lockTimerRef.current !== null) {
        lockTimerRef.current = null
      }
    } else {
      // Can't move down — start or check lock delay
      if (lockTimerRef.current === null) {
        lockTimerRef.current = performance.now()
      } else if (performance.now() - lockTimerRef.current >= LOCK_DELAY) {
        lockPiece()
      }
    }
  }, [tryMove, lockPiece])

  // ─── rAF game loop ───

  const stopLoop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [])

  const gameLoop = useCallback((timestamp: number) => {
    if (gameStateRef.current !== 'playing') {
      renderCanvas(sizeRef.current.width, sizeRef.current.height)
      rafRef.current = null
      return
    }

    const elapsed = timestamp - lastTickTimeRef.current
    const speed = getSpeed(levelRef.current)

    if (elapsed >= speed) {
      lastTickTimeRef.current = timestamp
      doTick()
    }

    // Also check lock delay every frame (independent of gravity ticks)
    if (lockTimerRef.current !== null) {
      if (performance.now() - lockTimerRef.current >= LOCK_DELAY) {
        lockPiece()
      }
    }

    renderCanvas(sizeRef.current.width, sizeRef.current.height)

    if (gameStateRef.current === 'playing') {
      rafRef.current = requestAnimationFrame(gameLoop)
    } else {
      rafRef.current = null
    }
  }, [doTick, lockPiece, renderCanvas])

  const startLoop = useCallback(() => {
    stopLoop()
    lastTickTimeRef.current = performance.now()
    rafRef.current = requestAnimationFrame(gameLoop)
  }, [stopLoop, gameLoop])

  // ─── Controls ───

  const start = useCallback(() => {
    boardRef.current = createEmptyBoard()
    bagRef.current = shuffleBag()
    nextTypeRef.current = bagRef.current.pop()!
    scoreRef.current = 0
    levelRef.current = 1
    linesRef.current = 0
    lockTimerRef.current = null
    lockResetsRef.current = 0
    setScore(0)
    setLevel(1)
    setLinesCleared(0)
    setChunkoFired(false)
    chunkoCountRef.current = 0
    setChunkoCount(0)

    // Spawn first piece
    const type = bagRef.current.pop()!
    const pos = spawnPosition()
    pieceRef.current = { type, rotation: 0, row: pos.row, col: pos.col }
    nextTypeRef.current = bagRef.current.pop() ?? shuffleBag()[0]
    setNextType(nextTypeRef.current)

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

  const moveLeft = useCallback(() => { tryMove(0, -1) }, [tryMove])
  const moveRight = useCallback(() => { tryMove(0, 1) }, [tryMove])

  const moveDown = useCallback((): boolean => {
    const moved = tryMove(1, 0)
    if (moved) {
      scoreRef.current += SOFT_DROP_SCORE
      setScore(scoreRef.current)
    }
    return moved
  }, [tryMove])

  const hardDrop = useCallback(() => {
    let rows = 0
    while (tryMove(1, 0)) {
      rows++
    }
    scoreRef.current += rows * HARD_DROP_SCORE
    setScore(scoreRef.current)
    // Immediately lock
    lockPiece()
  }, [tryMove, lockPiece])

  const rotateCW = useCallback(() => { tryRotate() }, [tryRotate])
  const rotateCCW = useCallback(() => { tryRotateCCW() }, [tryRotateCCW])

  const getSnapshot = useCallback((): ChunkoSnapshot => ({
    board: boardRef.current.map(r => [...r]),
    piece: { ...pieceRef.current },
    nextType: nextTypeRef.current,
    score: scoreRef.current,
    level: levelRef.current,
    lines: linesRef.current,
    bag: [...bagRef.current],
    chunkoCount: chunkoCountRef.current,
  }), [])

  // ─── Keyboard ───

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (gameStateRef.current !== 'playing') {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault()
          const state = gameStateRef.current
          if (state === 'idle' || state === 'gameover') start()
          else if (state === 'paused') resume()
        }
        return
      }

      const keyMap: Record<string, () => void> = {
        ArrowLeft: moveLeft,
        ArrowRight: moveRight,
        ArrowDown: () => moveDown(),
        ArrowUp: rotateCW,
        a: moveLeft,
        A: moveLeft,
        d: moveRight,
        D: moveRight,
        s: () => moveDown(),
        S: () => moveDown(),
        w: rotateCW,
        W: rotateCW,
        z: rotateCCW,
        Z: rotateCCW,
      }

      if (keyMap[e.key]) {
        e.preventDefault()
        keyMap[e.key]()
      }

      if (e.key === ' ') {
        e.preventDefault()
        hardDrop()
      }

      if (e.key === 'p' || e.key === 'P') {
        e.preventDefault()
        pause()
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [start, resume, pause, moveLeft, moveRight, moveDown, hardDrop, rotateCW, rotateCCW])

  // Cleanup on unmount
  useEffect(() => {
    return () => stopLoop()
  }, [stopLoop])

  return {
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
  }
}
