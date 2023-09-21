import * as assert from 'node:assert'
import { describe, it } from 'node:test'
import path from 'node:path'
import process from 'node:process'
import {exec, readTags, pushTags} from '../../main/ts/git'
import crypto from 'node:crypto'

const temp = path.resolve(process.cwd(), 'temp')

describe('git', () => {
  it('exec', async () => {
    const {stdout, code, stderr} = await exec('echo', ['foo'])

    assert.equal(stdout, 'foo\n')
    assert.equal(stderr, '')
    assert.equal(code, 0)
  })

  it.skip('readTags', async () => {
    const tags = await readTags({
      url: 'git@github.com:antongolub/tsc-esm-fix.git',
      branch: 'master',
      temp
    })

    const first = tags[tags.length - 1]
    assert.equal(first.tag, 'v1.0.0')
    assert.ok(first.body.includes('chore(release): 1.0.0 [skip ci]\n'))
  })

  it.skip('pushTags', async () => {
    await pushTags({
      url: 'git@github.com:semrel-extra/tagtower.git',
      branch: 'testtower',
      temp,
      tags: [
        {tag: 'test@1', body: 'test 1'},
        {tag: 'test@2', body: 'test 2'}
      ]
    })
  })

  it('pushTags (avalanche)', async () => {
    const l = 2
    const tags = [...Array(l)].map(() => ({
      tag: `test@${Math.random().toString(36).slice(2)}`,
      body: crypto.randomBytes(300).toString('hex')
    }))

    await pushTags({
      url: 'git@github.com:semrel-extra/tagtower.git',
      branch: 'testtower',
      temp,
      tags
    })

    const _tags = await readTags({
      url: 'git@github.com:semrel-extra/tagtower.git',
      branch: 'testtower',
      temp,
    })

    console.log(_tags)
  })
})
