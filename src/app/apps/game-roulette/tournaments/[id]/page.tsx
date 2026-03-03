'use client'

import { useState, useEffect, use } from 'react'
import { Tournament, Player } from '@/apps/game-roulette/types'
import { BracketView } from '@/apps/game-roulette/components/tournaments/BracketView'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Trophy, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function TournamentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch(`/api/apps/game-roulette/tournaments?id=${id}`).then(r => r.json()),
      fetch('/api/apps/game-roulette/players').then(r => r.json()),
    ]).then(([t, p]) => {
      setTournament(t)
      setPlayers(p)
      setLoading(false)
    })
  }, [id])

  const handleStartTournament = async () => {
    if (!tournament) return
    const res = await fetch('/api/apps/game-roulette/tournaments', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: tournament.id, status: 'active' }),
    })
    const updated = await res.json()
    setTournament(updated)
  }

  const handleMatchUpdate = async (matchId: string, winnerId: string, scores: Record<string, number>) => {
    if (!tournament) return
    const updatedBrackets = tournament.brackets.map(m => {
      if (m.id === matchId) {
        return { ...m, winnerId, scores, status: 'completed' as const }
      }
      return m
    })

    const completedMatch = updatedBrackets.find(m => m.id === matchId)
    if (completedMatch?.nextMatchId) {
      const nextMatch = updatedBrackets.find(m => m.id === completedMatch.nextMatchId)
      if (nextMatch && !nextMatch.playerIds.includes(winnerId)) {
        nextMatch.playerIds = [...nextMatch.playerIds, winnerId]
      }
    }

    const allComplete = updatedBrackets.every(m => m.status === 'completed' || m.playerIds.length < 2)
    const status = allComplete ? 'completed' : tournament.status

    const res = await fetch('/api/apps/game-roulette/tournaments', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: tournament.id, brackets: updatedBrackets, status }),
    })
    const updated = await res.json()
    setTournament(updated)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!tournament) {
    return <div className="text-center py-20 text-[var(--text-muted)]">Tournament not found</div>
  }

  const statusBadge: Record<string, 'warning' | 'info' | 'success'> = {
    draft: 'warning',
    active: 'info',
    completed: 'success',
  }

  const playerMap = Object.fromEntries(players.map(p => [p.id, p]))
  const finalMatch = tournament.brackets
    .filter(m => m.status === 'completed')
    .sort((a, b) => b.round - a.round)[0]
  const winner = finalMatch?.winnerId ? playerMap[finalMatch.winnerId] : null

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/apps/game-roulette/tournaments"
            className="p-2 rounded-[var(--radius-md)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-[28px] font-bold tracking-[-0.02em] text-[var(--text-primary)]">{tournament.name}</h2>
              <Badge variant={statusBadge[tournament.status]}>{tournament.status}</Badge>
            </div>
            <p className="text-[15px] text-[var(--text-secondary)]">
              {tournament.format} &middot; {tournament.playerIds.length} players &middot;{' '}
              {tournament.brackets.filter(m => m.status === 'completed').length}/{tournament.brackets.length} matches
            </p>
          </div>
        </div>
      </div>

      {tournament.status === 'completed' && winner && (
        <Card className="text-center bg-amber-500/5">
          <Trophy size={36} className="text-[var(--warning)] mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-[14px] text-[var(--text-secondary)]">Tournament Champion</p>
          <div className="flex items-center justify-center gap-3 mt-3">
            <div className="w-11 h-11 rounded-full flex items-center justify-center text-[15px] font-bold text-white" style={{ background: winner.color }}>
              {winner.initials}
            </div>
            <span className="text-2xl font-bold text-[var(--text-primary)]">{winner.name}</span>
          </div>
        </Card>
      )}

      <BracketView
        tournament={tournament}
        players={players}
        onMatchUpdate={handleMatchUpdate}
        onStartTournament={handleStartTournament}
      />
    </div>
  )
}
