'use client'

import { useState, useEffect } from 'react'
import { Tournament, Player, Game } from '@/apps/game-roulette/types'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { TournamentForm } from '@/apps/game-roulette/components/tournaments/TournamentForm'
import { TournamentCard } from '@/apps/game-roulette/components/tournaments/TournamentCard'
import { Trophy, Plus } from 'lucide-react'

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [games, setGames] = useState<Game[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/apps/game-roulette/tournaments').then(r => r.json()),
      fetch('/api/apps/game-roulette/players').then(r => r.json()),
      fetch('/api/apps/game-roulette/games').then(r => r.json()),
    ]).then(([t, p, g]) => {
      setTournaments(t)
      setPlayers(p)
      setGames(g)
      setLoading(false)
    })
  }, [])

  const handleCreate = async (data: { name: string; format: Tournament['format']; playerIds: string[]; gameIds: string[] }) => {
    const res = await fetch('/api/apps/game-roulette/tournaments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const tournament = await res.json()
    setTournaments(prev => [tournament, ...prev])
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/apps/game-roulette/tournaments?id=${id}`, { method: 'DELETE' })
    setTournaments(prev => prev.filter(t => t.id !== id))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      {tournaments.length === 0 && !showForm ? (
        <EmptyState
          icon={<Trophy size={28} />}
          title="No tournaments yet"
          description="Create your first tournament to start competing."
          action={<Button onClick={() => setShowForm(true)} icon={<Plus size={16} />}>Create Tournament</Button>}
        />
      ) : (
        <>
          <div className="flex justify-end mb-4">
            <Button onClick={() => setShowForm(true)} icon={<Plus size={15} />} size="sm">Create Tournament</Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
            {tournaments.map(t => (
              <TournamentCard key={t.id} tournament={t} players={players} onDelete={handleDelete} />
            ))}
          </div>
        </>
      )}

      <TournamentForm
        open={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleCreate}
        players={players}
        games={games}
      />
    </div>
  )
}
