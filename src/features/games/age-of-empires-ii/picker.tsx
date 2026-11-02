import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowLeft, Search, Shuffle } from 'lucide-react'
import { PageHeading } from '@/components/page-heading'
import { Button } from '@/components/ui/button'
import { FilterChips, SearchField } from '@/components/tool-filters'
import { CivilizationCard } from '@/features/games/age-of-empires-ii/civilization-card'
import { filterCivilizations } from '@/features/games/age-of-empires-ii/filter'
import {
  civilizations,
  playstyles,
  type AttackStyle,
  type Playstyle,
} from '@/features/games/age-of-empires-ii/data'
import { DataStatus } from './data-status'
import { expansions } from './expansions'
import { games } from '@/features/games/catalog'

const focuses: (Playstyle | 'All')[] = ['All', ...playstyles]
const attacks: AttackStyle[] = ['All', 'Melee', 'Ranged']
const resources = games[0].links

export function CivilizationPicker() {
  const [query, setQuery] = useState('')
  const [focus, setFocus] = useState<Playstyle | 'All'>('All')
  const [attack, setAttack] = useState<AttackStyle>('All')
  const [expansion, setExpansion] = useState('All')
  const [pick, setPick] = useState<string | null>(null)
  const results = filterCivilizations(query, focus, attack, expansion)
  function resetPick() {
    setPick(null)
  }
  return (
    <>
      <Link
        to="/games/$gameId"
        params={{ gameId: 'age-of-empires-ii' }}
        className="back-link"
      >
        <ArrowLeft size={14} />
        Age of Empires II
      </Link>
      <div
        className="aoe-masthead"
        aria-label="Age of Empires II Definitive Edition"
      >
        <span className="aoe-seal" aria-hidden="true">
          II
        </span>
        <div>
          <span className="aoe-game-title">
            Age of Empires <span>II</span>
          </span>
          <span className="aoe-edition">
            DEFINITIVE EDITION · CIVILIZATION COMPANION
          </span>
        </div>
        <span className="aoe-masthead-rule" aria-hidden="true" />
      </div>
      <PageHeading
        eyebrow="THE COUNCIL CHAMBER"
        title="Find your next civilization."
        description="Start with your playstyle. Discover a civilization worth trying."
        action={
          <Button
            disabled={!results.length}
            onClick={() =>
              setPick(results[Math.floor(Math.random() * results.length)].id)
            }
          >
            <Shuffle size={16} />
            Pick for me
          </Button>
        }
      />
      <DataStatus />
      <nav className="aoe-resources" aria-label="AoE II resources">
        <h2>Resources</h2>
        {resources.map((resource) => (
          <a
            key={resource.url}
            href={resource.url}
            target="_blank"
            rel="noreferrer"
          >
            {resource.label}
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        ))}
      </nav>
      <section className="filter-panel" aria-label="Civilization filters">
        <h2 className="aoe-filter-heading">Choose your way of war</h2>
        <div className="filter-top">
          <SearchField
            value={query}
            onChange={(value) => {
              setQuery(value)
              resetPick()
            }}
            label="Search civilizations or unique units"
            placeholder="Search civilizations or unique units…"
          />
          <label className="expansion-filter">
            <span>Expansion / access</span>
            <select
              value={expansion}
              onChange={(event) => {
                setExpansion(event.target.value)
                resetPick()
              }}
            >
              <option value="All">All expansions</option>
              <option value="included">Included with current DE</option>
              {expansions.map((pack) => (
                <option key={pack.id} value={pack.id}>
                  {pack.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="filter-bottom">
          <span>CIV FOCUS</span>
          <FilterChips
            options={focuses}
            value={focus}
            onChange={(value) => {
              setFocus(value)
              resetPick()
            }}
          />
        </div>
        <div className="filter-bottom">
          <span>UNIQUE-UNIT ATTACKS</span>
          <FilterChips
            options={attacks}
            value={attack}
            onChange={(value) => {
              setAttack(value)
              resetPick()
            }}
          />
        </div>
      </section>
      <div className="section-heading">
        <h2>
          {pick ? 'Your next pick' : 'Explore civilizations'}{' '}
          <span>{pick ? '01' : String(results.length).padStart(2, '0')}</span>
        </h2>
        <div role="status" className="muted">
          {pick
            ? 'Randomly selected from your filtered results'
            : `${results.length} of ${civilizations.length} civilizations`}
        </div>
        {pick && (
          <Button variant="outline" size="sm" onClick={resetPick}>
            Show all matches
          </Button>
        )}
      </div>
      {results.length ? (
        <div className="civ-grid">
          {results
            .filter((civ) => !pick || civ.id === pick)
            .map((civ) => (
              <CivilizationCard key={civ.id} civ={civ} />
            ))}
        </div>
      ) : (
        <div className="empty-state">
          <Search size={28} />
          <h2>No civilizations match</h2>
          <p>Try a different search or loosen your filters.</p>
          <Button
            variant="outline"
            onClick={() => {
              setQuery('')
              setFocus('All')
              setAttack('All')
              setExpansion('All')
              resetPick()
            }}
          >
            Reset filters
          </Button>
        </div>
      )}
      <p className="aoe-art-credit">
        Age of Empires II © Microsoft Corporation. Game icons via{' '}
        <a
          href="https://github.com/SiegeEngineers/aoe2techtree"
          target="_blank"
          rel="noreferrer"
        >
          Siege Engineers / aoe2techtree
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
        . Not endorsed by or affiliated with Microsoft.
      </p>
    </>
  )
}
