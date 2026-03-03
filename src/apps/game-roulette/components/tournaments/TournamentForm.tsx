'use client'

import { useState } from 'react'
import { Game, Player, TournamentFormat } from '@/apps/game-roulette/types'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface TournamentFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: { name: string; format: TournamentFormat; playerIds: string[]; gameIds: string[] }) => void
  players: Player[]
  games: Game[]
}

const formatOptions = [
  { value: 'single-elimination', label: 'Single Elimination' },
  { value: 'double-elimination', label: 'Double Elimination' },
  { value: 'round-robin', label: 'Round Robin' },
]

export function TournamentForm({ open, onClose, onSubmit, players, games }: TournamentFormProps) {
  const [name, setName] = useState('')
  const [format, setFormat] = useState<TournamentFormat>('single-elimination')
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([])
  const [selectedGames, setSelectedGames] = useState<string[]>([])

  const togglePlayer = (id: string) => {
    setSelectedPlayers(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id])
  }

  const toggleGame = (id: string) => {
    setSelectedGames(prev => prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id])
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || selectedPlayers.length < 2 || selectedGames.length < 1) return
    onSubmit({ name: name.trim(), format, playerIds: selectedPlayers, gameIds: selectedGames })
    setName('')
    setSelectedPlayers([])
    setSelectedGames([])
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Create Tournament" width="lg">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Tournament Name" id="tourney-name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Friday Night Showdown" required />
          <Select label="Format" id="tourney-format" value={format} onChange={e => setFormat(e.target.value as TournamentFormat)} options={formatOptions} />
        </div>

        <div>
          <label className="text-[14px] font-medium text-[var(--text-secondary)] mb-2.5 block">Players ({selectedPlayers.length} selected — min 2)</label>
          <div className="flex flex-wrap gap-2">
            {players.map(p => (
              <button key={p.id} type="button" onClick={() => togglePlayer(p.id)} className={cn(
                'flex items-center gap-2 px-3.5 py-2 rounded-full text-[13px] font-medium transition-all cursor-pointer',
                selectedPlayers.includes(p.id) ? 'bg-[var(--accent-soft)] text-[var(--accent)]' : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)] hover:bg-[var(--border-strong)]'
              )}>
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white font-bold" style={{ background: p.color }}>{p.initials}</span>
                {p.name}
              </button>
            ))}
            {players.length === 0 && <p className="text-[13px] text-[var(--text-muted)]">No players available. Add players first.</p>}
          </div>
        </div>

        <div>
          <label className="text-[14px] font-medium text-[var(--text-secondary)] mb-2.5 block">Games ({selectedGames.length} selected — min 1)</label>
          <div className="flex flex-wrap gap-2">
            {games.map(g => (
              <button key={g.id} type="button" onClick={() => toggleGame(g.id)} className={cn(
                'px-3.5 py-2 rounded-full text-[13px] font-medium transition-all cursor-pointer',
                selectedGames.includes(g.id) ? 'bg-[var(--accent-soft)] text-[var(--accent)]' : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)] hover:bg-[var(--border-strong)]'
              )}>{g.name}</button>
            ))}
            {games.length === 0 && <p className="text-[13px] text-[var(--text-muted)]">No games available. Add games first.</p>}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={selectedPlayers.length < 2 || selectedGames.length < 1}>Create Tournament</Button>
        </div>
      </form>
    </Modal>
  )
}
