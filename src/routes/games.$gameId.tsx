import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { ArrowLeft, ArrowRight, ExternalLink, Swords } from 'lucide-react'
import { visibleGames } from '@/features/games/catalog'
import { PageHeading } from '@/components/page-heading'
import { buttonVariants } from '@/components/ui/button'

export const Route = createFileRoute('/games/$gameId')({
  loader: ({ params }) => {
    const game = visibleGames.find((item) => item.id === params.gameId)
    if (!game) throw notFound()
    return game
  },
  component: GamePage,
})

function GamePage() {
  const game = Route.useLoaderData()
  return (
    <>
      <Link to="/" className="back-link">
        <ArrowLeft size={14} />
        All games
      </Link>
      <PageHeading
        eyebrow={game.available ? game.genre : undefined}
        title={game.name}
        description={game.available ? game.description : undefined}
      />
      {game.available && (
        <section className={`game-detail-banner ${game.color}`}>
          <span>{game.short}</span>
          <strong>{game.numeral}</strong>
          <div>
            <span className="eyebrow">YOUR GAME, AT A GLANCE</span>
            <h2>{game.edition}</h2>
            <p>Curated resources. Useful tools. Nothing in the way.</p>
          </div>
        </section>
      )}
      <div className={game.available ? 'detail-columns' : 'resource-page'}>
        {game.available && (
          <section>
            <div className="section-heading">
              <h2>Tools</h2>
            </div>
            <div className="panel tool-panel">
              <Swords size={25} />
              <h3>
                {game.available ? 'Civilization picker' : 'Loadout workbench'}
              </h3>
              <p>
                {game.available
                  ? 'Filter the full civilization roster, inspect unique units, or choose randomly.'
                  : 'Weapon builds, attachments, and recommendations are planned. This first version only includes the resources alongside.'}
              </p>
              {game.available ? (
                <Link
                  to="/games/age-of-empires-ii/picker"
                  className={buttonVariants()}
                >
                  Open civilization picker
                  <ArrowRight size={16} />
                </Link>
              ) : (
                <span className="outline-tag">Not available yet</span>
              )}
            </div>
          </section>
        )}
        <section>
          <div className="section-heading">
            <h2>Useful links</h2>
          </div>
          <div className="panel resource-list">
            {game.links.map((link) => (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noreferrer"
              >
                {link.label}
                <ExternalLink size={16} />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            ))}
            <p>External resources are maintained by their respective owners.</p>
          </div>
        </section>
      </div>
    </>
  )
}
