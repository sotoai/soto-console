'use client'

import { useState } from 'react'
import { BracketMatch, Player, Tournament } from '@/apps/game-roulette/types'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { Check, Play } from 'lucide-react'

interface BracketViewProps {
  tournament: Tournament
  players: Player[]
  onMatchUpdate: (matchId: string, winnerId: string, scores: Record<string, number>) => void
  onStartTournament: () => void
}

export function BracketView({ tournament, players, onMatchUpdate, onStartTournament }: BracketViewProps) {
  const playerMap = Object.fromEntries(players.map(p => [p.id, p]))
  const brackets = tournament.brackets
  const rounds = [...new Set(brackets.map(m => m.round))].sort((a, b) => a - b)
  const isRoundRobin = tournament.format === 'round-robin'

  if (isRoundRobin) {
    return (
      <RoundRobinView brackets={brackets} playerMap={playerMap} tournament={tournament} onMatchUpdate={onMatchUpdate} onStartTournament={onStartTournament} />
    )
  }

  return (
    <div className="space-y-4">
      {tournament.status === 'draft' && (
        <div className="flex justify-center">
          <Button onClick={onStartTournament} icon={<Play size={16} />}>Start Tournament</Button>
        </div>
      )}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-8 min-w-max px-4">
          {rounds.map(round => {
            const roundMatches = brackets.filter(m => m.round === round)
            const roundLabel = round === rounds.length ? 'Final' : round === rounds.length - 1 ? 'Semifinal' : `Round ${round}`
            return (
              <div key={round} className="flex flex-col items-center">
                <h4 className="text-[13px] font-semibold text-[var(--text-secondary)] mb-4">{roundLabel}</h4>
                <div className="flex flex-col justify-around flex-1 gap-4">
                  {roundMatches.map(match => (
                    <MatchCard key={match.id} match={match} playerMap={playerMap} onUpdate={onMatchUpdate} canPlay={tournament.status === 'active'} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function MatchCard({ match, playerMap, onUpdate, canPlay }: { match: BracketMatch; playerMap: Record<string, Player>; onUpdate: (matchId: string, winnerId: string, scores: Record<string, number>) => void; canPlay: boolean }) {
  const [scores, setScores] = useState<Record<string, string>>({})
  const [showScoring, setShowScoring] = useState(false)

  const handleSubmitScore = () => {
    const numericScores: Record<string, number> = {}
    let highestId = ''
    let highest = -Infinity
    for (const pid of match.playerIds) {
      const s = parseFloat(scores[pid] || '0')
      numericScores[pid] = s
      if (s > highest) { highest = s; highestId = pid }
    }
    if (highestId) {
      onUpdate(match.id, highestId, numericScores)
      setShowScoring(false)
    }
  }

  const isEmpty = match.playerIds.length === 0

  return (
    <div className={cn('w-56 rounded-[var(--radius-md)] overflow-hidden', match.status === 'completed' ? 'bg-emerald-500/5' : 'bg-[var(--bg-secondary)]')}>
      {match.playerIds.map((pid, i) => {
        const player = playerMap[pid]
        const isWinner = match.winnerId === pid
        return (
          <div key={pid} className={cn('flex items-center gap-2 px-3 py-2.5', isWinner && 'bg-emerald-500/8')}>
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0" style={{ background: player?.color || '#666' }}>{player?.initials || '?'}</div>
            <span className={cn('text-[13px] flex-1 truncate', isWinner ? 'font-bold text-[var(--success)]' : 'text-[var(--text-primary)]')}>{player?.name || 'TBD'}</span>
            {match.status === 'completed' && match.scores[pid] !== undefined && (<span className="text-[12px] font-mono tabular-nums text-[var(--text-muted)]">{match.scores[pid]}</span>)}
            {isWinner && <Check size={12} className="text-[var(--success)] shrink-0" />}
          </div>
        )
      })}
      {isEmpty && <div className="px-3 py-4 text-center text-[13px] text-[var(--text-muted)]">TBD</div>}
      {canPlay && match.playerIds.length >= 2 && match.status !== 'completed' && (
        <>
          {showScoring ? (
            <div className="px-3 py-2.5 space-y-2">
              {match.playerIds.map(pid => (
                <div key={pid} className="flex items-center gap-2">
                  <span className="text-[11px] text-[var(--text-muted)] w-16 truncate">{playerMap[pid]?.name}</span>
                  <input type="number" className="flex-1 px-2 py-1.5 text-[13px] bg-[var(--bg-tertiary)] border border-transparent rounded-[8px] text-[var(--text-primary)] focus:outline-none focus:bg-[var(--accent-soft)]" value={scores[pid] || ''} onChange={e => setScores(prev => ({ ...prev, [pid]: e.target.value }))} placeholder="0" />
                </div>
              ))}
              <div className="flex gap-1.5">
                <button onClick={() => setShowScoring(false)} className="flex-1 text-[11px] py-1.5 rounded-[8px] text-[var(--text-muted)] hover:bg-[var(--bg-tertiary)] transition-colors cursor-pointer">Cancel</button>
                <button onClick={handleSubmitScore} className="flex-1 text-[11px] py-1.5 rounded-[8px] bg-[var(--accent)] text-white hover:opacity-85 transition-colors cursor-pointer">Submit</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowScoring(true)} className="w-full px-3 py-2 text-[11px] font-medium text-[var(--accent)] hover:bg-[var(--accent-soft)] transition-colors cursor-pointer">Enter Scores</button>
          )}
        </>
      )}
    </div>
  )
}

function RoundRobinView({ brackets, playerMap, tournament, onMatchUpdate, onStartTournament }: { brackets: BracketMatch[]; playerMap: Record<string, Player>; tournament: Tournament; onMatchUpdate: (matchId: string, winnerId: string, scores: Record<string, number>) => void; onStartTournament: () => void }) {
  return (
    <div className="space-y-4">
      {tournament.status === 'draft' && (
        <div className="flex justify-center">
          <Button onClick={onStartTournament} icon={<Play size={16} />}>Start Tournament</Button>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {brackets.map(match => (
          <MatchCard key={match.id} match={match} playerMap={playerMap} onUpdate={onMatchUpdate} canPlay={tournament.status === 'active'} />
        ))}
      </div>
    </div>
  )
}
