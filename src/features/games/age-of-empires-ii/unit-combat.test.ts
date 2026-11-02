import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { importAttackModifiers } from './unit-combat'
import { importUnitRole } from './source-data'
import { civilizations } from './data'
import { allUniqueUnits } from './filter'

const units = civilizations.flatMap((civ) => allUniqueUnits(civ.units))

describe('unique-unit roles and attack bonuses', () => {
  it('imports Jaguar Warrior anti-infantry damage, not its base melee attack', () => {
    const jaguar = units.find((unit) => unit.id === 725)!
    assert.ok(jaguar.combat.role?.includes('Exceptionally strong vs. Infantry'))
    assert.deepEqual(
      jaguar.combat.bonuses.find((bonus) => bonus.classId === 1),
      {
        classId: 1,
        amount: 5,
        target: 'Infantry',
      },
    )
    assert.ok(
      jaguar.combat.bonuses.some(
        (bonus) => bonus.classId === 21 && bonus.amount > 0,
      ),
    )
    assert.ok(
      jaguar.combat.bonuses.every(
        (bonus) => bonus.classId !== 4 && bonus.amount !== 0,
      ),
    )
  })
  it('shows Huskarl anti-archer damage and source-described strengths', () => {
    const huskarl = units.find((unit) => unit.id === 41)!
    assert.equal(
      huskarl.combat.bonuses.find((bonus) => bonus.classId === 15)?.amount,
      6,
    )
    assert.ok(huskarl.combat.role)
  })
  it('preserves special abilities even when they are not ordinary attack bonuses', () => {
    const bowman = units.find((unit) => unit.id === 1800)!
    assert.ok(bowman.combat.role?.includes('ignores armor'))
    assert.ok(bowman.combat.bonuses.every((bonus) => bonus.classId !== 3))
  })
  it('excludes base/zero damage and separates special and negative components', () => {
    const combat = importAttackModifiers([
      { Class: 3, Amount: 6 },
      { Class: 4, Amount: 10 },
      { Class: 15, Amount: 0 },
      { Class: 1, Amount: 5 },
      { Class: 31, Amount: 8 },
      { Class: 39, Amount: -3 },
      { Class: 26, Amount: -2 },
    ])
    assert.deepEqual(
      combat.bonuses.map((bonus) => [bonus.classId, bonus.amount]),
      [
        [1, 5],
        [26, -2],
      ],
    )
    assert.deepEqual(
      combat.special.map((bonus) => [bonus.classId, bonus.amount]),
      [
        [31, 8],
        [39, -3],
      ],
    )
  })
  it('does not guess labels for unknown future armor classes', () => {
    assert.equal(
      importAttackModifiers([{ Class: 999, Amount: 3 }]).bonuses[0].target,
      'Armor class 999',
    )
    assert.throws(() => importAttackModifiers(undefined))
    assert.throws(() => importAttackModifiers([{ Class: 1, Amount: NaN }]))
  })
  it('extracts plain-text roles without cost templates, upgrade instructions, or HTML', () => {
    assert.equal(
      importUnitRole(
        'Create <b>Unit</b> (‹cost›)<br>Strong vs. Infantry.<br><i>Upgrades: armor.</i>‹hp›',
      ),
      'Strong vs. Infantry.',
    )
    assert.equal(importUnitRole(undefined), null)
  })
  it('imports role/bonus data for every unit variant and elite upgrade', () => {
    assert.ok(units.length > 100)
    assert.ok(
      units.every(
        (unit) => unit.combat.role && !/[<>‹›]/.test(unit.combat.role),
      ),
    )
    assert.ok(
      units.every((unit) =>
        unit.combat.bonuses.every(
          (bonus) => bonus.amount !== 0 && Number.isFinite(bonus.amount),
        ),
      ),
    )
  })
})
