import { getDb } from '@/lib/db'
import { Tournament, BracketMatch } from '@/apps/game-roulette/types'
import { v4 as uuid } from 'uuid'

function parseTournament(row: Record<string, unknown>): Tournament {
  return {
    ...row,
    playerIds: JSON.parse(row.playerIds as string),
    gameIds: JSON.parse(row.gameIds as string),
    brackets: JSON.parse(row.brackets as string),
  } as Tournament
}

export function getAllTournaments(): Tournament[] {
  const db = getDb()
  const rows = db.prepare('SELECT * FROM tournaments ORDER BY createdAt DESC').all() as Record<string, unknown>[]
  return rows.map(parseTournament)
}

export function getTournamentById(id: string): Tournament | undefined {
  const db = getDb()
  const row = db.prepare('SELECT * FROM tournaments WHERE id = ?').get(id) as Record<string, unknown> | undefined
  return row ? parseTournament(row) : undefined
}

export function createTournament(data: {
  name: string
  format: Tournament['format']
  playerIds: string[]
  gameIds: string[]
}): Tournament {
  const db = getDb()
  const id = uuid()
  const now = new Date().toISOString()
  const brackets = generateBrackets(data.format, data.playerIds)
  db.prepare(`
    INSERT INTO tournaments (id, name, format, status, playerIds, gameIds, brackets, createdAt)
    VALUES (?, ?, ?, 'draft', ?, ?, ?, ?)
  `).run(id, data.name, data.format, JSON.stringify(data.playerIds), JSON.stringify(data.gameIds), JSON.stringify(brackets), now)
  return getTournamentById(id)!
}

export function updateTournament(id: string, data: Partial<Tournament>): Tournament | undefined {
  const db = getDb()
  const existing = getTournamentById(id)
  if (!existing) return undefined
  const updated = { ...existing, ...data }
  db.prepare(`
    UPDATE tournaments SET name=?, format=?, status=?, playerIds=?, gameIds=?, brackets=?
    WHERE id=?
  `).run(
    updated.name, updated.format, updated.status,
    JSON.stringify(updated.playerIds), JSON.stringify(updated.gameIds),
    JSON.stringify(updated.brackets), id
  )
  return getTournamentById(id)
}

export function deleteTournament(id: string): boolean {
  const db = getDb()
  const result = db.prepare('DELETE FROM tournaments WHERE id = ?').run(id)
  return result.changes > 0
}

function generateBrackets(format: Tournament['format'], playerIds: string[]): BracketMatch[] {
  if (format === 'round-robin') return generateRoundRobin(playerIds)
  return generateSingleElimination(playerIds)
}

function generateSingleElimination(playerIds: string[]): BracketMatch[] {
  const matches: BracketMatch[] = []
  let n = 1
  while (n < playerIds.length) n *= 2
  const totalRounds = Math.log2(n)

  for (let i = 0; i < n / 2; i++) {
    const p1 = playerIds[i] || null
    const p2 = playerIds[n - 1 - i] || null
    const players = [p1, p2].filter(Boolean) as string[]
    const matchId = uuid()
    matches.push({
      id: matchId,
      round: 1,
      position: i,
      playerIds: players,
      scores: {},
      status: players.length === 1 ? 'completed' : 'pending',
      winnerId: players.length === 1 ? players[0] : undefined,
    })
  }

  let matchesInRound = n / 4
  for (let round = 2; round <= totalRounds; round++) {
    for (let pos = 0; pos < matchesInRound; pos++) {
      matches.push({
        id: uuid(),
        round,
        position: pos,
        playerIds: [],
        scores: {},
        status: 'pending',
      })
    }
    matchesInRound /= 2
  }

  for (let round = 1; round < totalRounds; round++) {
    const roundMatches = matches.filter(m => m.round === round)
    const nextRoundMatches = matches.filter(m => m.round === round + 1)
    for (let i = 0; i < roundMatches.length; i += 2) {
      const nextMatch = nextRoundMatches[Math.floor(i / 2)]
      if (nextMatch) {
        roundMatches[i].nextMatchId = nextMatch.id
        if (roundMatches[i + 1]) roundMatches[i + 1].nextMatchId = nextMatch.id
      }
    }
  }

  for (const match of matches) {
    if (match.status === 'completed' && match.winnerId && match.nextMatchId) {
      const next = matches.find(m => m.id === match.nextMatchId)
      if (next && !next.playerIds.includes(match.winnerId)) {
        next.playerIds.push(match.winnerId)
      }
    }
  }

  return matches
}

function generateRoundRobin(playerIds: string[]): BracketMatch[] {
  const matches: BracketMatch[] = []
  let round = 1
  for (let i = 0; i < playerIds.length; i++) {
    for (let j = i + 1; j < playerIds.length; j++) {
      matches.push({
        id: uuid(),
        round,
        position: matches.length,
        playerIds: [playerIds[i], playerIds[j]],
        scores: {},
        status: 'pending',
      })
    }
    round++
  }
  return matches
}
