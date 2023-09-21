# tagtower
> Tag-driven git index

## Motivation
It does not seem possible [to get commits info w/o repo cloning](https://stackoverflow.com/questions/20055398/is-it-possible-to-get-commit-logs-messages-of-a-remote-git-repo-without-git-clon). This limitation brings a significant performance impact on conventional-commits driven release flows (especially if [git notes](https://git-scm.com/docs/git-notes) API is not supported by VCS). But what if we'd have a side index with web-hooks triggers instead. Let's find out.

## Usage
```ts
import {createTower} from 'tagtower'

const tower = createTower({
  url: 'https://<token>github.com/git/repo.git',
  branch: 'tagtower'
})

const tag: string = 'some@tag'
const entry: Record<string, any> = {
  hash: '3f9f0a88b411a8932bce289a3dd498d70a4dc96c',
  author: 'Anton Golub <antongolub@antongolub.com>',
  message: `feat: initial feat`
}

await tower.create(tag, entry)  // stores entry to the specified remote
await tower.read(tag)           // returns found TEntry | null
await tower.read()              // if tag is empty, returns TEntry[]
await tower.update(tag, entry)  // just a shortcut for delete & create
await tower.delete(tag)         // void
```

## License
[MIT](./LICENSE)
