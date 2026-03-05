'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import {
  DROPSY,
  DROP_EMOJIS,
  SPICY_EMOJI,
  type FallingDrop,
} from './dropsy-config'

// ─── Types ───

export interface DropsySnapshot {
  pugX: number
  pugDirection: 1 | -1
  basketX: number
  drops: FallingDrop[]
  score: number
  level: number
  lives: number
  catchCount: number
  spicyCount: number
  nextSpicyAt: number
}

type GameState = 'idle' | 'playing' | 'paused' | 'gameover'

interface EngineReturn {
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  gameState: GameState
  score: number
  highScore: number
  lives: number
  level: number
  spicyCount: number
  spicyCaught: boolean
  clearSpicyCaught: () => void
  start: () => void
  pause: () => void
  resume: () => void
  restart: () => void
  setBasketX: (x: number) => void
  setKeyboardDirection: (dir: -1 | 0 | 1) => void
  render: (width: number, height: number) => void
  getSnapshot: () => DropsySnapshot
}

// ─── Helpers ───

function getStoredHighScore(): number {
  if (typeof window === 'undefined') return 0
  return parseInt(localStorage.getItem('dropsy-highscore') || '0', 10)
}

function setStoredHighScore(score: number) {
  if (typeof window === 'undefined') return
  localStorage.setItem('dropsy-highscore', String(score))
}

function randomSpicyTarget(): number {
  return DROPSY.SPICY_INTERVAL + Math.floor((Math.random() - 0.5) * 2 * DROPSY.SPICY_JITTER)
}

function randomEmoji(): string {
  return DROP_EMOJIS[Math.floor(Math.random() * DROP_EMOJIS.length)]
}

// ─── Sprite loader ───

function loadImage(src: string): HTMLImageElement {
  const img = new Image()
  img.src = src
  return img
}

// ─── Drawing helpers ───

function drawBrickWall(
  ctx: CanvasRenderingContext2D,
  canvasW: number,
  wallTop: number,
  wallH: number,
) {
  const rows = DROPSY.WALL_BRICK_ROWS
  const brickH = wallH / rows
  const brickW = brickH * 2.2
  const mortarSize = Math.max(1, brickH * 0.12)

  // Mortar background
  ctx.fillStyle = DROPSY.WALL_MORTAR_COLOR
  ctx.fillRect(0, wallTop, canvasW, wallH)

  // Draw bricks row by row
  for (let row = 0; row < rows; row++) {
    const y = wallTop + row * brickH
    const offset = row % 2 === 0 ? 0 : brickW * 0.5  // stagger
    const cols = Math.ceil(canvasW / brickW) + 2

    for (let col = -1; col < cols; col++) {
      const x = offset + col * brickW

      const bx = x + mortarSize / 2
      const by = y + mortarSize / 2
      const bw = brickW - mortarSize
      const bh = brickH - mortarSize

      if (bx + bw < 0 || bx > canvasW) continue

      // Main brick
      ctx.fillStyle = DROPSY.WALL_BRICK_COLOR
      ctx.fillRect(bx, by, bw, bh)

      // Top-left highlight
      ctx.fillStyle = DROPSY.WALL_BRICK_HIGHLIGHT
      ctx.fillRect(bx, by, bw, Math.max(1, bh * 0.18))
      ctx.fillRect(bx, by, Math.max(1, bw * 0.06), bh)

      // Bottom-right shadow
      ctx.fillStyle = DROPSY.WALL_SHADOW_COLOR
      ctx.fillRect(bx, by + bh - Math.max(1, bh * 0.15), bw, Math.max(1, bh * 0.15))
      ctx.fillRect(bx + bw - Math.max(1, bw * 0.04), by, Math.max(1, bw * 0.04), bh)
    }
  }

  // Wall top edge (darker line)
  ctx.fillStyle = DROPSY.WALL_SHADOW_COLOR
  ctx.fillRect(0, wallTop, canvasW, Math.max(1, mortarSize * 0.5))

  // Wall bottom edge cap
  ctx.fillStyle = DROPSY.WALL_MORTAR_COLOR
  ctx.fillRect(0, wallTop + wallH - 1, canvasW, 1)
}

