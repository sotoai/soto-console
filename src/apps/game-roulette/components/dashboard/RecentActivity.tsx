'use client'

import { Challenge, Game, Player } from '@/apps/game-roulette/types'
import { Badge } from '@/components/ui/Badge'
import { Clock } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface RecentActivityProps {
  challenges: Challenge[]
  games: Game[]
  players: Player[]
}

const statusBadge: Record<string, 'warning' | 'info' | 'success'> = {
  pending: 'warning',
  'in-progress': 'info',
  completed: 'success',
}

export function RecentActivity({ challenges, games, players }: RecentActivityProps) {
  const recent = challenges.slice(0, 6)
  const gameMap = Object.fromEntries(games.map(g => [g.id, g]))
  const playerMap = Object.fromEntries(players.map(p => [p.id, p]))

  return (
    <div className="rounded-[var(--radius-lg)] bg-[var(--bg-secondary)] overflow-hidden">
      <div className="px-5 pt-4 pb-3 flex items-center gap-2">
        <Clock size={14} className="text-[var(--accent)]" strokeWidth={1.5} />
        <h3 className="font-semibold text-[15px] text-[var(--text-primary)]">Recent Activity</h3>
      </div>
      {recent.length === 0 ? (
        <div className="px-5 py-10 text-center text-[13px] text-[var(--text-muted)]">
          No challenges yet
        </div>
      ) : (
        <div>
          {recent.map(ch => {
            const game = gameMap[ch.gameId]
            const pNames = ch.playerIds.map(pid => playerMap[pid]?.name || 'Unknown').join(' vs ')
            return (
              <div key={ch.id} className="px-5 py-3.5 hover:bg-[var(--accent-soft)] transition-colors rounded-[var(--radius-sm)] mx-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[14px] font-medium text-[var(--text-primary)] truncate">
                    {game?.name || 'Unknown Game'}
                  </p>
                  <Badge variant={statusBadge[ch.status] || 'warning'}>{ch.status}</Badge>
                </div>
                <p className="text-[12px] text-[var(--text-secondary)] mt-1">{pNames}</p>
                <p className="text-[12px] text-[var(--text-muted)] mt-0.5">{formatDate(ch.createdAt)}</p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
