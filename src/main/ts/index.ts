import {readTags, deleteTag, pushTags} from './git'
import {TTagEntry, TTower, TTowerFactory, TTowerOpts} from './interface'

export const createTower: TTowerFactory = (opts: TTowerOpts): TTower => ({
  async create(tag, data){
    const formatter = opts.format || format
    await pushTags({...opts, tags: [{tag, body: formatter(data)}]})
  },
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  async read(id?: string) {
    const parser = opts.parse || parse
    const entries: TTagEntry[] = (await readTags(opts)).map(({tag: id, body}) => ({id, data: parser(body)}))
    if (id === undefined) {
      return entries
    }

    return entries.find(({id: _id}) => _id === id) || null
  },
  async delete(tag) {
    await deleteTag({...opts, tag})
  },
  async update(id, data) {
    await this.delete(id)
    await this.create(id, data)
  }
})

const format = JSON.stringify
const parse = (value: any): TTagEntry['data'] => {
  try {
    return JSON.parse(value.trim())
  } catch {
    return {value}
  }
}

export * from './interface'
