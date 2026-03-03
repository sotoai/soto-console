import { getDb } from '@/lib/db'
import { Challenge } from '@/apps/game-roulette/types'
import { v4 as uuid } from 'uuid'

function parseChallenge(row: Record<string, unknown>): Challenge {
  return {
    ...row,
    playerIds: JSON.parse(row.playerIds as string),
    scores: JSON.parse(row.scores as string),
  } as Challenge
}

export function getAllChallenges(): Challenge[] {
  const db = getDb()
  const rows = db.prepare('SELECT * FROM challenges ORDER BY createdAt DESC').all() as Record<string, unknown>[]
  return rows.map(parseChallenge)
}

export function getChallengeById(id: string): Challenge | undefined {
  const db = getDb()
  const row = db.prepare('SELECT * FROM challenges WHERE id = ?').get(id) as Record<string, unknown> | undefined
  return row ? parseChallenge(row) : undefined
}

export function createChallenge(data: {
  tournamentId?: string
  gameId: string
  playerIds: string[]
  rules?: string
  weight?: number
  roundNumber?: number
  matchNumber?: number
}): Challenge {
  const db = getDb()
  const id = uuid()
  const now = new Date().toISOString()
  db.prepare(`
    INSERT INTO challenges (id, tournamentId, gameId, roundNumber, matchNumber, playerIds, scores, status, rules, weight, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, '{}', 'pending', ?, ?, ?)
  `).run(
    id, data.tournamentId || null, data.gameId,
    data.roundNumber || 1, data.matchNumber || 1,
    JSON.stringify(data.playerIds), data.rules || null,
    data.weight || 1.0, now
  )
  return getChallengeById(id)!
}

export function updateChallenge(id: string, data: Partial<Challenge>): Challenge | undefined {
  const db = getDb()
  const existing = getChallengeById(id)
  if (!existing) return undefined
  const updated = { ...existing, ...data }
  db.prepare(`
    UPDATE challenges SET tournamentId=?, gameId=?, roundNumber=?, matchNumber=?,
      playerIds=?, scores=?, status=?, winnerId=?, rules=?, weight=?
    WHERE id=?
  `).run(
    updated.tournamentId || null, updated.gameId, updated.roundNumber, updated.matchNumber,
    JSON.stringify(updated.playerIds), JSON.stringify(updated.scores),
    updated.status, updated.winnerId || null, updated.rules || null, updated.weight, id
  )
  return getChallengeById(id)
}

export function deleteChallenge(id: string): boolean {
  const db = getDb()
  const result = db.prepare('DELETE FROM challenges WHERE id = ?').run(id)
  return result.changes > 0
}
