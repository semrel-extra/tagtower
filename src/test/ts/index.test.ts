import * as assert from 'node:assert'
import { describe, it } from 'node:test'
import {createTower} from '../../main/ts/index'
import path from "node:path";
import fs from "node:fs/promises";
import {exec} from "../../main/ts/git";
import process from "node:process";

const temp = path.resolve(process.cwd(), 'temp')

describe('tagTower', () => {
  it('provides CRUD-like API', async () => {
    const cwd = path.resolve(temp, 'local-repo')
    await fs.mkdir(cwd, { recursive: true })
    await exec('git', ['init', '--bare'], {cwd})

    const tower = createTower({
      url: cwd,
      branch: 'test-tag-tower',
      temp
    })

    const id = 'some@tag'
    const data: Record<string, any> = {
      hash: '3f9f0a88b411a8932bce289a3dd498d70a4dc96c',
      author: 'Anton Golub <antongolub@antongolub.com>',
      message: `feat: initial feat`
    }

    await tower.create(id, data)
    assert.deepEqual((await tower.read(id))?.data, data)
    assert.equal(await tower.read('not-found'), null)

    const entries = await tower.read()
    assert.ok(entries.some(entry => entry.id === id))

    await tower.update(id, {...data, foo: 'bar'})
    assert.equal((await tower.read(id))?.data.foo, 'bar')

    await tower.delete(id)
    assert.equal(await tower.read(id), null)
  })
})
