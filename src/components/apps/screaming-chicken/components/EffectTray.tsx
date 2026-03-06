'use client'

import { EFFECTS, type EffectType } from '../config'

interface EffectTrayProps {
  activeEffects: EffectType[]
  onToggleEffect: (effect: EffectType) => void
  onTextPop: () => void
}

export function EffectTray({ activeEffects, onToggleEffect, onTextPop }: EffectTrayProps) {
  return (
    <div
      className="flex gap-2 overflow-x-auto pb-1"
      style={{
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
    >
      {EFFECTS.map((effect) => {
        const isActive = activeEffects.includes(effect.id)

        return (
          <button
            key={effect.id}
            onClick={() => {
              if (effect.id === 'text-pop') {
                onTextPop()
              } else {
                onToggleEffect(effect.id)
              }
            }}
            className="shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-xl cursor-pointer transition-all duration-150 active:scale-90 outline-none"
            style={{
              background: isActive
                ? 'rgba(255, 150, 0, 0.3)'
                : 'rgba(255, 255, 255, 0.06)',
              border: isActive
                ? '1px solid rgba(255, 150, 0, 0.5)'
                : '1px solid rgba(255, 255, 255, 0.08)',
              minWidth: '60px',
            }}
          >
            <span style={{ fontSize: '20px' }}>{effect.emoji}</span>
            <span
              className="font-medium"
              style={{
                fontSize: '10px',
                color: isActive
                  ? 'rgba(255, 200, 100, 1)'
                  : 'rgba(255, 255, 255, 0.6)',
                whiteSpace: 'nowrap',
              }}
            >
              {effect.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
