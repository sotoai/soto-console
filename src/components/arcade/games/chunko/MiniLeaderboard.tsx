'use client'

import { useState, useEffect } from 'react'
import { Trophy } from 'lucide-react'
import { useUser } from '@clerk/nextjs'

interface ScoreEntry {
  id: number
  score: number
  display_name: string
  clerk_id: string
}

interface MiniLeaderboardProps {
  refreshTrigger?: number
  className?: string
}

const RANK_COLORS: Record<number, string> = {
  1: '#FFD700', // gold
  2: '#C0C0C0', // silver
  3: '#CD7F32', // bronze
}

export function MiniLeaderboard({ refreshTrigger = 0, className = '' }: MiniLeaderboardProps) {
  const { user } = useUser()
  const [entries, setEntries] = useState<ScoreEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function fetchScores() {
      try {
        const res = await fetch('/api/scores?gameId=chunko&limit=5')
        if (!res.ok) return
        const data = await res.json()
        if (!cancelled) setEntries(data)
      } catch {
        // silently fail
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchScores()
    return () => { cancelled = true }
  }, [refreshTrigger])

  return (
    <div className={`flex flex-col py-2 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-1.5 mb-3">
        <Trophy size={12} className="text-white/30" strokeWidth={2} />
        <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30">
          Scores
        </p>
      </div>

      {/* Entries */}
      <div className="flex flex-col gap-1">
        {loading && entries.length === 0 && (
          <p className="text-[10px] text-white/20 text-center py-4">Loading…</p>
        )}

        {!loading && entries.length === 0 && (
          <p className="text-[10px] text-white/20 text-center py-4">No scores yet</p>
        )}

        {entries.map((entry, i) => {
          const rank = i + 1
          const isCurrentUser = user?.id === entry.clerk_id
          const rankColor = RANK_COLORS[rank] ?? 'rgba(255,255,255,0.3)'

          return (
            <div
              key={entry.id}
              className="rounded-md px-2 py-1.5"
              style={{
                background: isCurrentUser ? 'rgba(99,102,241,0.12)' : 'transparent',
                borderLeft: isCurrentUser ? '2px solid rgba(99,102,241,0.5)' : '2px solid transparent',
              }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="text-[11px] font-bold tabular-nums"
                  style={{ color: rankColor, minWidth: 14 }}
                >
                  {rank}
                </span>
                <span className="text-[11px] text-white/60 truncate flex-1">
                  {entry.display_name || 'Player'}
                </span>
              </div>
              <p
                className="text-[12px] font-mono tabular-nums font-semibold text-white/80 ml-5"
              >
                {entry.score.toLocaleString()}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
