# tagtower
[![Maintainability](https://api.codeclimate.com/v1/badges/88b8163c3bc008afafc1/maintainability)](https://codeclimate.com/github/semrel-extra/tagtower/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/88b8163c3bc008afafc1/test_coverage)](https://codeclimate.com/github/semrel-extra/tagtower/test_coverage)
[![npm (tag)](https://img.shields.io/npm/v/tagtower)](https://www.npmjs.com/package/tagtower)

> Tag-driven git index

## Motivation
It does not seem possible [to get commits info w/o repo cloning](https://stackoverflow.com/questions/20055398/is-it-possible-to-get-commit-logs-messages-of-a-remote-git-repo-without-git-clon). This limitation brings a significant performance impact on [conventional-commits](https://www.conventionalcommits.org/en/v1.0.0/) driven release flows (especially if [git notes](https://git-scm.com/docs/git-notes) API is not supported by VCS). But what if we'd have a side index with web-hooks triggers instead. Let's find out.

_— Looks like a kv-storage based on git tags. This is madness._  
_— True._

As a part of «how self-sufficient git is» research.

## Install
```sh
yarn add tagtower
```

## Usage
```ts
import {createTower} from 'tagtower'

const tower = createTower({
  url:            'https://<token>github.com/git/repo.git',
  branch:         'tagtower',     // Branch for storing tags. Defaults to 'tagtower'
  temp:           './temp',       // Dir to hold temporary git channels. Defaults to fs.mkdtemp(path.join(os.tmpdir(), 'tempy-tagtower-'))
  committerName:  'Foo Bar',      // Username and email to sign annotaged git tags
  committerEmail: 'foo@bar.baz',  // Defaults to Semrel Extra Bot <semrel-extra-bot@hotmail.com>
  format:         v => v + '',    // Opt value formatter. Defaults to JSON.stringify
  parse:          v => v,         // Opt parser. Defaults to JSON.parse
  filter:         v => v % 2      // Opt low level filter (applied before parse). Defaults to () => true
})

const id: string = 'some@tag'
const data: Record<string, any> = {
  hash:    '3f9f0a88b411a8932bce289a3dd498d70a4dc96c',
  author:  'Anton Golub <antongolub@antongolub.com>',
  message: 'feat: initial feat'
}

await tower.create(id, data)      // stores entry to the specified remote
await tower.read(id)              // returns found TEntry | null
await tower.read()                // if tag is empty, returns TEntry[]
await tower.update(id, data)      // just a shortcut for delete & create
await tower.delete(id)            // void
```

## License
[MIT](./LICENSE)
