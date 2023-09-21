import child_process from 'node:child_process'
import path from 'node:path'
import os from 'node:os'
import fs from 'node:fs/promises'

import {TAnnotatedTag, TTowerOpts} from './interface'

export const tempy = async () =>
  fs.mkdtemp(path.join(os.tmpdir(), 'tempy-tagtower-'))

const _temp = await tempy()

export const exec = (cmd: string, args?: string[], opts?: any): Promise<{stdout: string, stderr: string, code?: number | null, duration: number}> => new Promise((resolve, reject) => {
  const now = Date.now()
  const p = child_process.spawn(cmd, args, opts)
  let stdout = ''
  let stderr = ''

  p.stdout.on('data', (data) => {
    stdout += data.toString()
  })

  p.stderr.on('data', (data) => {
    stderr += data.toString()
  })

  p.on('close', (code) => {
    resolve({
      code,
      stdout,
      stderr,
      duration: Date.now() - now
    })
  })
})

const getCwd = async ({url, branch = 'tagtower', temp}: TTowerOpts) => {
  const base = temp || await tempy()
  const id = `${url.replaceAll(/[@\/.:]/g, '-')}-${branch}`
  const cwd = path.resolve(base, id)

  try {
    await fs.access(cwd)
  } catch {
    await fs.mkdir(cwd, { recursive: true })
    await clone(url, branch, cwd)
  }

  return cwd
}

export const clone = async (url: string, branch = 'tagtower', _cwd?: string) => {
  const cwd = _cwd || _temp
  const opts = {cwd}
  const remote = await exec('git', ['clone', '-b', branch, '--depth', '1', url, '.'], opts)

  if (remote.code === 128) {
    await exec('git', ['init'], opts)
    await exec('git', ['remote', 'add', 'origin', url], opts)
    await exec('git', ['commit', '--allow-empty', '-m', 'init tagtower'], opts)
    await exec('git', ['push', 'origin', `HEAD:${branch}`], opts)
  }
}

export const readTags = async (opts: TTowerOpts) => {
  const cwd = await getCwd(opts)
  await exec('git', ['fetch', 'origin', 'refs/tags/*:refs/tags/*'], {cwd})

  const raw = await exec('git', ['log', '--decorate-refs=refs/tags/*','--no-walk', '--tags', '--pretty=%D+++%B---', '--decorate=full'], {cwd})

  return raw.stdout.trim().split('---').slice(0, -1).map(e => {
    const [ref, body] = e.split('+++')

    return {
      tag: ref.slice(ref.lastIndexOf('/') + 1),
      body
    }
  })
}

export const pushTags = async (opts: TTowerOpts & {tags: TAnnotatedTag[]}) => {
  const cwd = await getCwd(opts)

  // const {stdout} = await exec('git', ['rev-parse', 'HEAD'], opts)
  // return stdout.trim()
  const errors: string[] = []
  await Promise.all(opts.tags.map(async ({tag, body}) => {
    const result = await exec('git', ['tag', '-a', tag, '-m', body], {cwd})

    if (result.code !== 0) {
      errors.push(result.stderr.trim())
    }
  }))

  if (errors.length) {
    console.warn(errors.join('\n'))
  }

  await exec('git', ['push', '--tags'], {cwd})
}
