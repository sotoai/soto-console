'use client'

import { useState, useEffect } from 'react'
import { Challenge, Game, Player } from '@/apps/game-roulette/types'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ChallengeForm } from '@/apps/game-roulette/components/challenges/ChallengeForm'
import { ChallengeCard } from '@/apps/game-roulette/components/challenges/ChallengeCard'
import { Swords, Plus } from 'lucide-react'

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [games, setGames] = useState<Game[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/apps/game-roulette/challenges').then(r => r.json()),
      fetch('/api/apps/game-roulette/games').then(r => r.json()),
      fetch('/api/apps/game-roulette/players').then(r => r.json()),
    ]).then(([c, g, p]) => {
      setChallenges(c)
      setGames(g)
      setPlayers(p)
      setLoading(false)
    })
  }, [])

  const gameMap = Object.fromEntries(games.map(g => [g.id, g]))

  const handleCreate = async (data: { gameId: string; playerIds: string[]; rules?: string; weight?: number }) => {
    const res = await fetch('/api/apps/game-roulette/challenges', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const challenge = await res.json()
    setChallenges(prev => [challenge, ...prev])
  }

  const handleUpdate = async (id: string, data: Partial<Challenge>) => {
    const res = await fetch('/api/apps/game-roulette/challenges', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...data }),
    })
    const updated = await res.json()
    setChallenges(prev => prev.map(c => (c.id === updated.id ? updated : c)))

    if (data.status === 'completed') {
      const freshPlayers = await fetch('/api/apps/game-roulette/players').then(r => r.json())
      setPlayers(freshPlayers)
    }
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/apps/game-roulette/challenges?id=${id}`, { method: 'DELETE' })
    setChallenges(prev => prev.filter(c => c.id !== id))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const active = challenges.filter(c => c.status === 'in-progress')
  const pending = challenges.filter(c => c.status === 'pending')
  const completed = challenges.filter(c => c.status === 'completed')

  return (
    <div className="animate-fade-in">
      {challenges.length === 0 && !showForm ? (
        <EmptyState
          icon={<Swords size={28} />}
          title="No challenges yet"
          description="Create a challenge to pit players against each other."
          action={<Button onClick={() => setShowForm(true)} icon={<Plus size={16} />}>New Challenge</Button>}
        />
      ) : (
        <>
          <div className="flex justify-end mb-4">
            <Button onClick={() => setShowForm(true)} icon={<Plus size={15} />} size="sm">New Challenge</Button>
          </div>

          {active.length > 0 && (
            <section className="mb-6">
              <h3 className="text-[13px] font-semibold text-[var(--text-secondary)] mb-3">In Progress ({active.length})</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
                {active.map(c => (<ChallengeCard key={c.id} challenge={c} game={gameMap[c.gameId]} players={players} onUpdate={handleUpdate} onDelete={handleDelete} />))}
              </div>
            </section>
          )}

          {pending.length > 0 && (
            <section className="mb-6">
              <h3 className="text-[13px] font-semibold text-[var(--text-secondary)] mb-3">Pending ({pending.length})</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
                {pending.map(c => (<ChallengeCard key={c.id} challenge={c} game={gameMap[c.gameId]} players={players} onUpdate={handleUpdate} onDelete={handleDelete} />))}
              </div>
            </section>
          )}

          {completed.length > 0 && (
            <section>
              <h3 className="text-[13px] font-semibold text-[var(--text-secondary)] mb-3">Completed ({completed.length})</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
                {completed.map(c => (<ChallengeCard key={c.id} challenge={c} game={gameMap[c.gameId]} players={players} onUpdate={handleUpdate} onDelete={handleDelete} />))}
              </div>
            </section>
          )}
        </>
      )}

      <ChallengeForm open={showForm} onClose={() => setShowForm(false)} onSubmit={handleCreate} games={games} players={players} />
    </div>
  )
}
