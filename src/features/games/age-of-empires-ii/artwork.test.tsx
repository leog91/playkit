import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { civilizations } from './data'
import { allUniqueUnits } from './filter'
import { ResourceCost } from './resource-cost'

describe('AoE II artwork and costs', () => {
  it('bundles every displayed civilization crest and unique-unit portrait', () => {
    for (const civ of civilizations) {
      const units = allUniqueUnits(civ.units)
      for (const path of [
        `civs/${civ.id}.png`,
        ...units.flatMap((unit) => [
          `units/${unit.id}.png`,
          `buildings/${unit.building.id}.png`,
        ]),
      ]) {
        const image = readFileSync(
          new URL(`../../../../public/aoe2/${path}`, import.meta.url),
        )
        assert.equal(image.subarray(1, 4).toString(), 'PNG', path)
      }
    }
  })
  it('labels icon-only resource amounts for screen readers and omits zero costs', () => {
    const markup = renderToStaticMarkup(
      <ResourceCost cost={{ Food: 55, Gold: 25, Wood: 0 }} />,
    )
    assert.match(markup, /aria-label="Unit resource cost"/)
    assert.match(markup, /resources\/food\.png/)
    assert.match(markup, /resources\/gold\.png/)
    assert.match(markup, /55/)
    assert.match(markup, /25/)
    assert.match(markup, / food/)
    assert.doesNotMatch(markup, /resources\/wood\.png/)
  })
  it('supports wood and stone icons when a cost includes them', () => {
    const markup = renderToStaticMarkup(
      <ResourceCost cost={{ Wood: 200, Stone: 50 }} />,
    )
    assert.match(markup, /resources\/wood\.png/)
    assert.match(markup, /resources\/stone\.png/)
  })
})
