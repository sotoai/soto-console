import { getDb } from '@/lib/db'
import { Game } from '@/apps/game-roulette/types'
import { v4 as uuid } from 'uuid'

export function getAllGames(): Game[] {
  const db = getDb()
  return db.prepare('SELECT * FROM games ORDER BY createdAt DESC').all() as Game[]
}

export function getGameById(id: string): Game | undefined {
  const db = getDb()
  return db.prepare('SELECT * FROM games WHERE id = ?').get(id) as Game | undefined
}

export function createGame(data: Omit<Game, 'id' | 'createdAt'>): Game {
  const db = getDb()
  const id = uuid()
  const now = new Date().toISOString()
  db.prepare(`
    INSERT INTO games (id, name, description, imageUrl, minPlayers, maxPlayers, gameType, scoringType, defaultWeight, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, data.name, data.description, data.imageUrl || null, data.minPlayers, data.maxPlayers, data.gameType, data.scoringType, data.defaultWeight, now)
  return getGameById(id)!
}

export function updateGame(id: string, data: Partial<Game>): Game | undefined {
  const db = getDb()
  const existing = getGameById(id)
  if (!existing) return undefined
  const updated = { ...existing, ...data }
  db.prepare(`
    UPDATE games SET name=?, description=?, imageUrl=?, minPlayers=?, maxPlayers=?, gameType=?, scoringType=?, defaultWeight=?
    WHERE id=?
  `).run(updated.name, updated.description, updated.imageUrl || null, updated.minPlayers, updated.maxPlayers, updated.gameType, updated.scoringType, updated.defaultWeight, id)
  return getGameById(id)
}

export function deleteGame(id: string): boolean {
  const db = getDb()
  const result = db.prepare('DELETE FROM games WHERE id = ?').run(id)
  return result.changes > 0
}