function drawBasket(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  w: number, h: number,
) {
  // Bowl shape
  ctx.fillStyle = DROPSY.BASKET_COLOR
  ctx.beginPath()
  ctx.moveTo(cx - w / 2, cy - h / 3)
  ctx.quadraticCurveTo(cx - w / 2 * 0.8, cy + h, cx, cy + h * 0.8)
  ctx.quadraticCurveTo(cx + w / 2 * 0.8, cy + h, cx + w / 2, cy - h / 3)
  ctx.closePath()
  ctx.fill()

  // Rim
  ctx.fillStyle = DROPSY.BASKET_RIM_COLOR
  const rimH = Math.max(3, h * 0.12)
  ctx.fillRect(cx - w / 2 - 2, cy - h / 3 - rimH, w + 4, rimH + 1)

  // Weave lines
  ctx.strokeStyle = DROPSY.BASKET_WEAVE_COLOR
  ctx.lineWidth = 1
  for (let i = 1; i <= 3; i++) {
    const lineY = cy - h / 3 + (h * 0.85 * i) / 4
    const lineHalfW = (w / 2) * (1 - i * 0.1)
    ctx.beginPath()
    ctx.moveTo(cx - lineHalfW, lineY)
    ctx.lineTo(cx + lineHalfW, lineY)
    ctx.stroke()
  }
}

function drawLivesIndicator(
  ctx: CanvasRenderingContext2D,
  lives: number,
  _canvasW: number,
  canvasH: number,
) {
  const size = 10
  const spacing = 15
  const startX = 12
  const y = canvasH - 12
  for (let i = 0; i < lives; i++) {
    const bx = startX + i * spacing
    ctx.fillStyle = DROPSY.BASKET_COLOR
    ctx.beginPath()
    ctx.moveTo(bx - size / 2, y - size * 0.2)
    ctx.quadraticCurveTo(bx - size / 2 * 0.7, y + size * 0.5, bx, y + size * 0.4)
    ctx.quadraticCurveTo(bx + size / 2 * 0.7, y + size * 0.5, bx + size / 2, y - size * 0.2)
    ctx.closePath()
    ctx.fill()
  }
}

// ─── Engine Hook ───

