import {readTags, deleteTag, pushTags} from './git'
import {TTower, TTowerFactory, TTowerOpts} from './interface'

export const createTower: TTowerFactory = (opts: TTowerOpts): TTower => ({
  async create(tag, entry){
    await pushTags({...opts, tags: [{tag, body: JSON.stringify(entry)}]})
  },
  async read(tag?: string) {
    const tags = (await readTags(opts)).map(({tag, body}) => ({tag, entry: JSON.parse(body.trim())}))
    if (tag === undefined) {
      return tags
    }

    return tags.find(({tag: _tag}) => _tag === tag)?.entry || null
  },
  async delete(tag) {
    await deleteTag({...opts, tag})
  },
  async update(tag, entry) {
    await this.delete(tag)
    await this.create(tag, entry)
  }
})

export * from './interface'
