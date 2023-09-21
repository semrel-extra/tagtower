
export type TTagEntry = Record<string, any>

export type TTower = {
  create(id: string, entry: TTagEntry): Promise<void>
  read(id: string): Promise<TTagEntry|null>
  read(): Promise<TTagEntry[]>
  update(id: string, entry: TTagEntry): Promise<void>
  delete(id: string): Promise<void>
}

export type TTowerFactory = (opts: TTowerOpts) => TTower

export type TTowerOpts = {url: string, branch?: string, temp?: string}

export type TAnnotatedTag = {
  tag: string
  body: string
}
