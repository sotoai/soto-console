'use client'

import { useCallback, useState } from 'react'

export function useScoreSubmit() {
  const [lastSubmittedAt, setLastSubmittedAt] = useState(0)

  const submitScore = useCallback(async (gameId: string, score: number, spicyCount = 0) => {
    if (score <= 0) return
    try {
      await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId, score, spicyCount }),
      })
      setLastSubmittedAt(Date.now())
    } catch (err) {
      console.error('Failed to submit score:', err)
    }
  }, [])

  return { submitScore, lastSubmittedAt }
}
