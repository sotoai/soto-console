import { NextResponse } from 'next/server'
import { createGame } from '@/apps/game-roulette/lib/services/gameService'
import { createPlayer } from '@/apps/game-roulette/lib/services/playerService'
import { createChallenge, updateChallenge } from '@/apps/game-roulette/lib/services/challengeService'
import { createTournament, updateTournament } from '@/apps/game-roulette/lib/services/tournamentService'
import { getAllGames } from '@/apps/game-roulette/lib/services/gameService'
import { getAllPlayers } from '@/apps/game-roulette/lib/services/playerService'

export async function POST() {
  // Check if already seeded
  const existingGames = getAllGames()
  if (existingGames.length > 0) {
    return NextResponse.json({ message: 'Already seeded' })
  }

  // Create games
  const games = [
    { name: 'Mario Kart 8', description: 'Racing game with items and power-ups', minPlayers: 2, maxPlayers: 4, gameType: 'free-for-all' as const, scoringType: 'points' as const, defaultWeight: 1.5 },
    { name: 'Super Smash Bros', description: 'Platform fighting game', minPlayers: 2, maxPlayers: 4, gameType: 'versus' as const, scoringType: 'win-loss' as const, defaultWeight: 2.0 },
    { name: 'Chess', description: 'Classic strategy board game', minPlayers: 2, maxPlayers: 2, gameType: 'versus' as const, scoringType: 'win-loss' as const, defaultWeight: 1.0 },
    { name: 'Tetris Sprint', description: '40-line sprint time trial', minPlayers: 1, maxPlayers: 1, gameType: 'solo-time' as const, scoringType: 'time' as const, defaultWeight: 1.0 },
    { name: 'Rocket League', description: 'Soccer with rocket-powered cars', minPlayers: 2, maxPlayers: 4, gameType: 'versus' as const, scoringType: 'points' as const, defaultWeight: 1.5 },
    { name: 'Wii Sports Bowling', description: 'Motion-controlled bowling', minPlayers: 2, maxPlayers: 4, gameType: 'free-for-all' as const, scoringType: 'points' as const, defaultWeight: 1.0 },
    { name: 'Poker', description: 'Texas Hold\'em tournament', minPlayers: 2, maxPlayers: 8, gameType: 'free-for-all' as const, scoringType: 'points' as const, defaultWeight: 2.0 },
    { name: 'Fortnite Build Battle', description: '1v1 build battle arena', minPlayers: 2, maxPlayers: 2, gameType: 'versus' as const, scoringType: 'win-loss' as const, defaultWeight: 1.5 },
  ]

  const createdGames = games.map(g => createGame(g))

  // Create players
  const playerNames = [
    'Alex Thunder', 'Sam Phoenix', 'Jordan Blaze', 'Riley Storm',
    'Casey Nova', 'Morgan Frost', 'Taylor Hex', 'Quinn Volt',
  ]
  const createdPlayers = playerNames.map(name => createPlayer({ name }))

  // Create some completed challenges
  const ch1 = createChallenge({
    gameId: createdGames[0].id,
    playerIds: [createdPlayers[0].id, createdPlayers[1].id, createdPlayers[2].id],
    rules: 'Best of 3 races, 150cc, all items',
    weight: 1.5,
  })
  updateChallenge(ch1.id, {
    status: 'completed',
    scores: { [createdPlayers[0].id]: 42, [createdPlayers[1].id]: 38, [createdPlayers[2].id]: 28 },
    winnerId: createdPlayers[0].id,
    playerIds: [createdPlayers[0].id, createdPlayers[1].id, createdPlayers[2].id],
  })

  const ch2 = createChallenge({
    gameId: createdGames[1].id,
    playerIds: [createdPlayers[3].id, createdPlayers[4].id],
    rules: 'Best of 5, 3 stock, no items',
    weight: 2.0,
  })
  updateChallenge(ch2.id, {
    status: 'completed',
    scores: { [createdPlayers[3].id]: 3, [createdPlayers[4].id]: 2 },
    winnerId: createdPlayers[3].id,
    playerIds: [createdPlayers[3].id, createdPlayers[4].id],
  })

  // Create an active challenge
  const ch3 = createChallenge({
    gameId: createdGames[2].id,
    playerIds: [createdPlayers[5].id, createdPlayers[6].id],
    rules: 'Standard rules, 10 min timer',
    weight: 1.0,
  })
  updateChallenge(ch3.id, {
    status: 'in-progress',
    playerIds: [createdPlayers[5].id, createdPlayers[6].id],
  })

  // Create a pending challenge
  createChallenge({
    gameId: createdGames[4].id,
    playerIds: [createdPlayers[0].id, createdPlayers[7].id],
    rules: '5-minute match, no mutators',
    weight: 1.5,
  })

  // Update player stats for completed challenges
  // Player 0: won ch1
  // Player 3: won ch2

  // Create a tournament
  const tournament = createTournament({
    name: 'Friday Night Showdown',
    format: 'single-elimination',
    playerIds: createdPlayers.slice(0, 8).map(p => p.id),
    gameIds: [createdGames[0].id, createdGames[1].id],
  })
  updateTournament(tournament.id, { status: 'active' })

  // Create a round-robin tournament
  const rr = createTournament({
    name: 'Chess Championship',
    format: 'round-robin',
    playerIds: createdPlayers.slice(0, 4).map(p => p.id),
    gameIds: [createdGames[2].id],
  })

  return NextResponse.json({ message: 'Seeded successfully', games: createdGames.length, players: createdPlayers.length })
}
