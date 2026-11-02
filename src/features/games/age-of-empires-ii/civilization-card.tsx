import { Bookmark, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePreferences } from '@/lib/preferences'
import type { Civilization } from './data'
import { UnitPreview } from './unit-preview'
import {
  accessLabel,
  accessVerifiedAt,
  civilizationExpansion,
} from './expansions'

export function CivilizationCard({ civ }: { civ: Civilization }) {
  const { preferences, toggleFavorite, ready } = usePreferences()
  const saved = preferences.favorites.includes(civ.id)
  const expansion = civilizationExpansion(civ.id)
  return (
    <article className="civ-card">
      <div className="civ-card-top">
        <img
          className="civ-crest"
          src={`/aoe2/civs/${civ.id}.png`}
          alt=""
          width={44}
          height={56}
          loading="lazy"
        />
        <div className="civ-card-heading">
          <h3>{civ.name}</h3>
          <span className="civ-focus">{civ.focusText}</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`${saved ? 'Unsave' : 'Save'} ${civ.name}`}
          aria-pressed={saved}
          disabled={!ready}
          onClick={() => toggleFavorite(civ.id)}
        >
          <Bookmark
            size={17}
            fill={saved ? 'currentColor' : 'none'}
            className={saved ? 'text-primary' : ''}
          />
        </Button>
      </div>
      <div className="civ-access">
        <span>{expansion?.name ?? 'Expansion not verified'}</span>
        <span className="tag">{accessLabel(expansion)}</span>
      </div>
      <div className="civ-unit-label">
        <span>Unique units</span>
      </div>
      {civ.units.map((unit) => (
        <UnitPreview key={unit.id} unit={unit} />
      ))}
      <p className="base-stats-note">
        Base stats and attack modifiers, before target bonus armor. Matching
        classes can overlap; bonuses are not guaranteed final damage.
        Civilization bonuses and technologies are not applied.
      </p>
      <ul className="civ-strengths">
        {civ.bonuses.slice(0, 3).map((bonus) => (
          <li key={bonus}>
            <Check size={13} />
            {bonus}
          </li>
        ))}
      </ul>
      <details className="civ-details">
        <summary>All bonuses, technologies & expansion</summary>
        {civ.bonuses.length > 3 && (
          <>
            <h4>Other civilization bonuses</h4>
            <ul>
              {civ.bonuses.slice(3).map((bonus) => (
                <li key={bonus}>{bonus}</li>
              ))}
            </ul>
          </>
        )}
        <h4>Unique technologies</h4>
        <ul>
          {civ.uniqueTechs.map((tech) => (
            <li key={tech}>{tech}</li>
          ))}
        </ul>
        <h4>Team bonus</h4>
        <p>{civ.teamBonus}</p>
        <h4>Expansion & access</h4>
        <p>
          Introduced in {expansion?.name ?? 'an unverified expansion'}.
          {civ.id === 'hindustanis' &&
            ' Originally the Indians; reworked as Hindustanis with Dynasties of India.'}
        </p>
        <p>
          {expansion?.access === 'paid'
            ? `Requires ${expansion.name}, unless already owned or included in your bundle.`
            : expansion?.access === 'bundled'
              ? 'Included with current PC DE purchases. Older licenses may require the DLC separately.'
              : expansion
                ? 'Included in the base Definitive Edition; no separate civilization DLC required.'
                : 'Purchase requirement has not been verified.'}
        </p>
        {expansion?.sharedFeatures?.map((feature) => (
          <p key={feature}>{feature}</p>
        ))}
        {civ.regionalFeatures.length > 0 && (
          <>
            <h4>Shared / regional units & technologies</h4>
            <p>{civ.regionalFeatures.join(', ')}.</p>
          </>
        )}
        {expansion && (
          <p className="access-source">
            <a href={expansion.source} target="_blank" rel="noreferrer">
              Access source
              <span className="sr-only"> (opens in a new tab)</span>
            </a>{' '}
            · Checked {accessVerifiedAt}. Pack ownership is not a team bonus.
          </p>
        )}
      </details>
    </article>
  )
}
