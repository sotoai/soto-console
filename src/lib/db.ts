import Database from 'better-sqlite3'
import path from 'path'
import { apps } from './app-registry'

const DB_PATH = process.env.DATABASE_PATH || path.join(process.cwd(), 'homebase.db')

let db: Database.Database | null = null

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH)
    db.pragma('journal_mode = WAL')
    db.pragma('foreign_keys = ON')

    // Initialize schema for each registered app
    for (const app of apps) {
      app.initSchema(db)
    }
  }
  return db
}
