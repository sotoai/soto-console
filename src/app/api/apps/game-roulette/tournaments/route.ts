import { NextRequest, NextResponse } from 'next/server'
import { getAllTournaments, getTournamentById, createTournament, updateTournament, deleteTournament } from '@/apps/game-roulette/lib/services/tournamentService'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (id) {
    const tournament = getTournamentById(id)
    if (!tournament) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(tournament)
  }
  const tournaments = getAllTournaments()
  return NextResponse.json(tournaments)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const tournament = createTournament(body)
  return NextResponse.json(tournament, { status: 201 })
}

export async function PUT(req: NextRequest) {
  const body = await req.json()
  const { id, ...data } = body
  const tournament = updateTournament(id, data)
  if (!tournament) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(tournament)
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  const ok = deleteTournament(id)
  if (!ok) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ success: true })
}
