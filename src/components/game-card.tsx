import { Link } from '@tanstack/react-router'
import type { Game } from '@/features/games/catalog'

export function GameCard({ game }: { game: Game }) {
  return (
    <article className="game-entry">
      <div>
        <h2>
          <Link to="/games/$gameId" params={{ gameId: game.id }}>
            {game.name}
          </Link>
        </h2>
        {game.id === 'age-of-empires-ii' && <p>{game.edition}</p>}
      </div>
      <div className="game-entry-actions">
        {game.available && (
          <Link to="/games/age-of-empires-ii/picker" className="tool-link">
            Civilization picker
          </Link>
        )}
        <Link
          to="/games/$gameId"
          params={{ gameId: game.id }}
          className="resource-link"
        >
          Resources<span className="sr-only"> for {game.name}</span>
        </Link>
      </div>
    </article>
  )
}
