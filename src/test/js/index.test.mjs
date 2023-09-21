import assert from 'node:assert'
import { describe, it } from 'node:test'
import { createTower } from 'tagtower'

describe('mjs createTower()', () => {
  it('is callable', () => {
    assert.equal(typeof createTower, 'function')
  })
})
