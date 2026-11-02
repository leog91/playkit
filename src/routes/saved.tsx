import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { PageHeading } from '@/components/page-heading'
import { buttonVariants } from '@/components/ui/button'
import { civilizations } from '@/features/games/age-of-empires-ii/data'
import { CivilizationCard } from '@/features/games/age-of-empires-ii/civilization-card'
import { usePreferences } from '@/lib/preferences'

export const Route = createFileRoute('/saved')({ component: Saved })
function Saved() {
  const { preferences, ready } = usePreferences()
  const saved = civilizations.filter((civ) =>
    preferences.favorites.includes(civ.id),
  )
  return (
    <>
      <PageHeading title="Saved items" />
      {!ready ? (
        <p role="status">Loading saved items…</p>
      ) : saved.length ? (
        <>
          <div className="section-heading">
            <h2>
              Age of Empires II <span>{saved.length}</span>
            </h2>
          </div>
          <div className="civ-grid">
            {saved.map((civ) => (
              <CivilizationCard key={civ.id} civ={civ} />
            ))}
          </div>
        </>
      ) : (
        <div className="saved-empty">
          <p>
            No saved civilizations. Use the bookmark button on a civilization to
            save it.
          </p>
          <Link
            className={buttonVariants()}
            to="/games/age-of-empires-ii/picker"
          >
            Civilization picker
            <ArrowRight size={16} />
          </Link>
        </div>
      )}
    </>
  )
}
