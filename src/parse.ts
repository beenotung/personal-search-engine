/**
 * EBNF:
 *
 * char = letter | digit | chinese
 * word = char, { char }
 * not_word_expr = [ "-" ] , word
 * and_or_expr = { not_word_expr , ( "+" | "," ) } , not_word_expr
 * bracket_expr = "(" , and_or_expr , ")" | and_or_expr
 * not_bracket_expr = [ "-" ] , bracket_expr
 * and_or_bracket_expr = { not_bracket_expr , ( "+" | "," ) } , not_bracket_expr
 * query_expr = and_or_bracket_expr
 */

import { Token, tokenize } from './tokenize'

export type Term =
  | Token
  | { type: 'and'; value: { left: Term; right: Term } }
  | { type: 'or'; value: { left: Term; right: Term } }
  | { type: 'not'; value: Term }

export type QueryExpr = Term

// print more detail default message if running mocha test
function report(object: object) {
  Object.entries(object).forEach(([name, value]) => {
    let label = name + ':'
    if (typeof it === 'undefined') {
      console.debug(label, value)
    } else {
      console.debug('\n' + label)
      console.dir(value, { depth: 10 })
    }
  })
}

export function parseQueryExpr(keywords: string): QueryExpr {
  const tokens = tokenize(keywords)
  let result = parse(tokens, 0)
  while (result.idx < tokens.length) {
    let nextResult = parseWithFirst(tokens, result.idx, result.value)
    if (nextResult.idx === result.idx) {
      report({
        keywords,
        tokens,
        'parse result': result,
        rest: tokens.slice(result.idx),
      })
      throw new Error('not fully parsed token stream')
    }
    result = nextResult
  }
  return result.value
}

type ParseResult = {
  idx: number
  value: QueryExpr
}

function parse(tokens: Token[], idx: number): ParseResult {
  let first = tokens[idx]
  if (idx + 1 < tokens.length) {
    return parseWithFirst(tokens, idx + 1, first)
  }
  if (first.type === 'word') {
    return {
      idx: idx + 1,
      value: first,
    }
  }
  report({ tokens, first })
  throw new Error(`unexpected token: ${JSON.stringify(first)}`)
}

/* parse bracket */
function parseWithFirst(
  tokens: Token[],
  nextIdx: number,
  first: QueryExpr,
): ParseResult {
  if (first.type === 'symbol' && first.value === '(') {
    let second = parse(tokens, nextIdx)
    let third = tokens[second.idx]
    if (!third || third.type !== 'symbol' || third.value !== ')') {
      report({
        tokens,
        first,
        second,
        third,
      })
      throw new Error(`missing ')' in "bracket expression"`)
    }
    return {
      idx: second.idx + 1,
      value: second.value,
    }
  }
  let second = tokens[nextIdx]
  if (second.type === 'symbol') {
    switch (second.value) {
      case '(': {
        let third = parse(tokens, nextIdx)
        return parseWithSecond(tokens, third.idx, first, third.value)
      }
      case ')':
        return { idx: nextIdx, value: first }
    }
  }
  return parseWithSecond(tokens, nextIdx + 1, first, second)
}

function parseNot(
  tokens: Token[],
  nextIdx: number,
  first: QueryExpr,
): ParseResult {
  if (first.type === 'symbol' && first.value === '-') {
    return parse(tokens, nextIdx)
  }
  return { idx: nextIdx, value: { type: 'not', value: first } }
}

function parseWithSecond(
  tokens: Token[],
  nextIdx: number,
  first: QueryExpr,
  second: QueryExpr,
): ParseResult {
  if (first.type === 'symbol' && first.value === '-') {
    return parseNot(tokens, nextIdx, second)
  }
  if (second.type === 'symbol') {
    switch (second.value) {
      case '-': {
        let third = parseWord(tokens, nextIdx)
        return {
          idx: third.idx,
          value: {
            type: 'and',
            value: { left: first, right: { type: 'not', value: third.value } },
          },
        }
      }
      case '+': {
        let third = parseWord(tokens, nextIdx)
        return {
          idx: third.idx,
          value: {
            type: 'and',
            value: { left: first, right: third.value },
          },
        }
      }
      case ',': {
        let third = parseWord(tokens, nextIdx)
        return {
          idx: third.idx,
          value: {
            type: 'or',
            value: { left: first, right: third.value },
          },
        }
      }
    }
  }
  report({ tokens, first, second })
  throw new Error(`unexpected token: ${JSON.stringify(first)}`)
}

function parseWord(tokens: Token[], nextIdx: number): ParseResult {
  let first = tokens[nextIdx]
  if (first.type == 'word') {
    return { idx: nextIdx + 1, value: first }
  }
  return parse(tokens, nextIdx)
}

export function test() {
  let samples = [
    'a',
    '-a',
    'a+b',
    'a,b',
    'a+-b',
    'a-b',
    '(a)',
    'a+(b,c)',
    '(a+b),c',
    'a+(b+c)+d',
    'typescript+(angular,(react-redux))',
    'a+b,c',
    '((a))',
    '--a',
  ]
  for (let input of samples) {
    report({ input })
    let expr = parseQueryExpr(input)
    report({ expr })
  }
}

if (typeof process !== 'undefined' && process.argv[1] === __filename) {
  test()
}
