import { NextRequest, NextResponse } from 'next/server'
import { getAllPlayers, createPlayer, updatePlayer, deletePlayer } from '@/apps/game-roulette/lib/services/playerService'

export async function GET() {
  const players = getAllPlayers()
  return NextResponse.json(players)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const player = createPlayer(body)
  return NextResponse.json(player, { status: 201 })
}

export async function PUT(req: NextRequest) {
  const body = await req.json()
  const { id, ...data } = body
  const player = updatePlayer(id, data)
  if (!player) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(player)
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  const ok = deletePlayer(id)
  if (!ok) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ success: true })
}
