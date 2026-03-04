export interface Score {
  id: string
  user_id: string
  game_id: string
  score: number
  created_at: string
}

export interface LeaderboardEntry extends Score {
  display_name: string
  avatar_url: string | null
  game_name: string
}
