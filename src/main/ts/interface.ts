
export type TTagEntry = {
  id: string,
  data: any
}

export type TFilter = (v: {tag: string, body: string}) => boolean

export type TTower = {
  create(id: string, data: TTagEntry['data']): Promise<void>
  read(id: string): Promise<TTagEntry | null>
  read(fn?: TFilter): Promise<TTagEntry[]>
  update(id: string, data: TTagEntry['data']): Promise<void>
  delete(id: string): Promise<void>
}

export type TTowerFactory = (opts: TTowerOpts) => TTower

export type TTowerOpts = {
  url: string
  branch?: string
  temp?: string
  committerName?: string
  committerEmail?: string
  parse?: (v: string) => any
  format?: (v: any) => string
  filter?: TFilter
}

export type TAnnotatedTag = {
  tag: string
  body: string
}
