import { Gamepad2, LayoutDashboard, Users, Trophy, Swords } from 'lucide-react'
import type { AppManifest } from '@/types'
import type Database from 'better-sqlite3'
import { GameRouletteWidget } from './widgets/GameRouletteWidget'

export const gameRouletteApp: AppManifest = {
  id: 'game-roulette',
  name: 'GameRoulette',
  description: 'Tournament challenges & brackets',
  icon: Gamepad2,
  gradient: 'from-blue-500 to-violet-500',
  basePath: '/apps/game-roulette',
  navItems: [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/games', label: 'Games', icon: Gamepad2 },
    { href: '/players', label: 'Players', icon: Users },
    { href: '/tournaments', label: 'Tournaments', icon: Trophy },
    { href: '/challenges', label: 'Challenges', icon: Swords },
  ],
  widget: GameRouletteWidget,
  initSchema: (db: Database.Database) => {
    db.exec(`
      CREATE TABLE IF NOT EXISTS games (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        imageUrl TEXT,
        minPlayers INTEGER NOT NULL DEFAULT 2,
        maxPlayers INTEGER NOT NULL DEFAULT 2,
        gameType TEXT NOT NULL DEFAULT 'versus',
        scoringType TEXT NOT NULL DEFAULT 'points',
        defaultWeight REAL NOT NULL DEFAULT 1.0,
        createdAt TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS players (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        avatarUrl TEXT,
        initials TEXT NOT NULL,
        color TEXT NOT NULL,
        wins INTEGER NOT NULL DEFAULT 0,
        losses INTEGER NOT NULL DEFAULT 0,
        totalScore REAL NOT NULL DEFAULT 0,
        challengesPlayed INTEGER NOT NULL DEFAULT 0,
        createdAt TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS tournaments (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        format TEXT NOT NULL DEFAULT 'single-elimination',
        status TEXT NOT NULL DEFAULT 'draft',
        playerIds TEXT NOT NULL DEFAULT '[]',
        gameIds TEXT NOT NULL DEFAULT '[]',
        brackets TEXT NOT NULL DEFAULT '[]',
        createdAt TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS challenges (
        id TEXT PRIMARY KEY,
        tournamentId TEXT,
        gameId TEXT NOT NULL,
        roundNumber INTEGER NOT NULL DEFAULT 1,
        matchNumber INTEGER NOT NULL DEFAULT 1,
        playerIds TEXT NOT NULL DEFAULT '[]',
        scores TEXT NOT NULL DEFAULT '{}',
        status TEXT NOT NULL DEFAULT 'pending',
        winnerId TEXT,
        rules TEXT,
        weight REAL NOT NULL DEFAULT 1.0,
        createdAt TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (gameId) REFERENCES games(id),
        FOREIGN KEY (tournamentId) REFERENCES tournaments(id)
      );
    `)
  },
}
