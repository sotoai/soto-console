'use client'

import { useState } from 'react'
import { Challenge, Game, Player } from '@/apps/game-roulette/types'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { cn, formatDate } from '@/lib/utils'
import { Play, Check, Trash2 } from 'lucide-react'

interface ChallengeCardProps {
  challenge: Challenge
  game?: Game
  players: Player[]
  onUpdate: (id: string, data: Partial<Challenge>) => void
  onDelete: (id: string) => void
}

const statusBadge: Record<string, 'warning' | 'info' | 'success'> = {
  pending: 'warning',
  'in-progress': 'info',
  completed: 'success',
}

export function ChallengeCard({ challenge, game, players, onUpdate, onDelete }: ChallengeCardProps) {
  const [scores, setScores] = useState<Record<string, string>>({})
  const [showScoring, setShowScoring] = useState(false)
  const playerMap = Object.fromEntries(players.map(p => [p.id, p]))

  const handleStart = () => {
    onUpdate(challenge.id, { status: 'in-progress', playerIds: challenge.playerIds })
  }

  const handleComplete = () => {
    const numericScores: Record<string, number> = {}
    let highestId = ''
    let highest = -Infinity
    for (const pid of challenge.playerIds) {
      const s = parseFloat(scores[pid] || '0')
      numericScores[pid] = s
      if (s > highest) { highest = s; highestId = pid }
    }
    if (highestId) {
      onUpdate(challenge.id, { status: 'completed', scores: numericScores, winnerId: highestId, playerIds: challenge.playerIds })
      setShowScoring(false)
    }
  }

  return (
    <div className="rounded-[var(--radius-lg)] bg-[var(--bg-secondary)] group relative px-5 py-5">
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onDelete(challenge.id)} className="p-1 rounded-[6px] text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-red-500/10 transition-colors cursor-pointer">
          <Trash2 size={13} />
        </button>
      </div>
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-[15px] text-[var(--text-primary)] truncate">{game?.name || 'Unknown Game'}</h3>
          <Badge variant={statusBadge[challenge.status]}>{challenge.status}</Badge>
        </div>
        {challenge.rules && <p className="text-[13px] text-[var(--text-muted)] line-clamp-1">{challenge.rules}</p>}
      </div>
      <div className="space-y-1 mb-3">
        {challenge.playerIds.map(pid => {
          const player = playerMap[pid]
          const isWinner = challenge.winnerId === pid
          return (
            <div key={pid} className={cn('flex items-center gap-2 px-2 py-1.5 rounded-[8px]', isWinner && 'bg-emerald-500/8')}>
              <div className="rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0" style={{ background: player?.color || '#666', width: 22, height: 22 }}>{player?.initials || '?'}</div>
              <span className={cn('text-[13px] flex-1 truncate', isWinner ? 'font-semibold text-[var(--success)]' : 'text-[var(--text-primary)]')}>{player?.name || 'Unknown'}</span>
              {challenge.status === 'completed' && challenge.scores[pid] !== undefined && <span className="text-[11px] font-mono tabular-nums text-[var(--text-muted)]">{challenge.scores[pid]}</span>}
              {isWinner && <Check size={11} className="text-[var(--success)] shrink-0" />}
            </div>
          )
        })}
      </div>
      {challenge.status === 'pending' && <Button size="sm" variant="secondary" onClick={handleStart} icon={<Play size={13} />} className="w-full">Start</Button>}
      {challenge.status === 'in-progress' && !showScoring && <Button size="sm" onClick={() => setShowScoring(true)} className="w-full">Enter Scores</Button>}
      {showScoring && (
        <div className="space-y-2 pt-3 mt-3">
          {challenge.playerIds.map(pid => (
            <div key={pid} className="flex items-center gap-2">
              <span className="text-[11px] text-[var(--text-muted)] w-16 truncate">{playerMap[pid]?.name}</span>
              <input type="number" className="flex-1 px-2 py-1.5 text-[13px] bg-[var(--bg-tertiary)] border border-transparent rounded-[8px] text-[var(--text-primary)] focus:outline-none focus:bg-[var(--accent-soft)]" value={scores[pid] || ''} onChange={e => setScores(prev => ({ ...prev, [pid]: e.target.value }))} placeholder="0" />
            </div>
          ))}
          <div className="flex gap-2 pt-1">
            <Button size="sm" variant="secondary" onClick={() => setShowScoring(false)} className="flex-1">Cancel</Button>
            <Button size="sm" onClick={handleComplete} className="flex-1">Submit</Button>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between mt-4 pt-3 text-[12px] text-[var(--text-muted)]">
        <span>x{challenge.weight}</span>
        <span>{formatDate(challenge.createdAt)}</span>
      </div>
    </div>
  )
}
