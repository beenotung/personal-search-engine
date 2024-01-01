import { db } from '../src/db'

type Row = {
  id: number
  url: string
}
let select = db.prepare(/* sql */ `
select id, url
from page
where url like '%\\%%' escape '\\'
`)

let update = db.prepare(/* sql */ `
update page
set url = :url
where id = :id
`)

let rows = select.all() as Row[]
for (let row of rows) {
  update.run({
    id: row.id,
    url: decodeURI(row.url),
  })
}
