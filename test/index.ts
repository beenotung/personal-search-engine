import { parseQueryExpr } from '../src/parse'
import { queryExprToPart } from '../src/query-builder'

console.dir(queryExprToPart(parseQueryExpr('a+b+c')), { depth: 20 })
