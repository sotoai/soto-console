'use client'

import { useState } from 'react'
import { X, Check } from 'lucide-react'

interface TrimSliderProps {
  duration: number
  trimStart: number
  trimEnd: number
  onTrim: (start: number, end: number) => void
  onClose: () => void
}

export function TrimSlider({
  duration,
  trimStart,
  trimEnd,
  onTrim,
  onClose,
}: TrimSliderProps) {
  const [start, setStart] = useState(trimStart)
  const [end, setEnd] = useState(trimEnd)

  const startSec = (start * duration).toFixed(1)
  const endSec = (end * duration).toFixed(1)
  const clipLength = ((end - start) * duration).toFixed(1)

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Panel */}
      <div
        className="relative w-full max-w-md rounded-t-3xl p-5 pb-8 animate-slide-up"
        style={{
          background: 'rgba(28, 28, 30, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderBottom: 'none',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={onClose}
            className="p-1.5 rounded-full cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.1)' }}
          >
            <X size={16} className="text-white/60" />
          </button>

          <h3
            className="font-bold"
            style={{ fontSize: '18px', color: 'rgba(255,255,255,0.95)' }}
          >
            Trim Clip
          </h3>

          <button
            onClick={() => onTrim(start, end)}
            className="p-1.5 rounded-full cursor-pointer"
            style={{ background: 'rgba(48, 209, 88, 0.2)' }}
          >
            <Check size={16} className="text-green-400" />
          </button>
        </div>

        {/* Clip length indicator */}
        <div className="text-center mb-4">
          <span
            className="font-mono font-bold"
            style={{
              fontSize: '28px',
              color: 'rgba(255,255,255,0.9)',
            }}
          >
            {clipLength}s
          </span>
          <p
            style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}
          >
            {startSec}s → {endSec}s of {duration.toFixed(1)}s
          </p>
        </div>

        {/* Visual trim bar */}
        <div
          className="relative h-12 rounded-xl mb-4 overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.06)' }}
        >
          {/* Active region */}
          <div
            className="absolute top-0 bottom-0 rounded-xl"
            style={{
              left: `${start * 100}%`,
              width: `${(end - start) * 100}%`,
              background: 'linear-gradient(135deg, rgba(255,150,0,0.4), rgba(255,60,48,0.4))',
              border: '2px solid rgba(255, 150, 0, 0.6)',
            }}
          />
        </div>

        {/* Start slider */}
        <div className="flex items-center gap-3 mb-3">
          <span
            className="font-medium w-12"
            style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}
          >
            Start
          </span>
          <input
            type="range"
            min={0}
            max={0.99}
            step={0.01}
            value={start}
            onChange={(e) => {
              const v = parseFloat(e.target.value)
              setStart(Math.min(v, end - 0.05))
            }}
            className="flex-1 accent-orange-500"
            style={{ height: '4px' }}
          />
          <span
            className="font-mono w-10 text-right"
            style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}
          >
            {startSec}s
          </span>
        </div>

        {/* End slider */}
        <div className="flex items-center gap-3">
          <span
            className="font-medium w-12"
            style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}
          >
            End
          </span>
          <input
            type="range"
            min={0.01}
            max={1}
            step={0.01}
            value={end}
            onChange={(e) => {
              const v = parseFloat(e.target.value)
              setEnd(Math.max(v, start + 0.05))
            }}
            className="flex-1 accent-orange-500"
            style={{ height: '4px' }}
          />
          <span
            className="font-mono w-10 text-right"
            style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}
          >
            {endSec}s
          </span>
        </div>

        {/* Tip */}
        <p
          className="mt-4 text-center"
          style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}
        >
          Keep it under 5 seconds for best results
        </p>
      </div>
    </div>
  )
}
