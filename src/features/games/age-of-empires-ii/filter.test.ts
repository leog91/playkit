import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { allUniqueUnits, filterCivilizations } from './filter'
import { civilizations } from './data'
import { civilizationExpansion, expansions } from './expansions'

describe('full civilization picker', () => {
  it('shows the full imported roster without filters', () => {
    assert.equal(filterCivilizations('', 'All').length, civilizations.length)
    assert.ok(civilizations.length > 8)
  })
  it('matches names and all unique units, ignoring case and surrounding spaces', () => {
    assert.equal(filterCivilizations('  ARMENIANS ', 'All')[0]?.id, 'armenians')
    assert.equal(
      filterCivilizations('warrior priest', 'All')[0]?.id,
      'armenians',
    )
    assert.equal(
      filterCivilizations('elite longbowman', 'Archers')[0]?.id,
      'britons',
    )
    assert.equal(filterCivilizations('houfnice', 'All')[0]?.id, 'bohemians')
  })
  it('filters by source focus and actual unique-unit attack range', () => {
    assert.ok(
      filterCivilizations('', 'Infantry', 'Ranged').some(
        (civ) => civ.id === 'armenians',
      ),
    )
    assert.ok(
      filterCivilizations('', 'All', 'Melee').every((civ) =>
        allUniqueUnits(civ.units).some((unit) => unit.range === 0),
      ),
    )
    assert.equal(filterCivilizations('britons', 'Cavalry').length, 0)
    assert.equal(filterCivilizations('not-a-civilization', 'All').length, 0)
  })
  it('filters by expansion and current base-game inclusion', () => {
    assert.deepEqual(
      filterCivilizations('', 'All', 'All', 'mountain-royals').map(
        (civ) => civ.id,
      ),
      ['armenians', 'georgians'],
    )
    assert.ok(
      filterCivilizations('', 'All', 'All', 'included').some(
        (civ) => civ.id === 'bohemians',
      ),
    )
    assert.ok(
      !filterCivilizations('', 'All', 'All', 'included').some(
        (civ) => civ.id === 'romans',
      ),
    )
  })
  it('has exactly one reviewed expansion and access classification per civilization', () => {
    for (const civ of civilizations) {
      assert.ok(civilizationExpansion(civ.id), civ.id)
      assert.equal(
        expansions.filter((pack) => pack.civilizations.includes(civ.id)).length,
        1,
      )
    }
    assert.equal(civilizationExpansion('magyars')?.access, 'base')
    assert.equal(civilizationExpansion('bohemians')?.access, 'bundled')
    assert.equal(civilizationExpansion('armenians')?.access, 'paid')
  })
  it('imports non-Castle unique units and distinguishes elite upgrades', () => {
    const armenians = civilizations.find((civ) => civ.id === 'armenians')!
    assert.ok(
      armenians.units.some(
        (unit) =>
          unit.name === 'Warrior Priest' &&
          unit.building.name === 'Fortified Church',
      ),
    )
    const bohemians = civilizations.find((civ) => civ.id === 'bohemians')!
    assert.ok(
      bohemians.units.some(
        (unit) =>
          unit.name === 'Houfnice' && unit.building.name === 'Siege Workshop',
      ),
    )
    const britons = civilizations.find((civ) => civ.id === 'britons')!
    assert.equal(britons.units.length, 1)
    assert.equal(britons.units[0].upgrades[0].name, 'Elite Longbowman')
  })
})
