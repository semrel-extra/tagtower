const assert = require('node:assert')
const { describe, it } = require('node:test')
const { createTower} = require('tagtower')

describe('cjs createTower()', () => {
  it('is callable', () => {
    assert.equal(typeof createTower, 'function')
  })
})
