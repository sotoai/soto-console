'use client'

import Link from 'next/link'
import { Tournament, Player } from '@/apps/game-roulette/types'
import { Badge } from '@/components/ui/Badge'
import { Trophy, Users, ChevronRight, Trash2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface TournamentCardProps {
  tournament: Tournament
  players: Player[]
  onDelete: (id: string) => void
}

const statusBadge: Record<string, 'warning' | 'info' | 'success'> = {
  draft: 'warning',
  active: 'info',
  completed: 'success',
}

export function TournamentCard({ tournament, players, onDelete }: TournamentCardProps) {
  const playerMap = Object.fromEntries(players.map(p => [p.id, p]))
  const tourneyPlayers = tournament.playerIds.map(id => playerMap[id]).filter(Boolean)
  const completedMatches = tournament.brackets.filter(m => m.status === 'completed').length

  return (
    <div className="rounded-[var(--radius-lg)] bg-[var(--bg-secondary)] card-interactive group relative px-5 py-5">
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => { e.preventDefault(); onDelete(tournament.id) }}
          className="p-1 rounded-[6px] text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-red-500/10 transition-colors cursor-pointer"
        >
          <Trash2 size={13} />
        </button>
      </div>

      <Link href={`/apps/game-roulette/tournaments/${tournament.id}`} className="block">
        <div className="flex items-start gap-2.5 mb-3">
          <div className="w-8 h-8 rounded-[10px] bg-amber-500/10 flex items-center justify-center shrink-0">
            <Trophy size={15} className="text-[var(--warning)]" strokeWidth={1.8} />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-[15px] text-[var(--text-primary)] truncate leading-tight">{tournament.name}</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Badge variant={statusBadge[tournament.status]}>{tournament.status}</Badge>
              <span className="text-[12px] text-[var(--text-muted)]">{tournament.format}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center mb-3">
          {tourneyPlayers.slice(0, 6).map((p, i) => (
            <div
              key={p.id}
              className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white border-2 border-[var(--bg-elevated)]"
              style={{ background: p.color, marginLeft: i === 0 ? 0 : -4 }}
            >
              {p.initials}
            </div>
          ))}
          {tourneyPlayers.length > 6 && (
            <span className="text-[11px] text-[var(--text-muted)] ml-1.5">+{tourneyPlayers.length - 6}</span>
          )}
        </div>

        <div className="flex items-center justify-between text-[12px] text-[var(--text-muted)] pt-3 mt-3">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center gap-1"><Users size={11} />{tournament.playerIds.length}</span>
            <span>{completedMatches}/{tournament.brackets.length} matches</span>
          </div>
          <div className="flex items-center gap-1">
            <span>{formatDate(tournament.createdAt)}</span>
            <ChevronRight size={13} className="text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors" />
          </div>
        </div>
      </Link>
    </div>
  )
}
