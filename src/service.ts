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

export function searchPage(keyword: string) {
  const keywordList = keyword.split(',').map(keyword => keyword.trim())
  let sql = `select id, url, title from page`
  const bindings: string[] = []
  if (keywordList.length > 0) {
    sql += ' where (false'
    keywordList.forEach(keyword => {
      sql += ` or title like ? or text like ?`
      const binding = `%${keyword}%`
      bindings.push(binding)
      bindings.push(binding)
    })
    sql += `) and not (url glob 'http://localhost:8090/*' or url glob 'http://127\.0\.0\.1:8090/*')`
  }
  sql += ` order by timestamp desc`
  return db.prepare(sql).all(...bindings)
}

export let deletePages = (page_id_list: string[]) => {
  page_id_list.forEach(page_id => {
    let selector = { page_id }
    delete_page_meta.run(selector)
    delete_page.run(selector)
  })
}
deletePages = db.transaction(deletePages)
