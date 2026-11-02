import type { UniqueUnit } from './source-data'
import { ResourceCost } from './resource-cost'

export function UnitPreview({ unit }: { unit: UniqueUnit }) {
  const bonuses = [...unit.combat.bonuses].sort((a, b) => b.amount - a.amount)
  return (
    <>
      <div className="unit-profile">
        <div className="unit-portrait">
          <img
            src={`/aoe2/units/${unit.id}.png`}
            alt={unit.name}
            width={64}
            height={64}
            loading="lazy"
          />
          <h4>{unit.name}</h4>
        </div>
        <div className="unit-stats">
          <dl>
            <div>
              <dt>HP</dt>
              <dd>{unit.hp}</dd>
            </div>
            <div>
              <dt>Attack</dt>
              <dd>{unit.attack}</dd>
            </div>
            <div>
              <dt>Range</dt>
              <dd>{unit.range}</dd>
            </div>
          </dl>
          <ResourceCost cost={unit.cost} />
          <div className="unit-building">
            <img
              src={`/aoe2/buildings/${unit.building.id}.png`}
              alt=""
              width={18}
              height={18}
              loading="lazy"
            />
            <span>
              {unit.building.name} · {unit.age}
            </span>
          </div>
        </div>
      </div>
      <div className="unit-matchups">
        {unit.combat.role && <p className="unit-role">{unit.combat.role}</p>}
        {bonuses.length > 0 ? (
          <>
            <h5>Attack bonuses / modifiers</h5>
            <ul className="unit-attack-bonuses">
              {bonuses.map((bonus, index) => (
                <li key={`${bonus.classId}-${index}`}>
                  <strong>
                    {bonus.amount > 0 ? '+' : ''}
                    {bonus.amount}
                  </strong>{' '}
                  vs {bonus.target}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="unit-no-bonus">
            No extra target-class damage in the imported attack table.
          </p>
        )}
        {unit.combat.special.length > 0 && (
          <details className="unit-special-attacks">
            <summary>Special attack components</summary>
            <ul>
              {unit.combat.special.map((component, index) => (
                <li key={`${component.classId}-${index}`}>
                  {component.amount > 0 ? '+' : ''}
                  {component.amount} · {component.target}
                </li>
              ))}
            </ul>
          </details>
        )}
      </div>
      {unit.upgrades.length > 0 && (
        <details className="unit-upgrades">
          <summary>
            Upgrades: {unit.upgrades.map((upgrade) => upgrade.name).join(', ')}
          </summary>
          {unit.upgrades.map((upgrade) => (
            <UnitPreview key={upgrade.id} unit={upgrade} />
          ))}
        </details>
      )}
    </>
  )
}
