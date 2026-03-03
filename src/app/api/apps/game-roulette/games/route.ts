import { NextRequest, NextResponse } from 'next/server'
import { getAllGames, createGame, updateGame, deleteGame } from '@/apps/game-roulette/lib/services/gameService'

export async function GET() {
  const games = getAllGames()
  return NextResponse.json(games)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const game = createGame(body)
  return NextResponse.json(game, { status: 201 })
}

export async function PUT(req: NextRequest) {
  const body = await req.json()
  const { id, ...data } = body
  const game = updateGame(id, data)
  if (!game) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(game)
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  const ok = deleteGame(id)
  if (!ok) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ success: true })
}
