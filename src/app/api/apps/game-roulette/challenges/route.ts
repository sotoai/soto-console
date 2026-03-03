import { NextRequest, NextResponse } from 'next/server'
import { getAllChallenges, createChallenge, updateChallenge, deleteChallenge } from '@/apps/game-roulette/lib/services/challengeService'
import { updatePlayerStats } from '@/apps/game-roulette/lib/services/playerService'

export async function GET() {
  const challenges = getAllChallenges()
  return NextResponse.json(challenges)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const challenge = createChallenge(body)
  return NextResponse.json(challenge, { status: 201 })
}

export async function PUT(req: NextRequest) {
  const body = await req.json()
  const { id, ...data } = body

  // If completing a challenge, update player stats
  if (data.status === 'completed' && data.winnerId && data.scores) {
    const scores: Record<string, number> = data.scores
    const playerIds: string[] = data.playerIds || []
    for (const pid of playerIds) {
      updatePlayerStats(pid, pid === data.winnerId, scores[pid] || 0)
    }
  }

  const challenge = updateChallenge(id, data)
  if (!challenge) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(challenge)
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  const ok = deleteChallenge(id)
  if (!ok) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ success: true })
}