export function useDropsyEngine(initialState?: DropsySnapshot): EngineReturn {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  // ── Sprites ──
  const spriteHeadRef = useRef<HTMLImageElement | null>(null)
  const spriteThrowLeftRef = useRef<HTMLImageElement | null>(null)
  const spriteThrowStraightRef = useRef<HTMLImageElement | null>(null)

  // Load sprites on mount
  useEffect(() => {
    spriteHeadRef.current = loadImage(DROPSY.SPRITE_HEAD)
    spriteThrowLeftRef.current = loadImage(DROPSY.SPRITE_THROW_LEFT)
    spriteThrowStraightRef.current = loadImage(DROPSY.SPRITE_THROW_STRAIGHT)
  }, [])

  // ── Mutable game state (refs) ──
  const pugXRef = useRef(initialState?.pugX ?? 0.5)
  const pugDirRef = useRef<1 | -1>(initialState?.pugDirection ?? 1)
  const pugBobRef = useRef(0)
  const pugThrowTimeRef = useRef(0)            // timestamp of last throw
  const pugThrowDirRef = useRef<-1 | 0 | 1>(0) // -1=left, 0=straight, 1=right

  const dropsRef = useRef<FallingDrop[]>(initialState?.drops ?? [])
  const dropIdRef = useRef(0)

  const basketXRef = useRef(initialState?.basketX ?? 0.5)
  const keyboardDirRef = useRef<-1 | 0 | 1>(0)

  const scoreRef = useRef(initialState?.score ?? 0)
  const levelRef = useRef(initialState?.level ?? 1)
  const livesRef = useRef(initialState?.lives ?? DROPSY.STARTING_LIVES)
  const catchCountRef = useRef(initialState?.catchCount ?? 0)
  const spicyCountRef = useRef(initialState?.spicyCount ?? 0)
  const nextSpicyAtRef = useRef(initialState?.nextSpicyAt ?? randomSpicyTarget())
  const lastExtraLifeScoreRef = useRef(0)

  const lastDropTimeRef = useRef(0)
  const lastFrameTimeRef = useRef(0)
  const sizeRef = useRef({ width: 0, height: 0 })
  const rafRef = useRef<number | null>(null)
  const gameStateRef = useRef<GameState>(initialState ? 'paused' : 'idle')

  // ── Reactive state (for UI) ──
  const [gameState, setGameState] = useState<GameState>(initialState ? 'paused' : 'idle')
  const [score, setScore] = useState(initialState?.score ?? 0)
  const [highScore, setHighScore] = useState(getStoredHighScore)
  const [lives, setLives] = useState(initialState?.lives ?? DROPSY.STARTING_LIVES)
  const [level, setLevel] = useState(initialState?.level ?? 1)
  const [spicyCount, setSpicyCount] = useState(initialState?.spicyCount ?? 0)
  const [spicyCaught, setSpicyCaught] = useState(false)

  const updateGameState = useCallback((state: GameState) => {
    gameStateRef.current = state
    setGameState(state)
  }, [])

  const clearSpicyCaught = useCallback(() => setSpicyCaught(false), [])

  // ── Level helpers ──
  const getLevelIndex = useCallback(() => Math.min(levelRef.current - 1, DROPSY.MAX_LEVEL - 1), [])

  // ── Basket position control ──
  const setBasketX = useCallback((x: number) => {
    const halfW = DROPSY.BASKET_WIDTH / 2
    basketXRef.current = Math.max(halfW, Math.min(1 - halfW, x))
  }, [])

  const setKeyboardDirection = useCallback((dir: -1 | 0 | 1) => {
    keyboardDirRef.current = dir
  }, [])

  // ── Update functions ──

  const updatePug = useCallback((dt: number) => {
    const idx = getLevelIndex()
    const speed = DROPSY.PUG_SPEEDS[idx]
    pugXRef.current += pugDirRef.current * speed * dt

    // Bounce off walls
    const halfW = DROPSY.PUG_WIDTH / 2
    if (pugXRef.current < halfW) {
      pugXRef.current = halfW
      pugDirRef.current = 1
    } else if (pugXRef.current > 1 - halfW) {
      pugXRef.current = 1 - halfW
      pugDirRef.current = -1
    }

    // Random direction change
    if (Math.random() < DROPSY.PUG_DIRECTION_CHANGE_CHANCE) {
      pugDirRef.current *= -1
    }

    // Bob animation
    pugBobRef.current = (pugBobRef.current + dt * 8) % (Math.PI * 2)
  }, [getLevelIndex])

  const updateBasketKeyboard = useCallback((dt: number) => {
    if (keyboardDirRef.current === 0) return
    const halfW = DROPSY.BASKET_WIDTH / 2
    basketXRef.current += keyboardDirRef.current * DROPSY.KEYBOARD_SPEED * dt
    basketXRef.current = Math.max(halfW, Math.min(1 - halfW, basketXRef.current))
  }, [])

  const spawnDrop = useCallback((timestamp: number) => {
    const idx = getLevelIndex()
    const isSpicy = catchCountRef.current >= nextSpicyAtRef.current
    const baseSpeed = DROPSY.FALL_SPEEDS[idx]

    // Set throw animation
    pugThrowTimeRef.current = timestamp
    // Pick throw direction: use pug's movement direction
    const r = Math.random()
    if (r < 0.3) {
      pugThrowDirRef.current = 0 // straight
    } else {
      pugThrowDirRef.current = pugDirRef.current // left or right
    }

    const drop: FallingDrop = {
      id: dropIdRef.current++,
      x: pugXRef.current,
      y: DROPSY.WALL_Y,  // drops start at wall level (appears to come from behind wall)
      emoji: isSpicy ? SPICY_EMOJI : randomEmoji(),
      isSpicy,
      speed: isSpicy ? baseSpeed * DROPSY.SPICY_SPEED_MULT : baseSpeed,
    }

    dropsRef.current.push(drop)
    lastDropTimeRef.current = timestamp

    if (isSpicy) {
      nextSpicyAtRef.current = catchCountRef.current + randomSpicyTarget()
    }
  }, [getLevelIndex])

  const updateDrops = useCallback((_dt: number) => {
    const drops = dropsRef.current
    const basketX = basketXRef.current
    const basketHalfW = DROPSY.BASKET_WIDTH / 2
    const dropR = DROPSY.DROP_SIZE / 2
    let changed = false

    for (let i = drops.length - 1; i >= 0; i--) {
      const drop = drops[i]
      drop.y += drop.speed * _dt

      // Check catch
      if (
        drop.y >= DROPSY.BASKET_Y - DROPSY.CATCH_TOLERANCE_Y &&
        drop.y <= DROPSY.BASKET_Y + DROPSY.CATCH_TOLERANCE_Y &&
        Math.abs(drop.x - basketX) < basketHalfW + dropR
      ) {
        drops.splice(i, 1)
        catchCountRef.current++

        // Score
        scoreRef.current += levelRef.current
        setScore(scoreRef.current)

        // Spicy catch
        if (drop.isSpicy) {
          spicyCountRef.current++
          setSpicyCount(spicyCountRef.current)
          setSpicyCaught(true)
        }

        // Level up
        if (
          catchCountRef.current % DROPSY.CATCHES_PER_LEVEL === 0 &&
          levelRef.current < DROPSY.MAX_LEVEL
        ) {
          levelRef.current++
          setLevel(levelRef.current)
        }

        // Extra life
        const nextLifeAt = lastExtraLifeScoreRef.current + DROPSY.EXTRA_LIFE_EVERY
        if (scoreRef.current >= nextLifeAt && livesRef.current < DROPSY.MAX_LIVES) {
          livesRef.current++
          setLives(livesRef.current)
          lastExtraLifeScoreRef.current = nextLifeAt
        }

        changed = true
        continue
      }

      // Check miss (passed bottom)
      if (drop.y > 1.05) {
        drops.splice(i, 1)

        // Spicy miss = no penalty
        if (!drop.isSpicy) {
          livesRef.current--
          setLives(livesRef.current)

          if (livesRef.current <= 0) {
            updateGameState('gameover')
            const finalScore = scoreRef.current
            if (finalScore > getStoredHighScore()) {
              setStoredHighScore(finalScore)
              setHighScore(finalScore)
            }
          }
        }

        changed = true
      }
    }

    return changed
  }, [updateGameState])

  // ── Canvas rendering ──

  const renderCanvas = useCallback((width: number, height: number) => {
    const canvas = canvasRef.current
    if (!canvas || width <= 0 || height <= 0) return

    sizeRef.current = { width, height }

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

    // Coord helpers
    const toX = (nx: number) => nx * width
    const toY = (ny: number) => ny * height
    const toW = (nw: number) => nw * width
    const toH = (nh: number) => nh * height

    // Background
    ctx.fillStyle = DROPSY.BG_COLOR
    ctx.fillRect(0, 0, width, height)

    // Subtle ground line
    const groundY = toY(DROPSY.BASKET_Y + DROPSY.BASKET_HEIGHT)
    ctx.strokeStyle = 'rgba(255,255,255,0.05)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(0, groundY)
    ctx.lineTo(width, groundY)
    ctx.stroke()

    // ── Draw pug sprite (BEHIND the wall) ──
    const pugCx = toX(pugXRef.current)
    const pugSpriteW = toW(DROPSY.PUG_WIDTH)
    const now = performance.now()
    const isThrowing = now - pugThrowTimeRef.current < DROPSY.THROW_DURATION
    const wallTopPx = toY(DROPSY.WALL_Y)

    ctx.save()
    // Enable pixelated rendering for retro sprites
    ctx.imageSmoothingEnabled = false

    if (isThrowing) {
      // ── Throwing pose ──
      const throwDir = pugThrowDirRef.current
      let sprite: HTMLImageElement | null = null

      if (throwDir === 0) {
        sprite = spriteThrowStraightRef.current
      } else {
        sprite = spriteThrowLeftRef.current
      }

      if (sprite && sprite.complete && sprite.naturalWidth > 0) {
        const aspectRatio = sprite.naturalHeight / sprite.naturalWidth
        const drawW = pugSpriteW * 1.4  // throwing sprites are wider (show arms)
        const drawH = drawW * aspectRatio
        // Position: bottom of sprite aligns with bottom of wall
        const wallBottomPx = wallTopPx + toH(DROPSY.WALL_HEIGHT)
        const drawY = wallBottomPx - drawH - 20

        ctx.save()
        ctx.translate(pugCx, 0)
        // Mirror for throwing right (sprite faces left by default)
        if (throwDir === 1) {
          ctx.scale(-1, 1)
        }
        ctx.drawImage(sprite, -drawW / 2, drawY, drawW, drawH)
        ctx.restore()
      }
    } else {
      // ── Walking pose (head only) ──
      const sprite = spriteHeadRef.current
      if (sprite && sprite.complete && sprite.naturalWidth > 0) {
        const aspectRatio = sprite.naturalHeight / sprite.naturalWidth
        const drawW = pugSpriteW * 1.2
        const drawH = drawW * aspectRatio
        // Bob animation
        const bob = Math.sin(pugBobRef.current) * toH(0.004)
        // Position: bottom of head sprite aligns with top of wall (head peeks above)
        const drawY = wallTopPx - drawH * 0.82 + bob - 20

        ctx.save()
        ctx.translate(pugCx, 0)
        // Default sprite faces left; mirror for right movement
        if (pugDirRef.current === 1) {
          ctx.scale(-1, 1)
        }
        ctx.drawImage(sprite, -drawW / 2, drawY, drawW, drawH)
        ctx.restore()
      }
    }

    ctx.restore()

    // ── Draw brick wall (ON TOP of pug, creating "behind wall" effect) ──
    drawBrickWall(ctx, width, wallTopPx, toH(DROPSY.WALL_HEIGHT))

    // ── Draw falling emojis (in front of wall) ──
    const emojiSize = Math.round(toW(DROPSY.DROP_SIZE) * 2.2)
    ctx.font = `${emojiSize}px sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    for (const drop of dropsRef.current) {
      ctx.save()
      if (drop.isSpicy) {
        ctx.shadowColor = DROPSY.SPICY_GLOW_COLOR
        ctx.shadowBlur = 14
      }
      ctx.fillText(drop.emoji, toX(drop.x), toY(drop.y))
      ctx.restore()
    }

    // Draw basket
    drawBasket(
      ctx,
      toX(basketXRef.current),
      toY(DROPSY.BASKET_Y),
      toW(DROPSY.BASKET_WIDTH),
      toH(DROPSY.BASKET_HEIGHT),
    )

    // Draw lives
    drawLivesIndicator(ctx, livesRef.current, width, height)

    ctx.restore()
  }, [])

  // ── Loop control ──

  const startLoop = useCallback(() => {
    if (rafRef.current !== null) return
    lastFrameTimeRef.current = performance.now()
    rafRef.current = requestAnimationFrame(gameLoop)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const stopLoop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [])

  // ── Game loop ──

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const gameLoop = useCallback((timestamp: number) => {
    if (gameStateRef.current !== 'playing') {
      renderCanvas(sizeRef.current.width, sizeRef.current.height)
      rafRef.current = null
      return
    }

    const dt = Math.min((timestamp - lastFrameTimeRef.current) / 1000, 0.05)
    lastFrameTimeRef.current = timestamp

    // Update
    updatePug(dt)
    updateBasketKeyboard(dt)
    updateDrops(dt)

    // Spawn check
    const idx = Math.min(levelRef.current - 1, DROPSY.MAX_LEVEL - 1)
    const dropInterval = DROPSY.DROP_INTERVALS[idx]
    if (timestamp - lastDropTimeRef.current >= dropInterval) {
      spawnDrop(timestamp)
    }

    // Render
    renderCanvas(sizeRef.current.width, sizeRef.current.height)

    // Continue
    if (gameStateRef.current === 'playing') {
      rafRef.current = requestAnimationFrame(gameLoop)
    } else {
      rafRef.current = null
    }
  }, [updatePug, updateBasketKeyboard, updateDrops, spawnDrop, renderCanvas])

  // Fix circular dep: startLoop needs gameLoop
  const startLoopRef = useRef(startLoop)
  startLoopRef.current = () => {
    if (rafRef.current !== null) return
    lastFrameTimeRef.current = performance.now()
    rafRef.current = requestAnimationFrame(gameLoop)
  }

  // ── Start / Pause / Resume / Restart ──

  const start = useCallback(() => {
    pugXRef.current = 0.5
    pugDirRef.current = 1
    pugBobRef.current = 0
    pugThrowTimeRef.current = 0
    pugThrowDirRef.current = 0
    basketXRef.current = 0.5
    dropsRef.current = []
    dropIdRef.current = 0
    scoreRef.current = 0
    levelRef.current = 1
    livesRef.current = DROPSY.STARTING_LIVES
    catchCountRef.current = 0
    spicyCountRef.current = 0
    nextSpicyAtRef.current = randomSpicyTarget()
    lastExtraLifeScoreRef.current = 0
    lastDropTimeRef.current = performance.now()

    setScore(0)
    setLevel(1)
    setLives(DROPSY.STARTING_LIVES)
    setSpicyCount(0)
    setSpicyCaught(false)

    updateGameState('playing')
    startLoopRef.current()
  }, [updateGameState])

  const pause = useCallback(() => {
    stopLoop()
    updateGameState('paused')
  }, [stopLoop, updateGameState])

  const resume = useCallback(() => {
    updateGameState('playing')
    startLoopRef.current()
  }, [updateGameState])

  const restart = useCallback(() => {
    stopLoop()
    start()
  }, [stopLoop, start])

  // ── Snapshot ──

  const getSnapshot = useCallback((): DropsySnapshot => ({
    pugX: pugXRef.current,
    pugDirection: pugDirRef.current,
    basketX: basketXRef.current,
    drops: dropsRef.current.map(d => ({ ...d })),
    score: scoreRef.current,
    level: levelRef.current,
    lives: livesRef.current,
    catchCount: catchCountRef.current,
    spicyCount: spicyCountRef.current,
    nextSpicyAt: nextSpicyAtRef.current,
  }), [])

  // ── Keyboard handler ──

  useEffect(() => {
    const downHandler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault()
        keyboardDirRef.current = -1
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault()
        keyboardDirRef.current = 1
      } else if (e.key === ' ') {
        e.preventDefault()
        const state = gameStateRef.current
        if (state === 'playing') pause()
        else if (state === 'paused') resume()
        else if (state === 'idle' || state === 'gameover') start()
      }
    }

    const upHandler = (e: KeyboardEvent) => {
      if (
        (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') &&
        keyboardDirRef.current === -1
      ) {
        keyboardDirRef.current = 0
      } else if (
        (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') &&
        keyboardDirRef.current === 1
      ) {
        keyboardDirRef.current = 0
      }
    }

    window.addEventListener('keydown', downHandler)
    window.addEventListener('keyup', upHandler)
    return () => {
      window.removeEventListener('keydown', downHandler)
      window.removeEventListener('keyup', upHandler)
    }
  }, [pause, resume, start])

  // ── Cleanup ──

  useEffect(() => {
    return () => stopLoop()
  }, [stopLoop])

  // ── Return ──

  return {
    canvasRef,
    gameState,
    score,
    highScore,
    lives,
    level,
    spicyCount,
    spicyCaught,
    clearSpicyCaught,
    start,
    pause,
    resume,
    restart,
    setBasketX,
    setKeyboardDirection,
    render: renderCanvas,
    getSnapshot,
  }
}
