'use client'

import { useState } from 'react'
import { Game } from '@/apps/game-roulette/types'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { GameForm } from './GameForm'
import { Gamepad2, Plus, Pencil, Trash2, Users } from 'lucide-react'

interface GameGridProps {
  initialGames: Game[]
}

const typeColors: Record<string, 'accent' | 'success' | 'warning' | 'info'> = {
  versus: 'accent',
  'free-for-all': 'warning',
  'co-op': 'success',
  'solo-time': 'info',
}

export function GameGrid({ initialGames }: GameGridProps) {
  const [games, setGames] = useState<Game[]>(initialGames)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Game | undefined>()

  const handleCreate = async (data: Omit<Game, 'id' | 'createdAt'>) => {
    const res = await fetch('/api/apps/game-roulette/games', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const game = await res.json()
    setGames(prev => [game, ...prev])
  }

  const handleEdit = async (data: Omit<Game, 'id' | 'createdAt'>) => {
    if (!editing) return
    const res = await fetch('/api/apps/game-roulette/games', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: editing.id, ...data }),
    })
    const updated = await res.json()
    setGames(prev => prev.map(g => (g.id === updated.id ? updated : g)))
    setEditing(undefined)
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/apps/game-roulette/games?id=${id}`, { method: 'DELETE' })
    setGames(prev => prev.filter(g => g.id !== id))
  }

  if (games.length === 0 && !showForm) {
    return (
      <>
        <EmptyState
          icon={<Gamepad2 size={24} />}
          title="No games yet"
          description="Add your first game to get started."
          action={<Button onClick={() => setShowForm(true)} icon={<Plus size={15} />} size="sm">Add Game</Button>}
        />
        <GameForm open={showForm} onClose={() => setShowForm(false)} onSubmit={handleCreate} />
      </>
    )
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setShowForm(true)} icon={<Plus size={15} />} size="sm">Add Game</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
        {games.map(game => (
          <div key={game.id} className="rounded-[var(--radius-lg)] bg-[var(--bg-secondary)] group relative px-5 py-5">
            <div className="flex items-start justify-between mb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-[12px] bg-[var(--accent-soft)] flex items-center justify-center shrink-0">
                  <Gamepad2 size={15} className="text-[var(--accent)]" strokeWidth={1.8} />
                </div>
                <div>
                  <h3 className="font-semibold text-[15px] text-[var(--text-primary)] leading-tight">{game.name}</h3>
                  <Badge variant={typeColors[game.gameType] || 'accent'}>{game.gameType}</Badge>
                </div>
              </div>
              <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setEditing(game)}
                  className="p-1.5 rounded-[var(--radius-sm)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors cursor-pointer"
                >
                  <Pencil size={13} />
                </button>
                <button
                  onClick={() => handleDelete(game.id)}
                  className="p-1.5 rounded-[var(--radius-sm)] text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-red-500/10 transition-colors cursor-pointer"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
            {game.description && (
              <p className="text-[13px] text-[var(--text-muted)] mb-2.5 line-clamp-2 leading-relaxed">{game.description}</p>
            )}
            <div className="flex items-center gap-3 text-[12px] text-[var(--text-muted)] mt-3 pt-2.5">
              <span className="flex items-center gap-1">
                <Users size={11} />
                {game.minPlayers === game.maxPlayers ? game.minPlayers : `${game.minPlayers}-${game.maxPlayers}`}p
              </span>
              <span>{game.scoringType}</span>
              <span className="ml-auto font-medium">x{game.defaultWeight}</span>
            </div>
          </div>
        ))}
      </div>

      <GameForm open={showForm} onClose={() => setShowForm(false)} onSubmit={handleCreate} />
      {editing && (
        <GameForm
          open={!!editing}
          onClose={() => setEditing(undefined)}
          onSubmit={handleEdit}
          initial={editing}
        />
      )}
    </>
  )
}
