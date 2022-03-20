import type { QueryExpr } from './parse'

export type QueryPart = {
  sql: string
  bindings: string[]
}

export function combineQueryPart(a: QueryPart, b: QueryPart): QueryPart {
  return {
    sql: a.sql + ' ' + b.sql,
    bindings: [...a.bindings, ...b.bindings],
  }
}

export function queryExprToPart(expr: QueryExpr): QueryPart {
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
