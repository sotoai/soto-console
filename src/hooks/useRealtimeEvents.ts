'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'

export interface OnlineUser {
  clerkId: string
  displayName: string
  avatarUrl: string | null
}

interface UseRealtimeEventsReturn {
  onlineUsers: OnlineUser[]
  isConnected: boolean
  leaderboardVersion: number
}

export function useRealtimeEvents(): UseRealtimeEventsReturn {
  const { isSignedIn } = useUser()
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [leaderboardVersion, setLeaderboardVersion] = useState(0)
  const esRef = useRef<EventSource | null>(null)

  const connect = useCallback(() => {
    if (esRef.current) return

    const es = new EventSource('/api/events')
    esRef.current = es

    es.onopen = () => setIsConnected(true)

    es.onerror = () => {
      setIsConnected(false)
      // EventSource auto-reconnects — no manual retry needed
    }

    es.addEventListener('presence', (e) => {
      try {
        const users: OnlineUser[] = JSON.parse(e.data)
        setOnlineUsers(users)
      } catch { /* ignore parse errors */ }
    })

    es.addEventListener('leaderboard-update', () => {
      setLeaderboardVersion(v => v + 1)
    })
  }, [])

  useEffect(() => {
    if (!isSignedIn) return

    connect()

    return () => {
      if (esRef.current) {
        esRef.current.close()
        esRef.current = null
        setIsConnected(false)
      }
    }
  }, [isSignedIn, connect])

  return { onlineUsers, isConnected, leaderboardVersion }
}
