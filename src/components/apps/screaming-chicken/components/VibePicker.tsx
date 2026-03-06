'use client'

import { X } from 'lucide-react'
import { VIBES, type VibeId } from '../config'

interface VibePickerProps {
  currentVibe: VibeId
  onSelect: (id: VibeId) => void
  onClose: () => void
}

export function VibePicker({ currentVibe, onSelect, onClose }: VibePickerProps) {
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
        <div className="flex items-center justify-between mb-4">
          <h3
            className="font-bold"
            style={{ fontSize: '18px', color: 'rgba(255,255,255,0.95)' }}
          >
            Pick a Vibe
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.1)' }}
          >
            <X size={16} className="text-white/60" />
          </button>
        </div>

        {/* Vibe Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {VIBES.map((vibe) => {
            const isActive = vibe.id === currentVibe
            return (
              <button
                key={vibe.id}
                onClick={() => onSelect(vibe.id)}
                className="flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all active:scale-95 outline-none text-left"
                style={{
                  background: isActive
                    ? 'rgba(255, 150, 0, 0.2)'
                    : 'rgba(255, 255, 255, 0.06)',
                  border: isActive
                    ? '1.5px solid rgba(255, 150, 0, 0.5)'
                    : '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <span style={{ fontSize: '24px' }}>{vibe.emoji}</span>
                <div>
                  <div
                    className="font-semibold"
                    style={{
                      fontSize: '13px',
                      color: isActive
                        ? 'rgba(255, 200, 100, 1)'
                        : 'rgba(255, 255, 255, 0.9)',
                    }}
                  >
                    {vibe.name}
                  </div>
                  <div
                    style={{
                      fontSize: '11px',
                      color: 'rgba(255,255,255,0.4)',
                    }}
                  >
                    {vibe.bpm} BPM
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
