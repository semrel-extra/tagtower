import child_process from 'node:child_process'
import path from 'node:path'
import os from 'node:os'
import fs from 'node:fs/promises'
import process from 'node:process'

import {TAnnotatedTag, TTowerOpts} from './interface'

export const tempy = async () =>
  fs.mkdtemp(path.join(os.tmpdir(), 'tempy-tagtower-'))

const _temp = tempy()

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
    const result = {
      cmd,
      args,
      code,
      stdout,
      stderr,
      duration: Date.now() - now
    }

    resolve(result)
    process.env.DEBUG && console.log(result)
  })
})

const getCwd = async ({
  url,
  branch = 'tagtower',
  temp,
  committerName = process.env.GIT_COMMITTER_NAME || 'Semrel Extra Bot',
  committerEmail = process.env.GIT_COMMITTER_EMAIL || 'semrel-extra-bot@hotmail.com'
}: TTowerOpts) => {
  const base = temp || await _temp
  const id = `${url.replaceAll(/[./:@]/g, '-')}-${branch}`.toLowerCase()
  const cwd = path.resolve(base, id)

  try {
    await fs.access(cwd)
  } catch {
    await fs.mkdir(cwd, { recursive: true })
    await clone({url, branch, cwd, committerName, committerEmail})
  }

  return cwd
}

export const clone = async ({url, branch, cwd, committerName, committerEmail}: {url: string, branch: string, cwd: string, committerName: string, committerEmail: string}) => {
  const opts = {cwd}
  // https://github.blog/2020-12-21-get-up-to-speed-with-partial-clone-and-shallow-clone/
  const remote = await exec('git', [
    'clone',
    '--no-tags',
    '--no-remote-submodules',
    '--sparse',
    '--single-branch',
    '-b', branch,
    '--depth', '1',
    url, '.'
  ], opts)

  if (remote.code === 128) {
    await exec('git', ['init'], opts)
    await exec('git', ['remote', 'add', 'origin', url], opts)
    await setUserConfig(cwd, committerName, committerEmail)
    await exec('git', ['commit', '--allow-empty', '-m', `init ${branch}`], opts)
    await exec('git', ['push', 'origin', `HEAD:${branch}`], opts)
  } else {
    await setUserConfig(cwd, committerName, committerEmail)
  }
}

export const readTags = async (opts: TTowerOpts): Promise<TAnnotatedTag[]> => {
  const cwd = await getCwd(opts)
  await exec('git', ['fetch', 'origin', 'refs/tags/*:refs/tags/*'], {cwd})

  // const raw = await exec('git', ['log', '--decorate-refs=refs/tags/*','--no-walk', '--tags', '--pretty=%D+++format=%(contents)---', '--decorate=full'], {cwd})
  const raw = await exec('git', ['tag', '-l', '--format=%(refname)+++%(contents)---'], {cwd})
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
  const errors: string[] = []
  await Promise.all(opts.tags.map(async ({tag, body}) => {
    const result = await exec('git', ['tag', '-a', tag, '-m', body], {cwd})

    if (result.code !== 0) {
      errors.push(result.stderr.trim())
    }
  }))

  if (errors.length > 0) {
    console.warn(errors.join('\n'))
  }

  if (opts.tags.length > 1) {
    await exec('git', ['push', 'origin', '--tags'], {cwd})
    return
  }

  await exec('git', ['push', 'origin', opts.tags[0].tag], {cwd})
}

export const deleteTag = async (opts: TTowerOpts & {tag: string}) => {
  const cwd = await getCwd(opts)
  return Promise.all([
    exec('git', ['push', '--delete', 'origin', opts.tag], {cwd}),
    exec('git', ['tag', '--delete', opts.tag], {cwd})
  ])
}

const setUserConfig = async (cwd: string, committerName: string, committerEmail: string) => {
  await exec('git', ['config', 'user.name', committerName], {cwd})
  await exec('git', ['config', 'user.email', committerEmail], {cwd})
}
