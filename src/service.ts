import { Raw, DB } from './models'
import { db } from './db'

let select_page_id = db.prepare(`select id as page_id from page where url = ?`)
let delete_page_meta = db.prepare(`delete from meta where page_id = :page_id`)
let delete_page = db.prepare(`delete from page where id = :page_id`)

function deletePage(url: string) {
  let row = select_page_id.get(url)
  if (!row) return
  delete_page_meta.run(row)
  delete_page.run(row)
}

function insertPage(page: Raw.Page) {
  let pageRow: DB.Page = {
    url: page.url,
    title: page.title,
    text: page.text,
    timestamp: Date.now(),
  }
  let page_id = db.insert('page', pageRow)
  page.meta_list.forEach(meta => {
    let metaRow: DB.Meta = {
      page_id,
      type: meta.type,
      key: meta.key,
      content: meta.value,
    }
    db.insert('meta', metaRow)
  })
}

export let storePage = db.transaction((page: Raw.Page) => {
  deletePage(page.url)
  insertPage(page)
})
