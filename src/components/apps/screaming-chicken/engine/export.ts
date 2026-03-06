// ─── MediaRecorder-based Video Export ───
// Renders the remix frame-by-frame to canvas, captures as video stream, and exports.

import type { RemixState, BeatBlock } from '../config'
import { beatDuration } from '../config'
import { applyEffects } from './effects'

interface ExportOptions {
  canvas: HTMLCanvasElement
  video: HTMLVideoElement
  state: RemixState
  onProgress?: (progress: number) => void
}

/**
 * Export the remix as a WebM video blob.
 * Renders at 30fps by stepping through each beat block.
 */
export async function exportRemix({
  canvas,
  video,
  state,
  onProgress,
}: ExportOptions): Promise<Blob> {
  const { blocks, bpm, trimStart, trimEnd, videoDuration } = state
  const secPerBeat = beatDuration(bpm)
  const totalDuration = blocks.length * secPerBeat
  const fps = 30
  const totalFrames = Math.ceil(totalDuration * fps)

  // Create an offscreen canvas at the same size
  const offCanvas = document.createElement('canvas')
  offCanvas.width = canvas.width || 640
  offCanvas.height = canvas.height || 360
  const offCtx = offCanvas.getContext('2d')!

  const stream = offCanvas.captureStream(fps)

  // Determine MIME type support
  const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
    ? 'video/webm;codecs=vp9'
    : MediaRecorder.isTypeSupported('video/webm')
      ? 'video/webm'
      : 'video/webm'

  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: 2_500_000,
  })

  const chunks: Blob[] = []
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data)
  }

  const done = new Promise<Blob>((resolve, reject) => {
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType })
      resolve(blob)
    }
    recorder.onerror = (e) => reject(e)
  })

  recorder.start()

  // Render frames sequentially
  const trimmedStart = trimStart * videoDuration
  const trimmedDuration = (trimEnd - trimStart) * videoDuration

  for (let frame = 0; frame < totalFrames; frame++) {
    const time = frame / fps
    const blockIndex = Math.min(
      Math.floor(time / secPerBeat),
      blocks.length - 1,
    )
    const blockProgress = (time % secPerBeat) / secPerBeat
    const block = blocks[blockIndex]

    if (block) {
      // Seek video
      let seekNorm =
        block.clipStart + (block.clipEnd - block.clipStart) * blockProgress
      if (block.reversed) {
        seekNorm =
          block.clipEnd - (block.clipEnd - block.clipStart) * blockProgress
      }

      const seekTime = trimmedStart + seekNorm * trimmedDuration
      video.currentTime = Math.max(0, Math.min(seekTime, videoDuration - 0.01))

      // Wait for seek to complete
      await new Promise<void>((resolve) => {
        const onSeeked = () => {
          video.removeEventListener('seeked', onSeeked)
          resolve()
        }
        // If already at the right time, resolve immediately
        if (Math.abs(video.currentTime - seekTime) < 0.05) {
          resolve()
        } else {
          video.addEventListener('seeked', onSeeked, { once: true })
        }
      })

      // Draw frame
      offCtx.clearRect(0, 0, offCanvas.width, offCanvas.height)
      offCtx.drawImage(video, 0, 0, offCanvas.width, offCanvas.height)

      // Apply effects
      applyEffects(offCtx, offCanvas, block, blockProgress)
    }

    // Report progress
    onProgress?.(frame / totalFrames)

    // Small delay to let MediaRecorder capture the frame
    await new Promise((r) => setTimeout(r, 1000 / fps))
  }

  recorder.stop()
  onProgress?.(1)

  return done
}
