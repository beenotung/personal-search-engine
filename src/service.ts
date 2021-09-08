import { Userscript, DB } from './models'
import { db } from './db'
import { parseQueryExpr, QueryExpr } from './parse'
import debug from 'debug'
import { inspect } from 'util'
const log = debug('search-engine:server.ts')
log.enabled = true

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

type QueryPart = {
  sql: string
  bindings: string[]
}
function combineQueryPart(a: QueryPart, b: QueryPart): QueryPart {
  return {
    sql: a.sql + ' ' + b.sql,
    bindings: [...a.bindings, ...b.bindings],
  }
}
function queryExprToPart(expr: QueryExpr): QueryPart {
  switch (expr.type) {
    case 'word': {
      const keyword: string = expr.value
      const sql = `title like ? or text like ?`
      const binding = `%${keyword}%`
      const bindings = [binding, binding]
      return { sql, bindings }
    }
    case 'symbol': {
      throw new Error(
        `invalid query, encountered not parsed symbol ${JSON.stringify(
          expr.value,
        )}`,
      )
    }
    case 'and': {
      const left = queryExprToPart(expr.value.left)
      const right = queryExprToPart(expr.value.right)
      return {
        sql: `(${left.sql}) and (${right.sql})`,
        bindings: [...left.bindings, ...right.bindings],
      }
    }
    case 'or': {
      const left = queryExprToPart(expr.value.left)
      const right = queryExprToPart(expr.value.right)
      return {
        sql: `(${left.sql}) or (${right.sql})`,
        bindings: [...left.bindings, ...right.bindings],
      }
    }
    case 'not': {
      const part = queryExprToPart(expr.value)
      return {
        sql: `not (${part.sql})`,
        bindings: part.bindings,
      }
    }
    default: {
      const x: never = expr
      throw new Error(
        `unknown query expression: ${JSON.stringify((x as QueryExpr).type)}`,
      )
    }
  }
}
export function searchPage(keywords: string) {
  keywords = keywords.trim()
  log('[searchPage] keywords:', keywords)

  let rootPart: QueryPart = {
    sql: `select id, url, title from page`,
    bindings: [],
  }
  if (keywords.length > 0) {
    const queryExpr = parseQueryExpr(keywords)
    log('[searchPage] query expression:', inspect(queryExpr, { depth: 20 }))
    const queryPart = queryExprToPart(queryExpr)
    queryPart.sql = `where not (url glob 'http://localhost:8090/*' or url glob 'http://127\.0\.0\.1:8090/*') and (${queryPart.sql})`
    rootPart = combineQueryPart(rootPart, queryPart)
  }
  rootPart.sql += ` order by timestamp desc`
  return db.prepare(rootPart.sql).all(...rootPart.bindings)
}

export let deletePages = (page_id_list: string[]) => {
  page_id_list.forEach(page_id => {
    const selector = { page_id }
    delete_page_meta.run(selector)
    delete_page.run(selector)
  })
}
deletePages = db.transaction(deletePages)
