export namespace DB {
  export type Page = {
    id?: number
    url: string
    title: string
    text: string
    timestamp: number
  }

  export type Meta = {
    id?: number
    page_id: number
    type: string
    key: string
    content: string
  }
}

export namespace Userscript {
  export type Page = {
    url: string
    title: string
    text: string
    meta_list: Meta[]
  }
  export type Meta = {
    type: string
    key: string
    value: string
  }
}
