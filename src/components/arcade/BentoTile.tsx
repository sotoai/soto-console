'use client'

import { Lock } from 'lucide-react'
import type { GameDefinition } from './games/types'

interface BentoTileProps {
  game: GameDefinition
  onSelect: (id: string) => void
  index: number
}

export function BentoTile({ game, onSelect, index }: BentoTileProps) {
  const handleClick = () => {
    if (!game.comingSoon) onSelect(game.id)
  }

  const emojiSize =
    game.tileSize === 'large' ? 'text-[48px]' :
    game.tileSize === 'medium' ? 'text-[36px]' :
    'text-[28px]'

  const nameSize =
    game.tileSize === 'large' ? 'text-[16px]' :
    game.tileSize === 'medium' ? 'text-[14px]' :
    'text-[13px]'

  return (
    <button
      onClick={handleClick}
      className={`
        relative w-full h-full overflow-hidden
        rounded-[var(--radius-md)]
        bg-gradient-to-br ${game.gradient}
        ${game.comingSoon ? 'cursor-default' : 'cursor-pointer'}
        animate-fade-in
        transition-transform duration-150
        ${!game.comingSoon ? 'active:scale-[0.97]' : ''}
      `}
      style={{ animationDelay: `${index * 40}ms` }}
    >
      {/* Subtle highlight for depth */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.4), transparent 70%)',
        }}
      />

      {/* Emoji / icon */}
      <div className="absolute inset-0 flex items-center justify-center pb-8">
        {game.emoji ? (
          <span
            className={emojiSize}
            style={{ filter: game.comingSoon ? 'grayscale(0.5)' : 'none' }}
          >
            {game.emoji}
          </span>
        ) : (
          <game.icon
            size={game.tileSize === 'large' ? 48 : game.tileSize === 'medium' ? 32 : 24}
            className="text-white/80"
            strokeWidth={1.5}
          />
        )}
      </div>

      {/* Bottom scrim + text */}
      <div className="absolute inset-x-0 bottom-0 p-3">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)',
          }}
        />
        <div className="relative z-10">
          <p className={`${nameSize} font-bold text-white leading-tight`}>
            {game.name}
          </p>
          {game.tagline && game.tileSize !== 'small' && (
            <p className="text-[11px] text-white/60 mt-0.5">{game.tagline}</p>
          )}
          {game.comingSoon && (
            <div className="flex items-center gap-1 mt-1">
              <Lock size={10} className="text-white/40" strokeWidth={2} />
              <span className="text-[9px] font-semibold text-white/40 uppercase tracking-wider">
                Coming Soon
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Desaturation overlay for coming-soon */}
      {game.comingSoon && (
        <div className="absolute inset-0 bg-black/20 pointer-events-none" />
      )}
    </button>
  )
}
