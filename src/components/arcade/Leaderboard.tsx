'use client'

import { useEffect, useState, useCallback, type CSSProperties } from 'react'
import { useUser } from '@clerk/nextjs'
import { Trophy, RefreshCw } from 'lucide-react'
import { GAMES } from './games/registry'
import { OnlineUsers } from './OnlineUsers'
import { getInitials } from '@/lib/utils'
import type { LeaderboardEntry } from '@/types/scores'
import type { OnlineUser } from '@/hooks/useRealtimeEvents'

interface LeaderboardProps {
  refreshTrigger?: number
  onlineUsers?: OnlineUser[]
  isConnected?: boolean
  className?: string
  style?: CSSProperties
}

const RANK_COLORS: Record<number, string> = {
  1: '#FFD700', // gold
  2: '#C0C0C0', // silver
  3: '#CD7F32', // bronze
}

const playableGames = GAMES.filter(g => !g.comingSoon)

export function Leaderboard({ refreshTrigger, onlineUsers, isConnected, className, style }: LeaderboardProps) {
  const { user } = useUser()
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [gameFilter, setGameFilter] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [personalBest, setPersonalBest] = useState<{ score: number; spicy_count: number } | null>(null)

  const fetchScores = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (gameFilter) params.set('gameId', gameFilter)
      params.set('limit', '10')
      const res = await fetch(`/api/scores?${params}`)
      if (res.ok) {
        const data = await res.json()
        setEntries(data)
      }
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err)
    } finally {
      setLoading(false)
    }
  }, [gameFilter])

  // Fetch personal best when filter or user changes
  useEffect(() => {
    if (!user?.id || !gameFilter) {
      setPersonalBest(null)
      return
    }
    fetch(`/api/scores?me=true&gameId=${gameFilter}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => setPersonalBest(data ? { score: data.score, spicy_count: data.spicy_count ?? 0 } : null))
      .catch(() => setPersonalBest(null))
  }, [user?.id, gameFilter, refreshTrigger])

  // Fetch leaderboard
  useEffect(() => {
    fetchScores()
  }, [fetchScores, refreshTrigger])

  // Resolve game_id to display name
  const getGameName = (gameId: string) => {
    const game = GAMES.find(g => g.id === gameId)
    return game?.name ?? gameId
  }

  return (
    <div
      className={className}
      style={style}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <div className="flex items-center gap-2">
          <Trophy
            size={14}
            className="text-[var(--wp-text-tertiary)]"
            strokeWidth={1.5}
          />
          <h3
            className="text-[13px] font-semibold text-[var(--wp-text-tertiary)] uppercase tracking-wider"
            style={{ textShadow: 'var(--wp-shadow)' }}
          >
            Leaderboard
          </h3>
          {/* Live connection indicator */}
          <div
            className="rounded-full shrink-0 transition-colors duration-500"
            title={isConnected ? 'Live' : 'Reconnecting…'}
            style={{
              width: 6,
              height: 6,
              background: isConnected ? '#22c55e' : '#f59e0b',
            }}
          />
        </div>
        <button
          onClick={fetchScores}
          className="min-w-[32px] min-h-[32px] flex items-center justify-center text-[var(--wp-text-tertiary)] hover:text-[var(--wp-text-secondary)] active:text-[var(--wp-text)] transition-colors cursor-pointer"
        >
          <RefreshCw size={13} strokeWidth={1.5} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Game filter */}
      {playableGames.length > 0 && (
        <div className="mb-3">
          <select
            value={gameFilter}
            onChange={e => setGameFilter(e.target.value)}
            className="w-full text-[12px] font-medium rounded-[var(--radius-sm)] px-2 py-1.5 cursor-pointer outline-none"
            style={{
              background: 'rgba(255,255,255,0.08)',
              color: 'var(--wp-text-secondary)',
              border: '0.5px solid rgba(255,255,255,0.1)',
            }}
          >
            <option value="">All Games</option>
            {playableGames.map(g => (
              <option key={g.id} value={g.id}>{g.emoji} {g.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Online users */}
      {onlineUsers && onlineUsers.length > 0 && (
        <OnlineUsers users={onlineUsers} />
      )}

      {/* Scores list */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-1">
        {entries.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-[24px] mb-2">🏆</p>
            <p
              className="text-[13px] font-medium text-[var(--wp-text-tertiary)]"
              style={{ textShadow: 'var(--wp-shadow)' }}
            >
              No scores yet
            </p>
            <p
              className="text-[11px] text-[var(--wp-text-tertiary)] mt-1"
              style={{ textShadow: 'var(--wp-shadow)', opacity: 0.6 }}
            >
              Be the first!
            </p>
          </div>
        )}

        {entries.map((entry, i) => {
          const rank = i + 1
          const isCurrentUser = user?.id && entry.display_name === user.firstName + ' ' + user.lastName
          const rankColor = RANK_COLORS[rank] ?? 'var(--wp-text-tertiary)'

          return (
            <div
              key={entry.id}
              className="flex items-center gap-2 px-2 py-1.5 rounded-[var(--radius-sm)] transition-colors"
              style={{
                background: isCurrentUser ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                borderLeft: isCurrentUser ? '2px solid var(--accent-primary, #6366f1)' : '2px solid transparent',
              }}
            >
              {/* Rank */}
              <span
                className="text-[12px] font-bold tabular-nums shrink-0"
                style={{
                  color: rankColor,
                  width: 20,
                  textAlign: 'center',
                  textShadow: rank <= 3 ? '0 1px 2px rgba(0,0,0,0.3)' : undefined,
                }}
              >
                {rank}
              </span>

              {/* Avatar */}
              <div className="shrink-0">
                {entry.avatar_url ? (
                  <img
                    src={entry.avatar_url}
                    alt={entry.display_name}
                    className="rounded-full"
                    style={{ width: 24, height: 24 }}
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div
                    className="rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                    style={{
                      width: 24,
                      height: 24,
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    }}
                  >
                    {getInitials(entry.display_name)}
                  </div>
                )}
              </div>

              {/* Name + game */}
              <div className="flex-1 min-w-0">
                <p
                  className="text-[12px] font-medium truncate"
                  style={{
                    color: 'var(--wp-text)',
                    textShadow: 'var(--wp-shadow)',
                  }}
                >
                  {entry.display_name}
                </p>
                {!gameFilter && (
                  <p
                    className="text-[10px] truncate"
                    style={{ color: 'var(--wp-text-tertiary)' }}
                  >
                    {getGameName(entry.game_name)}
                  </p>
                )}
              </div>

              {/* Score + spicy count */}
              <div className="flex items-center gap-1.5 shrink-0">
                <span
                  className="text-[13px] font-mono font-bold tabular-nums"
                  style={{
                    color: 'var(--wp-text)',
                    textShadow: 'var(--wp-shadow)',
                  }}
                >
                  {entry.score.toLocaleString()}
                </span>
                {entry.spicy_count > 0 && (
                  <span className="text-[10px] text-red-400 tabular-nums font-mono">
                    🌶️{entry.spicy_count}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Personal best footer */}
      {personalBest !== null && (
        <div
          className="mt-3 pt-3 flex items-center justify-between"
          style={{ borderTop: '0.5px solid rgba(255,255,255,0.1)' }}
        >
          <span
            className="text-[11px] font-medium"
            style={{ color: 'var(--wp-text-tertiary)', textShadow: 'var(--wp-shadow)' }}
          >
            Your Best
          </span>
          <div className="flex items-center gap-1.5">
            <span
              className="text-[14px] font-mono font-bold tabular-nums"
              style={{ color: 'var(--wp-text)', textShadow: 'var(--wp-shadow)' }}
            >
              {personalBest.score.toLocaleString()}
            </span>
            {personalBest.spicy_count > 0 && (
              <span className="text-[10px] text-red-400 tabular-nums font-mono">
                🌶️{personalBest.spicy_count}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
