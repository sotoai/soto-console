'use client'

import { useState, useCallback } from 'react'
import { Download, RotateCcw, ArrowLeft } from 'lucide-react'
import { VideoPreview } from '../components/VideoPreview'
import type { UseRemixEngine } from '../engine/useRemixEngine'

interface ExportScreenProps {
  engine: UseRemixEngine
  onBack: () => void
  onStartOver: () => void
}

export function ExportScreen({ engine, onBack, onStartOver }: ExportScreenProps) {
  const [exporting, setExporting] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleExport = useCallback(async () => {
    setExporting(true)
    setProgress(0)

    try {
      const blob = await engine.exportVideo((p) => setProgress(p))

      // Trigger download
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `screaming-chicken-${Date.now()}.webm`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Export failed:', err)
    } finally {
      setExporting(false)
      setProgress(0)
    }
  }, [engine])

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Top bar */}
      <div
        className="shrink-0 flex items-center justify-between px-4 py-3"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full cursor-pointer transition-all active:scale-95"
          style={{
            background: 'rgba(255,255,255,0.08)',
            color: 'rgba(255,255,255,0.8)',
            fontSize: '13px',
          }}
        >
          <ArrowLeft size={14} />
          Back
        </button>

        <span
          className="font-semibold"
          style={{ color: 'rgba(255,255,255,0.9)', fontSize: '15px' }}
        >
          Your Remix
        </span>

        <div className="w-16" /> {/* spacer */}
      </div>

      {/* Preview */}
      <div className="flex-1 min-h-0 flex items-center justify-center px-4 py-4">
        <VideoPreview engine={engine} />
      </div>

      {/* Play/Pause */}
      <div className="shrink-0 flex justify-center pb-4">
        <button
          onClick={() =>
            engine.state.isPlaying ? engine.pause() : engine.play()
          }
          className="w-14 h-14 rounded-full flex items-center justify-center cursor-pointer transition-all active:scale-90"
          style={{
            background: 'rgba(255,255,255,0.12)',
            border: '1px solid rgba(255,255,255,0.15)',
            fontSize: '24px',
          }}
        >
          {engine.state.isPlaying ? '⏸' : '▶️'}
        </button>
      </div>

      {/* Action Buttons */}
      <div
        className="shrink-0 flex items-center justify-center gap-3 px-4 pb-6 pt-2"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <button
          onClick={onStartOver}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl cursor-pointer transition-all active:scale-95"
          style={{
            background: 'rgba(255,255,255,0.08)',
            color: 'rgba(255,255,255,0.7)',
            fontSize: '14px',
          }}
        >
          <RotateCcw size={16} />
          Start Over
        </button>

        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl cursor-pointer font-semibold transition-all active:scale-95 disabled:opacity-50"
          style={{
            background: exporting
              ? 'rgba(255,255,255,0.1)'
              : 'linear-gradient(135deg, #30D158, #00C7BE)',
            color: 'white',
            fontSize: '14px',
          }}
        >
          <Download size={16} />
          {exporting ? `Exporting… ${Math.round(progress * 100)}%` : 'Save Video'}
        </button>
      </div>
    </div>
  )
}
