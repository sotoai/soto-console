import { getAllPlayers } from '@/apps/game-roulette/lib/services/playerService'
import { PlayerGrid } from '@/apps/game-roulette/components/players/PlayerGrid'

export const dynamic = 'force-dynamic'

export default function PlayersPage() {
  const players = getAllPlayers()
  return (
    <div className="animate-fade-in">
      <PlayerGrid initialPlayers={players} />
    </div>
  )
}
