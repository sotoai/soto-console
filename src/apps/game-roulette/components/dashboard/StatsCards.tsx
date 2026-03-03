'use client'

import { Gamepad2, Users, Trophy, Swords } from 'lucide-react'

interface StatsCardsProps {
  gameCount: number
  playerCount: number
  tournamentCount: number
  challengeCount: number
}

const stats = [
  { key: 'games', label: 'Games', icon: Gamepad2, color: 'var(--accent)' },
  { key: 'players', label: 'Players', icon: Users, color: 'var(--accent-secondary)' },
  { key: 'tournaments', label: 'Tournaments', icon: Trophy, color: 'var(--warning)' },
  { key: 'challenges', label: 'Challenges', icon: Swords, color: 'var(--success)' },
] as const

export function StatsCards({ gameCount, playerCount, tournamentCount, challengeCount }: StatsCardsProps) {
  const counts: Record<string, number> = {
    games: gameCount,
    players: playerCount,
    tournaments: tournamentCount,
    challenges: challengeCount,
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
      {stats.map(s => (
        <div
          key={s.key}
          className="rounded-[var(--radius-lg)] bg-[var(--bg-secondary)] flex items-center gap-4 px-5 py-4"
        >
          <div
            className="w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0"
            style={{ background: `color-mix(in srgb, ${s.color} 10%, transparent)` }}
          >
            <s.icon size={18} style={{ color: s.color }} strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-2xl font-bold text-[var(--text-primary)] tabular-nums leading-none">
              {counts[s.key]}
            </p>
            <p className="text-[13px] text-[var(--text-muted)] mt-0.5">{s.label}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
