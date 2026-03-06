// ─── Canvas Effect Rendering ───
// Each effect is applied as a post-process on the canvas after the video frame is drawn.

import type { BeatBlock } from '../config'

/**
 * Apply all effects for a block to the canvas.
 * Called after the base video frame is drawn.
 */
export function applyEffects(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  block: BeatBlock,
  progress: number, // 0–1 progress through this beat
): void {
  const w = canvas.width
  const h = canvas.height

  for (const effect of block.effects) {
    switch (effect) {
      case 'zoom':
        applyZoom(ctx, w, h, progress)
        break
      case 'shake':
        applyShake(ctx, w, h, progress)
        break
      case 'flash':
        applyFlash(ctx, w, h, progress)
        break
      case 'glitch':
        applyGlitch(ctx, w, h, progress)
        break
      case 'text-pop':
        if (block.text) {
          applyTextPop(ctx, w, h, progress, block.text)
        }
        break
      // stutter, freeze, reverse, speed-up, slow-down, repeat
      // are handled in the engine's renderFrame (they affect video seeking)
    }
  }
}

// ── Zoom Punch ──
function applyZoom(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  progress: number,
): void {
  // Quick zoom in at start of beat, ease out
  const t = progress < 0.3 ? progress / 0.3 : 1 - (progress - 0.3) / 0.7
  const scale = 1 + t * 0.4 // up to 1.4x

  if (scale <= 1.01) return

  // Capture current frame
  const imageData = ctx.getImageData(0, 0, w, h)
  ctx.clearRect(0, 0, w, h)

  // Draw scaled from center
  ctx.save()
  ctx.translate(w / 2, h / 2)
  ctx.scale(scale, scale)
  ctx.translate(-w / 2, -h / 2)
  ctx.putImageData(imageData, 0, 0)
  ctx.restore()
}

// ── Screen Shake ──
function applyShake(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  progress: number,
): void {
  // Intensity fades out over the beat
  const intensity = (1 - progress) * 12
  if (intensity < 1) return

  const dx = (Math.random() - 0.5) * intensity * 2
  const dy = (Math.random() - 0.5) * intensity * 2

  const imageData = ctx.getImageData(0, 0, w, h)
  ctx.clearRect(0, 0, w, h)
  ctx.putImageData(imageData, Math.round(dx), Math.round(dy))
}

// ── Flash ──
function applyFlash(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  progress: number,
): void {
  // White flash at start of beat, fades quickly
  if (progress > 0.15) return
  const alpha = (1 - progress / 0.15) * 0.85
  ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`
  ctx.fillRect(0, 0, w, h)
}

// ── Glitch ──
function applyGlitch(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  progress: number,
): void {
  // Horizontal slice displacement
  const sliceCount = 6 + Math.floor(Math.random() * 6)
  const sliceH = Math.ceil(h / sliceCount)
  const intensity = (1 - progress) * 30

  if (intensity < 2) return

  const imageData = ctx.getImageData(0, 0, w, h)

  for (let i = 0; i < sliceCount; i++) {
    if (Math.random() > 0.5) continue // Only glitch some slices
    const y = i * sliceH
    const sliceData = ctx.getImageData(0, y, w, Math.min(sliceH, h - y))
    const dx = Math.round((Math.random() - 0.5) * intensity * 2)
    ctx.putImageData(sliceData, dx, y)
  }

  // RGB channel shift (red channel offset)
  if (progress < 0.4) {
    ctx.globalCompositeOperation = 'screen'
    ctx.fillStyle = `rgba(255, 0, 0, 0.08)`
    ctx.fillRect(4, 0, w, h)
    ctx.fillStyle = `rgba(0, 255, 255, 0.05)`
    ctx.fillRect(-4, 0, w, h)
    ctx.globalCompositeOperation = 'source-over'
  }
}

// ── Text Pop ──
function applyTextPop(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  progress: number,
  text: string,
): void {
  // Scale animation: grow in, hold, shrink out
  let scale: number
  if (progress < 0.15) {
    scale = progress / 0.15
  } else if (progress < 0.7) {
    scale = 1
  } else {
    scale = 1 - (progress - 0.7) / 0.3
  }

  const fontSize = Math.round(Math.min(w, h) * 0.12 * Math.max(scale, 0.01))
  if (fontSize < 4) return

  ctx.save()
  ctx.font = `900 ${fontSize}px -apple-system, "SF Pro Display", system-ui, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  // Black stroke
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)'
  ctx.lineWidth = fontSize * 0.12
  ctx.lineJoin = 'round'
  ctx.strokeText(text, w / 2, h * 0.5)

  // White fill
  ctx.fillStyle = 'white'
  ctx.fillText(text, w / 2, h * 0.5)

  ctx.restore()
}

// ── Capture a frame for stutter effect ──
export function captureStutterFrame(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
): ImageData {
  return ctx.getImageData(0, 0, w, h)
}
