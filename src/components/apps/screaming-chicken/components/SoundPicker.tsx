'use client'

import { X, Play } from 'lucide-react'
import { SOUNDS, type SoundId } from '../config'
import type { UseRemixEngine } from '../engine/useRemixEngine'

interface SoundPickerProps {
  currentSound: SoundId
  onSelect: (id: SoundId) => void
  onClose: () => void
  engine: UseRemixEngine
}

export function SoundPicker({ currentSound, onSelect, onClose, engine }: SoundPickerProps) {
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
            Pick a Sound
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.1)' }}
          >
            <X size={16} className="text-white/60" />
          </button>
        </div>

        {/* Sound List */}
        <div className="flex flex-col gap-2">
          {SOUNDS.map((sound) => {
            const isActive = sound.id === currentSound
            return (
              <div
                key={sound.id}
                className="flex items-center gap-3 p-3 rounded-2xl transition-all"
                style={{
                  background: isActive
                    ? 'rgba(255, 150, 0, 0.2)'
                    : 'rgba(255, 255, 255, 0.06)',
                  border: isActive
                    ? '1.5px solid rgba(255, 150, 0, 0.5)'
                    : '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                {/* Preview button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    engine.previewSound(sound.id)
                  }}
                  className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 cursor-pointer transition-all active:scale-90"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <Play size={14} className="text-white/80 ml-0.5" fill="currentColor" />
                </button>

                {/* Info */}
                <button
                  onClick={() => onSelect(sound.id)}
                  className="flex-1 text-left cursor-pointer outline-none"
                >
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: '18px' }}>{sound.emoji}</span>
                    <div>
                      <div
                        className="font-semibold"
                        style={{
                          fontSize: '14px',
                          color: isActive
                            ? 'rgba(255, 200, 100, 1)'
                            : 'rgba(255, 255, 255, 0.9)',
                        }}
                      >
                        {sound.name}
                      </div>
                      <div
                        style={{
                          fontSize: '11px',
                          color: 'rgba(255, 255, 255, 0.4)',
                        }}
                      >
                        {sound.description}
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
