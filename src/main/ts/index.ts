import {readTags, deleteTag, pushTags} from './git'
import {TFilter, TTagEntry, TTower, TTowerFactory, TTowerOpts} from './interface'

export const createTower: TTowerFactory = (opts: TTowerOpts): TTower => ({
  async create(tag, data){
    const formatter = opts.format || format
    await pushTags({...opts, tags: [{tag, body: formatter(data)}]})
  },
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  async read(id?: string | TFilter) {
    const parser = opts.parse || parse
    const predicate = typeof id === 'function' ? id : (opts.filter || filter)
    const entries: TTagEntry[] = (await readTags(opts))
      .filter(predicate)
      .map(({tag: id, body}) => ({id, data: parser(body)}))

    if (typeof id === 'string') {
      return entries.find(({id: _id}) => _id === id) || null
    }

    return entries
  },
  async delete(tag) {
    await deleteTag({...opts, tag})
  },
  async update(id, data) {
    await this.delete(id)
    await this.create(id, data)
  }
})

const filter = () => true
const format = JSON.stringify
const parse = (value: any): TTagEntry['data'] => {
  try {
    return JSON.parse(value.trim())
  } catch {
    return {value}
  }
}

export * from './interface'
