'use client'

import { useRef, useEffect, useCallback } from 'react'
import type { UseRemixEngine } from '../engine/useRemixEngine'

interface VideoPreviewProps {
  engine: UseRemixEngine
}

export function VideoPreview({ engine }: VideoPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Resize canvas to fit container while maintaining 16:9
  const resizeCanvas = useCallback(() => {
    const container = containerRef.current
    const canvas = engine.canvasRef.current
    if (!container || !canvas) return

    const containerW = container.clientWidth
    const containerH = container.clientHeight

    // Fit 16:9 inside container
    const aspect = 16 / 9
    let w = containerW
    let h = containerW / aspect

    if (h > containerH) {
      h = containerH
      w = containerH * aspect
    }

    // Use DPR for sharp rendering
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.round(w * dpr)
    canvas.height = Math.round(h * dpr)
    canvas.style.width = `${Math.round(w)}px`
    canvas.style.height = `${Math.round(h)}px`
  }, [engine.canvasRef])

  useEffect(() => {
    resizeCanvas()
    const observer = new ResizeObserver(resizeCanvas)
    if (containerRef.current) observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [resizeCanvas])

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center relative"
    >
      {/* Hidden video element — used as source for canvas drawing */}
      <video
        ref={engine.videoRef}
        src={engine.state.sourceVideo ?? undefined}
        muted
        playsInline
        preload="auto"
        className="hidden"
      />

      {/* Visible canvas */}
      <canvas
        ref={engine.canvasRef}
        className="rounded-xl"
        style={{
          background: 'rgba(0, 0, 0, 0.5)',
          maxWidth: '100%',
          maxHeight: '100%',
        }}
      />

      {/* No-video placeholder */}
      {!engine.state.sourceVideo && (
        <div className="absolute inset-0 flex items-center justify-center rounded-xl"
          style={{ background: 'rgba(0,0,0,0.3)' }}
        >
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>
            No clip loaded
          </span>
        </div>
      )}
    </div>
  )
}
