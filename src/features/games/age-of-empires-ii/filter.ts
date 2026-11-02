import { civilizations, type Playstyle, type AttackStyle } from './data'
import { civilizationExpansion } from './expansions'
import type { UniqueUnit } from './source-data'

export function allUniqueUnits(units: UniqueUnit[]): UniqueUnit[] {
  return units.flatMap((unit) => [unit, ...allUniqueUnits(unit.upgrades)])
}

export function filterCivilizations(
  query: string,
  focus: Playstyle | 'All',
  attack: AttackStyle = 'All',
  expansion = 'All',
) {
  const term = query.trim().toLowerCase()
  return civilizations.filter((civ) => {
    const units = allUniqueUnits(civ.units)
    const pack = civilizationExpansion(civ.id)
    return (
      (focus === 'All' || civ.focuses.includes(focus)) &&
      (attack === 'All' ||
        units.some((unit) =>
          attack === 'Ranged' ? unit.range > 0 : unit.range === 0,
        )) &&
      (expansion === 'All' ||
        (expansion === 'included'
          ? pack && pack.access !== 'paid'
          : pack?.id === expansion)) &&
      `${civ.name} ${civ.focusText} ${units.map((unit) => unit.name).join(' ')}`
        .toLowerCase()
        .includes(term)
    )
  })
}
