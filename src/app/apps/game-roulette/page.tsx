import { getAllGames } from '@/apps/game-roulette/lib/services/gameService'
import { getAllPlayers } from '@/apps/game-roulette/lib/services/playerService'
import { getAllTournaments } from '@/apps/game-roulette/lib/services/tournamentService'
import { getAllChallenges } from '@/apps/game-roulette/lib/services/challengeService'
import { StatsCards } from '@/apps/game-roulette/components/dashboard/StatsCards'
import { Leaderboard } from '@/apps/game-roulette/components/dashboard/Leaderboard'
import { RecentActivity } from '@/apps/game-roulette/components/dashboard/RecentActivity'

export const dynamic = 'force-dynamic'

export default function DashboardPage() {
  const games = getAllGames()
  const players = getAllPlayers()
  const tournaments = getAllTournaments()
  const challenges = getAllChallenges()

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl">
      <StatsCards
        gameCount={games.length}
        playerCount={players.length}
        tournamentCount={tournaments.length}
        challengeCount={challenges.length}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Leaderboard players={players} />
        <RecentActivity challenges={challenges} games={games} players={players} />
      </div>
    </div>
  )
}
