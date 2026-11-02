import { createFileRoute } from '@tanstack/react-router'
import { PageHeading } from '@/components/page-heading'
import { GameCard } from '@/components/game-card'
import { visibleGames } from '@/features/games/catalog'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <>
      <PageHeading title="Games" />
      <div className="game-list">
        {visibleGames.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </>
  )
}
