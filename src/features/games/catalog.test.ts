import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { games, visibleGames } from './catalog'

describe('game visibility', () => {
  it('only exposes Age of Empires II for now', () => {
    assert.deepEqual(visibleGames.map((game) => game.id), ['age-of-empires-ii'])
  })

  it('retains Battlefield entries without exposing their pages or navigation', () => {
    const battlefield = games.filter((game) => game.id.startsWith('battlefield-'))
    assert.equal(battlefield.length, 2)
    assert.ok(battlefield.every((game) => game.hidden))
    assert.ok(visibleGames.every((game) => !game.hidden))
  })
})
