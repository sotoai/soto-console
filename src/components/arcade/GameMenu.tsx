'use client'

import { ChevronRight } from 'lucide-react'
import { GAMES } from './games/registry'

interface GameMenuProps {
  onSelectGame: (gameId: string) => void
}

export function GameMenu({ onSelectGame }: GameMenuProps) {
  return (
    <div className="space-y-2">
      {GAMES.map((game, i) => (
        <button
          key={game.id}
          onClick={() => onSelectGame(game.id)}
          className="w-full flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-[var(--radius-md)] bg-[var(--wp-control-bg)] active:bg-[var(--wp-control-active)] transition-colors duration-150 cursor-pointer animate-fade-in"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          {/* Icon */}
          <div
            className={`w-10 h-10 rounded-[var(--radius-sm)] bg-gradient-to-br ${game.gradient} flex items-center justify-center shrink-0`}
          >
            <game.icon size={20} className="text-white" strokeWidth={1.5} />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 text-left">
            <p className="text-[14px] font-semibold text-[var(--wp-text)]">
              {game.name}
            </p>
            <p className="text-[11px] text-[var(--wp-text-tertiary)]">
              {game.description}
            </p>
          </div>

          {/* Chevron */}
          <ChevronRight size={16} className="text-[var(--wp-text-muted)] shrink-0" strokeWidth={1.5} />
        </button>
      ))}
    </div>
  )
}
