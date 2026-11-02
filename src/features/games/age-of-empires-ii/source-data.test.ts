import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import snapshot from './source-snapshot.json'
import {
  descriptionLines,
  formatSourceDate,
  importCivilizations,
  parseRevision,
} from './source-data'
import { parseCachedCheck } from './data-status'

const sha = 'a'.repeat(40)
function revision(message = 'Implement DE Update 188329') {
  return [
    { sha, commit: { message, committer: { date: '2026-10-27T19:43:17Z' } } },
  ]
}

describe('AoE II source revisions', () => {
  it('uses the source commit date and explicit patch, not the download date', () => {
    assert.deepEqual(parseRevision(revision()), {
      commit: sha,
      updatedAt: '2026-10-27T19:43:17.000Z',
      patch: '188329',
    })
    assert.equal(formatSourceDate('2026-10-27T23:43:17Z'), 'October 27, 2026')
  })
  it('does not invent a patch for a data correction', () => {
    assert.equal(
      parseRevision(revision('Fix unit costs, issue 123')).patch,
      null,
    )
  })
  it('rejects invalid responses and dates', () => {
    for (const input of [
      [],
      null,
      [{ sha: 'invalid' }],
      [
        {
          sha,
          commit: { message: 'Update', committer: { date: 'not-a-date' } },
        },
      ],
    ]) {
      assert.throws(() => parseRevision(input))
    }
  })
  it('validates cached successful checks and rejects malformed or future entries', () => {
    const result = {
      checkedAt: '2026-11-02T10:00:00Z',
      latest: parseRevision(revision()),
    }
    const now = Date.parse('2026-11-02T11:00:00Z')
    assert.deepEqual(parseCachedCheck(JSON.stringify(result), now), result)
    assert.equal(parseCachedCheck('broken', now), null)
    assert.equal(
      parseCachedCheck(JSON.stringify(result), now - 86_400_000),
      null,
    )
    assert.equal(
      parseCachedCheck(
        JSON.stringify({
          ...result,
          latest: { ...result.latest, patch: '<invalid>' },
        }),
        now,
      ),
      null,
    )
  })
})

describe('manual AoE II import', () => {
  function fixture() {
    const node = (id: number, name: string, parent: number | null) => ({
      node_id: id,
      name,
      use_type: 'Unit',
      node_type: 'UniqueUnit',
      node_status: 'ResearchedCompleted',
      building_id: 82,
      picture_index: 41,
      age_id: 3,
      link_id: parent,
    })
    const tree = {
      buildings: [{ node_id: 82, name: 'Castle', picture_index: 7 }],
      units_techs: [node(8, 'Unit', null), node(530, 'Elite Unit', 8)],
    }
    const data = {
      civs: {
        First: { era: 'base', help_string_id: 1 },
        Second: { era: 'base', help_string_id: 1 },
        Ancient: { era: 'antiquity' },
      },
      data: {
        Unit: Object.fromEntries(
          [8, 530].map((id) => [
            id,
            {
              ID: id,
              HP: 50,
              Attack: 8,
              Range: 4,
              Cost: { Food: 40, Gold: 20 },
              Attacks: [
                { Class: 3, Amount: 8 },
                { Class: 1, Amount: 5 },
              ],
            },
          ]),
        ),
      },
    }
    const strings = {
      1: 'Archer civilization<br>• A bonus<br><b>Unique Unit:</b><br>Unit<br><b>Unique Techs:</b><br>A technology<br><b>Team Bonus:</b><br>A team bonus',
    }
    return { data, strings, trees: { First: tree, Second: tree } }
  }
  it('imports every standard civilization, excluding other game modes, and groups upgrades', () => {
    const { data, strings, trees } = fixture()
    const result = importCivilizations(data, strings, trees)
    assert.deepEqual(
      result.map((civ) => civ.id),
      ['first', 'second'],
    )
    assert.deepEqual(result[0].focuses, ['Archers'])
    assert.deepEqual(result[0].bonuses, ['A bonus'])
    assert.equal(result[0].units.length, 1)
    assert.equal(result[0].units[0].upgrades[0].id, 530)
    assert.equal(result[0].teamBonus, 'A team bonus')
  })
  it('rejects incomplete or changed schemas before writing', () => {
    assert.throws(() => importCivilizations({}, {}, {}))
    const { data, strings, trees } = fixture()
    assert.throws(() => importCivilizations(data, strings, {}))
    data.data.Unit[8].HP = -1
    assert.throws(() => importCivilizations(data, strings, trees))
  })
  it('bundles the full 56-civilization source roster, not the original eight examples', () => {
    assert.match(snapshot.source.commit, /^[a-f0-9]{40}$/)
    assert.ok(Number.isFinite(Date.parse(snapshot.source.updatedAt)))
    assert.equal(snapshot.civilizations.length, 56)
    assert.equal(new Set(snapshot.civilizations.map((civ) => civ.id)).size, 56)
    assert.ok(
      snapshot.civilizations.every(
        (civ) => civ.units.length > 0 && civ.bonuses.length > 0,
      ),
    )
    assert.ok(snapshot.civilizations.some((civ) => civ.id === 'armenians'))
    assert.ok(snapshot.civilizations.some((civ) => civ.id === 'varangians'))
    for (const civ of snapshot.civilizations) {
      for (const unit of civ.units) {
        assert.equal(
          new Set(unit.upgrades.map((upgrade) => upgrade.id)).size,
          unit.upgrades.length,
          `${civ.id}/${unit.id}`,
        )
      }
    }
  })
  it('keeps source descriptions as plain text, not executable HTML', () => {
    assert.deepEqual(descriptionLines('<b>A &amp; B</b><br>• A bonus'), [
      'A & B',
      'A bonus',
    ])
    assert.equal(
      descriptionLines('<img src=x onerror=alert(1)>Plain text')[0],
      'Plain text',
    )
  })
})
