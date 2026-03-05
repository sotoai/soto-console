import type Database from 'better-sqlite3'
import type { Score, LeaderboardEntry } from '@/types/scores'

let db: Database.Database

export function initScoreSchema(database: Database.Database) {
  db = database
  db.exec(`
    CREATE TABLE IF NOT EXISTS scores (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      game_id TEXT NOT NULL,
      score INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
    CREATE INDEX IF NOT EXISTS idx_scores_game_score ON scores(game_id, score DESC);
    CREATE INDEX IF NOT EXISTS idx_scores_user_game ON scores(user_id, game_id);
  `)

  // Migration: add spicy_count column if not present
  try {
    db.exec(`ALTER TABLE scores ADD COLUMN spicy_count INTEGER NOT NULL DEFAULT 0`)
  } catch {
    // Column already exists — ignore
  }
}

export function submitScore(userId: string, gameId: string, score: number, spicyCount = 0): Score {
  const id = crypto.randomUUID()
  const stmt = db.prepare(`
    INSERT INTO scores (id, user_id, game_id, score, spicy_count)
    VALUES (?, ?, ?, ?, ?)
  `)
  stmt.run(id, userId, gameId, score, spicyCount)
  return db.prepare('SELECT * FROM scores WHERE id = ?').get(id) as Score
}

export function getTopScores(gameId: string, limit = 10): LeaderboardEntry[] {
  return db.prepare(`
    SELECT
      s.*,
      u.display_name,
      u.avatar_url,
      s.game_id AS game_name
    FROM scores s
    JOIN users u ON s.user_id = u.id
    WHERE s.game_id = ?
    ORDER BY s.score DESC
    LIMIT ?
  `).all(gameId, limit) as LeaderboardEntry[]
}

export function getGlobalTopScores(limit = 10): LeaderboardEntry[] {
  return db.prepare(`
    SELECT
      s.*,
      u.display_name,
      u.avatar_url,
      s.game_id AS game_name
    FROM scores s
    JOIN users u ON s.user_id = u.id
    ORDER BY s.score DESC
    LIMIT ?
  `).all(limit) as LeaderboardEntry[]
}

export function getUserBest(userId: string, gameId: string): Score | null {
  return (db.prepare(`
    SELECT * FROM scores
    WHERE user_id = ? AND game_id = ?
    ORDER BY score DESC
    LIMIT 1
  `).get(userId, gameId) as Score) || null
}
