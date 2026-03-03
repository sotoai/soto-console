'use client'

import { Player } from '@/apps/game-roulette/types'
import { Trophy } from 'lucide-react'

interface LeaderboardProps {
  players: Player[]
}

export function Leaderboard({ players }: LeaderboardProps) {
  const sorted = [...players].sort((a, b) => b.wins - a.wins || b.totalScore - a.totalScore).slice(0, 8)

  return (
    <div className="rounded-[var(--radius-lg)] bg-[var(--bg-secondary)] overflow-hidden">
      <div className="px-5 pt-4 pb-3 flex items-center gap-2">
        <Trophy size={14} className="text-[var(--warning)]" strokeWidth={1.5} />
        <h3 className="font-semibold text-[15px] text-[var(--text-primary)]">Leaderboard</h3>
        <span className="text-[13px] text-[var(--text-muted)] ml-auto">{sorted.length} players</span>
      </div>
      {sorted.length === 0 ? (
        <div className="px-5 py-10 text-center text-[13px] text-[var(--text-muted)]">
          No players yet
        </div>
      ) : (
        <div>
          {sorted.map((player, i) => (
            <div
              key={player.id}
              className="flex items-center gap-3 px-5 py-3 hover:bg-[var(--accent-soft)] transition-colors rounded-[var(--radius-sm)] mx-2"
            >
              <span className="w-5 text-[13px] font-semibold text-[var(--text-muted)] tabular-nums text-right">
                {i + 1}
              </span>
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                style={{ background: player.color }}
              >
                {player.initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-medium text-[var(--text-primary)] truncate leading-tight">{player.name}</p>
                <p className="text-[12px] text-[var(--text-muted)] leading-tight">
                  {player.wins}W &middot; {player.losses}L
                </p>
              </div>
              <span className="text-[13px] font-semibold tabular-nums text-[var(--text-secondary)]">
                {player.totalScore.toFixed(0)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
