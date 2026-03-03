'use client'

import { useState } from 'react'
import { Game, GameType, ScoringType } from '@/apps/game-roulette/types'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'

interface GameFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: Omit<Game, 'id' | 'createdAt'>) => void
  initial?: Game
}

const gameTypeOptions = [
  { value: 'versus', label: '1v1 Versus' },
  { value: 'free-for-all', label: 'Free-for-All' },
  { value: 'co-op', label: 'Co-op' },
  { value: 'solo-time', label: 'Solo Time Trial' },
]

const scoringTypeOptions = [
  { value: 'points', label: 'Points' },
  { value: 'time', label: 'Time' },
  { value: 'win-loss', label: 'Win / Loss' },
]

export function GameForm({ open, onClose, onSubmit, initial }: GameFormProps) {
  const [name, setName] = useState(initial?.name || '')
  const [description, setDescription] = useState(initial?.description || '')
  const [minPlayers, setMinPlayers] = useState(String(initial?.minPlayers || 2))
  const [maxPlayers, setMaxPlayers] = useState(String(initial?.maxPlayers || 2))
  const [gameType, setGameType] = useState<GameType>(initial?.gameType || 'versus')
  const [scoringType, setScoringType] = useState<ScoringType>(initial?.scoringType || 'points')
  const [defaultWeight, setDefaultWeight] = useState(String(initial?.defaultWeight || 1))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      name,
      description,
      minPlayers: parseInt(minPlayers) || 2,
      maxPlayers: parseInt(maxPlayers) || 2,
      gameType,
      scoringType,
      defaultWeight: parseFloat(defaultWeight) || 1,
    })
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Edit Game' : 'Add Game'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Game Name" id="game-name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Mario Kart" required />
        <Input label="Description" id="game-desc" value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief description..." />
        <div className="grid grid-cols-2 gap-4">
          <Select label="Game Type" id="game-type" value={gameType} onChange={e => setGameType(e.target.value as GameType)} options={gameTypeOptions} />
          <Select label="Scoring" id="scoring-type" value={scoringType} onChange={e => setScoringType(e.target.value as ScoringType)} options={scoringTypeOptions} />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Input label="Min Players" id="min-players" type="number" min="1" max="16" value={minPlayers} onChange={e => setMinPlayers(e.target.value)} />
          <Input label="Max Players" id="max-players" type="number" min="1" max="16" value={maxPlayers} onChange={e => setMaxPlayers(e.target.value)} />
          <Input label="Weight" id="weight" type="number" min="0.1" max="10" step="0.1" value={defaultWeight} onChange={e => setDefaultWeight(e.target.value)} />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit">{initial ? 'Save Changes' : 'Add Game'}</Button>
        </div>
      </form>
    </Modal>
  )
}
