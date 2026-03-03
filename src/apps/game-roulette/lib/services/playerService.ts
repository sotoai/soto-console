import { getDb } from '@/lib/db'
import { Player } from '@/apps/game-roulette/types'
import { v4 as uuid } from 'uuid'
import { getInitials, getRandomColor } from '@/lib/utils'

export function getAllPlayers(): Player[] {
  const db = getDb()
  return db.prepare('SELECT * FROM players ORDER BY createdAt DESC').all() as Player[]
}

export function getPlayerById(id: string): Player | undefined {
  const db = getDb()
  return db.prepare('SELECT * FROM players WHERE id = ?').get(id) as Player | undefined
}

export function createPlayer(data: { name: string; avatarUrl?: string }): Player {
  const db = getDb()
  const id = uuid()
  const now = new Date().toISOString()
  const count = (db.prepare('SELECT COUNT(*) as count FROM players').get() as { count: number }).count
  const initials = getInitials(data.name)
  const color = getRandomColor(count)
  db.prepare(`
    INSERT INTO players (id, name, avatarUrl, initials, color, wins, losses, totalScore, challengesPlayed, createdAt)
    VALUES (?, ?, ?, ?, ?, 0, 0, 0, 0, ?)
  `).run(id, data.name, data.avatarUrl || null, initials, color, now)
  return getPlayerById(id)!
}

export function updatePlayer(id: string, data: Partial<Player>): Player | undefined {
  const db = getDb()
  const existing = getPlayerById(id)
  if (!existing) return undefined
  const updated = { ...existing, ...data }
  if (data.name) updated.initials = getInitials(data.name)
  db.prepare(`
    UPDATE players SET name=?, avatarUrl=?, initials=?, color=?, wins=?, losses=?, totalScore=?, challengesPlayed=?
    WHERE id=?
  `).run(updated.name, updated.avatarUrl || null, updated.initials, updated.color, updated.wins, updated.losses, updated.totalScore, updated.challengesPlayed, id)
  return getPlayerById(id)
}

export function deletePlayer(id: string): boolean {
  const db = getDb()
  const result = db.prepare('DELETE FROM players WHERE id = ?').run(id)
  return result.changes > 0
}

export function updatePlayerStats(playerId: string, won: boolean, score: number) {
  const db = getDb()
  const player = getPlayerById(playerId)
  if (!player) return
  db.prepare(`
    UPDATE players SET wins = wins + ?, losses = losses + ?, totalScore = totalScore + ?, challengesPlayed = challengesPlayed + 1
    WHERE id = ?
  `).run(won ? 1 : 0, won ? 0 : 1, score, playerId)
}
