'use client'

import type { BeatBlock as BeatBlockType } from '../config'
import { EFFECTS } from '../config'

interface BeatBlockProps {
  block: BeatBlockType
  index: number
  isSelected: boolean
  isCurrent: boolean
  isPlaying: boolean
  onSelect: (index: number) => void
}

export function BeatBlock({
  block,
  index,
  isSelected,
  isCurrent,
  isPlaying,
  onSelect,
}: BeatBlockProps) {
  const effectEmojis = block.effects
    .slice(0, 3)
    .map(e => EFFECTS.find(ef => ef.id === e)?.emoji ?? '')
    .join('')

  return (
    <button
      onClick={() => onSelect(index)}
      className="shrink-0 flex flex-col items-center justify-center gap-0.5 rounded-xl cursor-pointer transition-all duration-150 active:scale-90 outline-none"
      style={{
        width: '52px',
        height: '52px',
        background: isSelected
          ? 'rgba(255, 150, 0, 0.35)'
          : isCurrent && isPlaying
            ? 'rgba(255, 255, 255, 0.18)'
            : 'rgba(255, 255, 255, 0.08)',
        border: isSelected
          ? '2px solid rgba(255, 150, 0, 0.7)'
          : isCurrent && isPlaying
            ? '2px solid rgba(255, 255, 255, 0.3)'
            : '1px solid rgba(255, 255, 255, 0.1)',
        transform: isCurrent && isPlaying ? 'scale(1.08)' : undefined,
      }}
    >
      {/* Block number */}
      <span
        className="font-bold"
        style={{
          fontSize: '11px',
          color: isSelected
            ? 'rgba(255, 200, 100, 1)'
            : 'rgba(255, 255, 255, 0.6)',
        }}
      >
        {index + 1}
      </span>

      {/* Effect emojis */}
      {effectEmojis && (
        <span style={{ fontSize: '10px', lineHeight: 1 }}>{effectEmojis}</span>
      )}
    </button>
  )
}
