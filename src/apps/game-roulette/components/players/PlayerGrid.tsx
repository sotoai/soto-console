'use client'

import { useState } from 'react'
import { Player } from '@/apps/game-roulette/types'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { PlayerForm } from './PlayerForm'
import { Users, Plus, Pencil, Trash2, Trophy, Swords } from 'lucide-react'

interface PlayerGridProps {
  initialPlayers: Player[]
}

export function PlayerGrid({ initialPlayers }: PlayerGridProps) {
  const [players, setPlayers] = useState<Player[]>(initialPlayers)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Player | undefined>()

  const handleCreate = async (data: { name: string }) => {
    const res = await fetch('/api/apps/game-roulette/players', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const player = await res.json()
    setPlayers(prev => [player, ...prev])
  }

  const handleEdit = async (data: { name: string }) => {
    if (!editing) return
    const res = await fetch('/api/apps/game-roulette/players', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: editing.id, ...data }),
    })
    const updated = await res.json()
    setPlayers(prev => prev.map(p => (p.id === updated.id ? updated : p)))
    setEditing(undefined)
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/apps/game-roulette/players?id=${id}`, { method: 'DELETE' })
    setPlayers(prev => prev.filter(p => p.id !== id))
  }

  if (players.length === 0 && !showForm) {
    return (
      <>
        <EmptyState
          icon={<Users size={24} />}
          title="No players yet"
          description="Add players to start creating challenges."
          action={<Button onClick={() => setShowForm(true)} icon={<Plus size={15} />} size="sm">Add Player</Button>}
        />
        <PlayerForm open={showForm} onClose={() => setShowForm(false)} onSubmit={handleCreate} />
      </>
    )
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setShowForm(true)} icon={<Plus size={15} />} size="sm">Add Player</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 stagger">
        {players.map(player => (
          <div key={player.id} className="rounded-[var(--radius-lg)] bg-[var(--bg-secondary)] group relative text-center px-5 py-6">
            <div className="absolute top-2.5 right-2.5 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => setEditing(player)} className="p-1 rounded-[6px] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors cursor-pointer">
                <Pencil size={12} />
              </button>
              <button onClick={() => handleDelete(player.id)} className="p-1 rounded-[6px] text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-red-500/10 transition-colors cursor-pointer">
                <Trash2 size={12} />
              </button>
            </div>
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-[14px] font-bold text-white mx-auto mb-2.5" style={{ background: player.color }}>
              {player.initials}
            </div>
            <h3 className="font-semibold text-[15px] text-[var(--text-primary)] mb-2 leading-tight">{player.name}</h3>
            <div className="flex items-center justify-center gap-3 text-[12px] text-[var(--text-muted)]">
              <span className="flex items-center gap-0.5"><Trophy size={10} className="text-[var(--warning)]" />{player.wins}W</span>
              <span className="flex items-center gap-0.5"><Swords size={10} />{player.challengesPlayed}</span>
            </div>
            <div className="mt-4 pt-3">
              <p className="text-[17px] font-bold tabular-nums text-[var(--text-primary)] leading-none">{player.totalScore.toFixed(0)}</p>
              <p className="text-[12px] text-[var(--text-muted)] mt-0.5">pts</p>
            </div>
          </div>
        ))}
      </div>

      <PlayerForm open={showForm} onClose={() => setShowForm(false)} onSubmit={handleCreate} />
      {editing && (
        <PlayerForm open={!!editing} onClose={() => setEditing(undefined)} onSubmit={handleEdit} initialName={editing.name} />
      )}
    </>
  )
}
