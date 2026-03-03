'use client'

import { type CSSProperties } from 'react'
import { GAMES } from './games/registry'
import { BentoTile } from './BentoTile'
import { useViewport } from '@/hooks/useViewport'

interface BentoGridProps {
  onSelectGame: (gameId: string) => void
}

const SPAN: Record<string, string> = {
  large: 'col-span-2 row-span-2',
  medium: 'col-span-2',
  small: '',
}

export function BentoGrid({ onSelectGame }: BentoGridProps) {
  const { isMobile } = useViewport()

  const gridStyle: CSSProperties = {
    gridAutoRows: isMobile ? 'minmax(100px, auto)' : '1fr',
    gridAutoFlow: 'dense',
  }

  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 h-full overflow-y-auto pb-2"
      style={gridStyle}
    >
      {GAMES.map((game, i) => (
        <div key={game.id} className={SPAN[game.tileSize] || ''}>
          <BentoTile game={game} onSelect={onSelectGame} index={i} />
        </div>
      ))}
    </div>
  )
}
