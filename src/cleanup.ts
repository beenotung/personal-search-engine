import { filterPage } from './controller'
import { db } from './db'

const select_page = db.prepare(`select id, url, title from page`)
const delete_page_meta = db.prepare(`delete from meta where page_id = ?`)
const delete_page = db.prepare(`delete from page where id = ?`)

const update_page_url = db.prepare(`update page set url = :url where id = :id`)

function deletePage(page_id: number) {
  delete_page_meta.run(page_id)
  delete_page.run(page_id)
}

db.connection().unsafeMode(true)

for (const row of select_page.iterate()) {
  const result = filterPage(row)
  if (result === 'skip') {
    console.log('delete page:', row.title)
    deletePage(row.id)
    continue
  }
  if (result === 'change') {
    console.log('update page:', row.url)
    update_page_url.run({ id: row.id, url: row.url })
  }
}

db.connection().unsafeMode(false)
