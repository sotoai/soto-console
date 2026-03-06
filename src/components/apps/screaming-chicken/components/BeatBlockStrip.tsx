'use client'

import type { BeatBlock as BeatBlockType } from '../config'
import { BeatBlock } from './BeatBlock'

interface BeatBlockStripProps {
  blocks: BeatBlockType[]
  selectedIndex: number
  currentIndex: number
  isPlaying: boolean
  onSelect: (index: number) => void
}

export function BeatBlockStrip({
  blocks,
  selectedIndex,
  currentIndex,
  isPlaying,
  onSelect,
}: BeatBlockStripProps) {
  return (
    <div className="w-full">
      {/* Label */}
      <div className="flex items-center justify-between mb-2">
        <span
          className="font-medium"
          style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}
        >
          BEAT BLOCKS
        </span>
        <span
          style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}
        >
          {blocks.length} beats
        </span>
      </div>

      {/* Scrollable strip */}
      <div
        className="flex gap-2 overflow-x-auto pb-1"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {blocks.map((block, i) => (
          <BeatBlock
            key={block.id}
            block={block}
            index={i}
            isSelected={i === selectedIndex}
            isCurrent={i === currentIndex}
            isPlaying={isPlaying}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  )
}
