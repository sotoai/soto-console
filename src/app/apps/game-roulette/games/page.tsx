import { getAllGames } from '@/apps/game-roulette/lib/services/gameService'
import { GameGrid } from '@/apps/game-roulette/components/games/GameGrid'

export const dynamic = 'force-dynamic'

export default function GamesPage() {
  const games = getAllGames()
  return (
    <div className="animate-fade-in">
      <GameGrid initialGames={games} />
    </div>
  )
}
