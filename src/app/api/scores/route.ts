import { NextResponse, type NextRequest } from 'next/server'
import { getAuthUser } from '@/lib/auth/get-auth-user'
import {
  submitScore,
  getTopScores,
  getGlobalTopScores,
  getUserBest,
} from '@/lib/services/score-service'
import { getDb } from '@/lib/db'

// Ensure DB + schemas are initialized
getDb()

export async function GET(request: NextRequest) {
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
  try {
    const user = await getAuthUser()
    const { gameId, score } = await request.json()

    if (!gameId || typeof score !== 'number' || score <= 0) {
      return NextResponse.json({ error: 'Invalid gameId or score' }, { status: 400 })
    }

    if (score > 100000) {
      return NextResponse.json({ error: 'Score exceeds maximum' }, { status: 400 })
    }

    const entry = submitScore(user.id, gameId, score)
    return NextResponse.json(entry, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }
}
