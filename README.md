# tagtower
> Tag driven git meta

## Motivation
It does not seem possible [to get commits info w/o repo cloning](https://stackoverflow.com/questions/20055398/is-it-possible-to-get-commit-logs-messages-of-a-remote-git-repo-without-git-clon). This limitation brings a significant performance impact on conventional-commits driven release flows (especially if [git notes](https://git-scm.com/docs/git-notes) API is not supported by VSC). But what if we'd have a side index with web-hooks triggers instead. Let's find out.

## Usage
```ts
import {create, read, readAll, update, del} from 'tagtower'

const tag = {
  hash: '3f9f0a88b411a8932bce289a3dd498d70a4dc96c',
  author: 'Anton Golub <antongolub@antongolub.com>',
  message: `feat: initial feat`
}

await create('some-tag', tag) // void
await read('some-tag')        // tag | null
await readAll()               // [tag]
await del('some-tag')         // void
```

## License
[MIT](./LICENSE)
