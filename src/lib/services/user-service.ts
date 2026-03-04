import type Database from 'better-sqlite3'
import { v4 as uuid } from 'uuid'
import { getDb } from '@/lib/db'
import type { LocalUser, UpsertUserPayload, UserRole } from '@/types/auth'

/** Creates the users table — called during DB initialization */
export function initUserSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      clerk_id TEXT UNIQUE NOT NULL,
      email TEXT NOT NULL,
      display_name TEXT NOT NULL,
      avatar_url TEXT,
      role TEXT NOT NULL DEFAULT 'member',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id)
  `)
}

export function getUserByClerkId(clerkId: string): LocalUser | undefined {
  const db = getDb()
  return db.prepare('SELECT * FROM users WHERE clerk_id = ?').get(clerkId) as
    | LocalUser
    | undefined
}

export function upsertUser(payload: UpsertUserPayload): LocalUser {
  const db = getDb()
  const existing = getUserByClerkId(payload.clerk_id)

  if (existing) {
    db.prepare(
      `UPDATE users
       SET email = ?, display_name = ?, avatar_url = ?, role = ?, updated_at = datetime('now')
       WHERE clerk_id = ?`
    ).run(
      payload.email,
      payload.display_name,
      payload.avatar_url,
      payload.role ?? existing.role,
      payload.clerk_id
    )
    return getUserByClerkId(payload.clerk_id)!
  }

  const id = uuid()
  const role = payload.role ?? 'member'
  db.prepare(
    `INSERT INTO users (id, clerk_id, email, display_name, avatar_url, role)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(id, payload.clerk_id, payload.email, payload.display_name, payload.avatar_url, role)

  return getUserByClerkId(payload.clerk_id)!
}

export function deleteUserByClerkId(clerkId: string): void {
  const db = getDb()
  db.prepare('DELETE FROM users WHERE clerk_id = ?').run(clerkId)
}

export function updateUserRole(clerkId: string, role: UserRole): void {
  const db = getDb()
  db.prepare(
    `UPDATE users SET role = ?, updated_at = datetime('now') WHERE clerk_id = ?`
  ).run(role, clerkId)
}

export function updateDisplayName(clerkId: string, displayName: string): LocalUser | undefined {
  const db = getDb()
  db.prepare(
    `UPDATE users SET display_name = ?, updated_at = datetime('now') WHERE clerk_id = ?`
  ).run(displayName, clerkId)
  return getUserByClerkId(clerkId)
}
