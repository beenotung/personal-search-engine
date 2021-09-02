import { Userscript, DB } from './models'
import { db } from './db'

const select_page_id = db.prepare(
  `select id as page_id from page where url = ?`,
)
const delete_page_meta = db.prepare(`delete from meta where page_id = :page_id`)
const delete_page = db.prepare(`delete from page where id = :page_id`)

function deletePage(url: string) {
  const row = select_page_id.get(url)
  if (!row) return
  delete_page_meta.run(row)
  delete_page.run(row)
}

function insertPage(page: Userscript.Page) {
  const pageRow: DB.Page = {
    url: page.url,
    title: page.title,
    text: page.text,
    timestamp: Date.now(),
  }
  const page_id = db.insert('page', pageRow)
  page.meta_list.forEach(meta => {
    const metaRow: DB.Meta = {
      page_id,
      type: meta.type,
      key: meta.key,
      content: meta.value,
    }
    db.insert('meta', metaRow)
  })
}

export let storePage = (page: Userscript.Page) => {
  deletePage(page.url)
  insertPage(page)
}
storePage = db.transaction(storePage)

const select_page_count = db.prepare(`select count(*) as count from page`)

export function getPageCount() {
  return select_page_count.get().count
}
