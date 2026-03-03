'use client'

import { useState } from 'react'
import { Game, Player } from '@/apps/game-roulette/types'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Shuffle } from 'lucide-react'
import { cn, shuffleArray } from '@/lib/utils'

interface ChallengeFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: { gameId: string; playerIds: string[]; rules?: string; weight?: number }) => void
  games: Game[]
  players: Player[]
}

export function ChallengeForm({ open, onClose, onSubmit, games, players }: ChallengeFormProps) {
  const [gameId, setGameId] = useState(games[0]?.id || '')
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([])
  const [rules, setRules] = useState('')
  const [weight, setWeight] = useState('1')

  const selectedGame = games.find(g => g.id === gameId)

  const handleRandomize = () => {
    if (!selectedGame) return
    const count = Math.min(selectedGame.maxPlayers, players.length)
    const shuffled = shuffleArray(players.map(p => p.id))
    setSelectedPlayers(shuffled.slice(0, count))
  }

  const togglePlayer = (id: string) => {
    setSelectedPlayers(prev => {
      if (prev.includes(id)) return prev.filter(p => p !== id)
      if (selectedGame && prev.length >= selectedGame.maxPlayers) return prev
      return [...prev, id]
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!gameId || selectedPlayers.length < (selectedGame?.minPlayers || 2)) return
    onSubmit({ gameId, playerIds: selectedPlayers, rules: rules || undefined, weight: parseFloat(weight) || 1 })
    setSelectedPlayers([])
    setRules('')
    setWeight('1')
    onClose()
  }

  const gameOptions = games.map(g => ({ value: g.id, label: `${g.name} (${g.minPlayers}-${g.maxPlayers}p)` }))

  return (
    <Modal open={open} onClose={onClose} title="Create Challenge" width="lg">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <Select label="Game" id="challenge-game" value={gameId} onChange={e => { setGameId(e.target.value); setSelectedPlayers([]) }} options={gameOptions.length > 0 ? gameOptions : [{ value: '', label: 'No games available' }]} />
          <Input label="Weight Multiplier" id="challenge-weight" type="number" min="0.1" max="10" step="0.1" value={weight} onChange={e => setWeight(e.target.value)} />
        </div>
        <Input label="Rules / Notes (optional)" id="challenge-rules" value={rules} onChange={e => setRules(e.target.value)} placeholder="e.g. Best of 3, no items..." />
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[14px] font-medium text-[var(--text-secondary)]">Players ({selectedPlayers.length}/{selectedGame?.maxPlayers || '?'})</label>
            <Button type="button" variant="ghost" size="sm" onClick={handleRandomize} icon={<Shuffle size={14} />} disabled={!selectedGame}>Randomize</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {players.map(p => {
              const isSelected = selectedPlayers.includes(p.id)
              const atMax = selectedGame && selectedPlayers.length >= selectedGame.maxPlayers && !isSelected
              return (
                <button key={p.id} type="button" disabled={!!atMax} onClick={() => togglePlayer(p.id)} className={cn(
                  'flex items-center gap-2 px-3.5 py-2 rounded-full text-[13px] font-medium transition-all cursor-pointer',
                  isSelected ? 'bg-[var(--accent-soft)] text-[var(--accent)]' : atMax ? 'bg-[var(--bg-tertiary)] text-[var(--text-muted)] opacity-40 cursor-not-allowed' : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)] hover:bg-[var(--border-strong)]'
                )}>
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white font-bold" style={{ background: p.color }}>{p.initials}</span>
                  {p.name}
                </button>
              )
            })}
          </div>
        </div>
        {selectedGame && (
          <div className="flex gap-2">
            <Badge variant="accent">{selectedGame.gameType}</Badge>
            <Badge variant="info">{selectedGame.scoringType}</Badge>
            <Badge>x{selectedGame.defaultWeight} weight</Badge>
          </div>
        )}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={!gameId || selectedPlayers.length < (selectedGame?.minPlayers || 2)}>Create Challenge</Button>
        </div>
      </form>
    </Modal>
  )
}
