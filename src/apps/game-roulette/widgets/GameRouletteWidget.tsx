'use client'

import { useEffect, useState } from 'react'
import { Trophy, Swords, Gamepad2 } from 'lucide-react'
import type { WidgetProps } from '@/types'
import Link from 'next/link'

interface WidgetData {
  games: number
  players: number
  activeChallenges: number
  tournaments: number
}

export function GameRouletteWidget({ className, style }: WidgetProps) {
  const [data, setData] = useState<WidgetData | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const [gamesRes, playersRes, challengesRes, tournamentsRes] = await Promise.all([
          fetch('/api/apps/game-roulette/games'),
          fetch('/api/apps/game-roulette/players'),
          fetch('/api/apps/game-roulette/challenges'),
          fetch('/api/apps/game-roulette/tournaments'),
        ])
        const games = await gamesRes.json()
        const players = await playersRes.json()
        const challenges = await challengesRes.json()
        const tournaments = await tournamentsRes.json()
        setData({
          games: Array.isArray(games) ? games.length : 0,
          players: Array.isArray(players) ? players.length : 0,
          activeChallenges: Array.isArray(challenges) ? challenges.filter((c: { status: string }) => c.status !== 'completed').length : 0,
          tournaments: Array.isArray(tournaments) ? tournaments.length : 0,
        })
      } catch {
        setData({ games: 0, players: 0, activeChallenges: 0, tournaments: 0 })
      }
    }
    load()
  }, [])

  return (
    <Link href="/apps/game-roulette" className={`block ${className || ''}`} style={style}>
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-9 h-9 rounded-[12px] bg-[var(--accent)] flex items-center justify-center">
          <Gamepad2 size={17} className="text-white" strokeWidth={1.5} />
        </div>
        <h3 className="font-semibold text-[15px] text-[var(--text-primary)]">GameRoulette</h3>
      </div>

      {data ? (
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <p className="text-xl font-bold tabular-nums text-[var(--text-primary)]">{data.activeChallenges}</p>
            <p className="text-[12px] text-[var(--text-muted)]">Active</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold tabular-nums text-[var(--text-primary)]">{data.players}</p>
            <p className="text-[12px] text-[var(--text-muted)]">Players</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold tabular-nums text-[var(--text-primary)]">{data.tournaments}</p>
            <p className="text-[12px] text-[var(--text-muted)]">Tourneys</p>
          </div>
        </div>
      ) : (
        <div className="h-12 flex items-center justify-center text-[12px] text-[var(--text-muted)]">
          Loading...
        </div>
      )}
    </Link>
  )
}
