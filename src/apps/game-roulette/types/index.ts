export type GameType = 'versus' | 'co-op' | 'solo-time' | 'free-for-all'
export type ScoringType = 'points' | 'time' | 'win-loss'
export type TournamentFormat = 'single-elimination' | 'double-elimination' | 'round-robin'
export type TournamentStatus = 'draft' | 'active' | 'completed'
export type ChallengeStatus = 'pending' | 'in-progress' | 'completed'

export interface Game {
  id: string
  name: string
  description: string
  imageUrl?: string
  minPlayers: number
  maxPlayers: number
  gameType: GameType
  scoringType: ScoringType
  defaultWeight: number
  createdAt: string
}

export interface Player {
  id: string
  name: string
  avatarUrl?: string
  initials: string
  color: string
  wins: number
  losses: number
  totalScore: number
  challengesPlayed: number
  createdAt: string
}

export interface Tournament {
  id: string
  name: string
  format: TournamentFormat
  status: TournamentStatus
  playerIds: string[]
  gameIds: string[]
  brackets: BracketMatch[]
  createdAt: string
}

export interface BracketMatch {
  id: string
  round: number
  position: number
  playerIds: string[]
  scores: Record<string, number>
  winnerId?: string
  nextMatchId?: string
  status: ChallengeStatus
  gameId?: string
}

export interface Challenge {
  id: string
  tournamentId?: string
  gameId: string
  roundNumber: number
  matchNumber: number
  playerIds: string[]
  scores: Record<string, number>
  status: ChallengeStatus
  winnerId?: string
  rules?: string
  weight: number
  createdAt: string
}

export interface ApiResponse<T> {
  data?: T
  error?: string
}
