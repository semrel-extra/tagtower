import * as assert from 'node:assert'
import { describe, it } from 'node:test'
import {createTower} from '../../main/ts/index'
import path from "node:path";
import fs from "node:fs/promises";
import {exec} from "../../main/ts/git";
import process from "node:process";

const temp = path.resolve(process.cwd(), 'temp')

describe('tagTower', () => {
  it('provides CRUD', async () => {
    const cwd = path.resolve(temp, 'local-repo')
    await fs.mkdir(cwd, { recursive: true })
    await exec('git', ['init', '--bare'], {cwd})

    const tower = createTower({
      url: cwd,
      branch: 'test-tag-tower',
      temp
    })

    const tag = 'some@tag'
    const entry: Record<string, any> = {
      hash: '3f9f0a88b411a8932bce289a3dd498d70a4dc96c',
      author: 'Anton Golub <antongolub@antongolub.com>',
      message: `feat: initial feat`
    }

    await tower.create(tag, entry)
    assert.deepEqual(await tower.read(tag), entry)
    assert.equal(await tower.read('not-found'), null)

    const tags = await tower.read()
    assert.ok(tags.some(entry => entry.tag === tag))

    await tower.update(tag, {...entry, foo: 'bar'})
    assert.equal((await tower.read(tag))?.foo, 'bar')

    await tower.delete(tag)
    assert.equal(await tower.read(tag), null)
  })
})
