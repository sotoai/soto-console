import { NextResponse, type NextRequest } from 'next/server'
import { getAuthUser } from '@/lib/auth/get-auth-user'
import {
  submitScore,
  getTopScores,
  getGlobalTopScores,
  getUserBest,
} from '@/lib/services/score-service'
import { getDb } from '@/lib/db'
import { broadcast } from '@/lib/sse/connections'

export async function GET(request: NextRequest) {
  getDb() // ensure schemas are initialized
  const { searchParams } = request.nextUrl
  const gameId = searchParams.get('gameId')
  const limit = Math.min(Number(searchParams.get('limit') || 10), 50)
  const me = searchParams.get('me')

  // Personal best lookup — resolve from authenticated session
  if (me && gameId) {
    try {
      const user = await getAuthUser()
      const best = getUserBest(user.id, gameId)
      return NextResponse.json(best)
    } catch {
      return NextResponse.json(null)
    }
  }

  // Game-specific or global leaderboard
  const entries = gameId
    ? getTopScores(gameId, limit)
    : getGlobalTopScores(limit)

  return NextResponse.json(entries)
}

export async function POST(request: NextRequest) {
  getDb() // ensure schemas are initialized
  try {
    const user = await getAuthUser()
    const { gameId, score, spicyCount = 0 } = await request.json()

    if (!gameId || typeof score !== 'number' || score <= 0) {
      return NextResponse.json({ error: 'Invalid gameId or score' }, { status: 400 })
    }

    if (score > 100000) {
      return NextResponse.json({ error: 'Score exceeds maximum' }, { status: 400 })
    }

    const entry = submitScore(user.id, gameId, score, spicyCount)

    // Notify all connected clients in real-time
    broadcast('leaderboard-update', { gameId })

    return NextResponse.json(entry, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }
}
