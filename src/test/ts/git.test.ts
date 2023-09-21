import * as assert from 'node:assert'
import { describe, it } from 'node:test'
import path from 'node:path'
import process from 'node:process'
import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import {exec, readTags, pushTags, delTag} from '../../main/ts/git'

const temp = path.resolve(process.cwd(), 'temp')

describe('git', () => {
  it('exec', async () => {
    const {stdout, code, stderr} = await exec('echo', ['foo'])

    assert.equal(stdout, 'foo\n')
    assert.equal(stderr, '')
    assert.equal(code, 0)
  })

  it('readTags', async () => {
    const tags = await readTags({
      url: 'https://github.com/antongolub/tsc-esm-fix.git',
      branch: 'master',
      temp
    })

    assert.ok(tags.some(({tag, body}) =>
      tag === 'v1.0.0' &&
      body.includes('chore(release): 1.0.0 [skip ci]\n')
    ))
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

  it('pushTags-readTags-delTag avalanche', async () => {
    const cwd = path.resolve(temp, 'local-repo')
    await fs.mkdir(cwd, { recursive: true })
    await exec('git', ['init', '--bare'], {cwd})

    const url = cwd
    const l = 100 // TODO optimize spawn seed to scale up to 100_000 tags
    const tags = Array.from({length: l}).map(() => ({
      tag: `test@${Math.random().toString(36).slice(2)}`,
      body: crypto.randomBytes(300).toString('hex')
    }))

    await pushTags({
      url,
      branch: 'testtower',
      temp,
      tags
    })

    const _tags = await readTags({
      url,
      branch: 'testtower',
      temp,
    })

    await delTag({
      url,
      branch: 'testtower',
      temp,
      tag: tags[0].tag
    })
  })
})
