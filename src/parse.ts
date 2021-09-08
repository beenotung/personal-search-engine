/**
 * # EBNF
 *
 * char = letter | digit | chinese
 * word = char , { char }
 * not_expr = [ "-" ] , word
 * and_expr = not_expr , { [ "+" ] , not_expr }
 * or_expr = and_expr , { "," , and_expr }
 * bracket_expr = "(" , bracket_expr , ")" | or_expr
 * not_bracket_expr = [ "-" ] , bracket_expr
 * bracket_and_expr = not_bracket_expr , { "+" , not_bracket_expr }
 * bracket_or_expr = bracket_and_expr , { "," , bracket_and_expr }
 * query_expr = bracket_or_expr
 */

export function parseQueryExpr(keywords: string) {
  type ParseItem = Token | QueryExpr
  const tokens: ParseItem[] = tokenize(keywords)

  // not_expr
  for (let i = 1; i < tokens.length; i++) {
    const left = tokens[i - 1]
    let token = tokens[i]
    if (left.value === '-' && token.type === 'word') {
      token = { type: 'not', value: token }
      tokens.splice(i - 1, 2, token)
      i -= 1
    }
  }

  // and_expr
  for (let i = 1; i < tokens.length; i++) {
    const left = tokens[i - 1]
    let token = tokens[i]
    const right = tokens[i + 1]
    if (
      right &&
      token.value === '+' &&
      left.type !== 'symbol' &&
      right.type !== 'symbol'
    ) {
      token = { type: 'and', value: { left, right } }
      tokens.splice(i - 1, 3, token)
      i -= 1
    } else if (token.type === 'not' && left.type !== 'symbol') {
      token = { type: 'and', value: { left, right: token } }
      tokens.splice(i - 1, 2, token)
      i -= 1
    }
  }

  // or_expr
  for (let i = 1; i < tokens.length - 1; i++) {
    const left = tokens[i - 1]
    let token = tokens[i]
    const right = tokens[i + 1]
    if (
      token.value === ',' &&
      left.type !== 'symbol' &&
      right.type !== 'symbol'
    ) {
      token = { type: 'or', value: { left, right } }
      tokens.splice(i - 1, 3, token)
      i -= 1
    }
  }

  // bracket_expr
  for (let i = 1; i < tokens.length - 1; i++) {
    const left = tokens[i - 1]
    const token = tokens[i]
    const right = tokens[i + 1]
    if (left.value === '(' && right.value === ')') {
      tokens.splice(i - 1, 3, token)
      i -= 1
    }
  }

  // not_bracket_expr
  for (let i = 1; i < tokens.length; i++) {
    const left = tokens[i - 1]
    let token = tokens[i]
    if (left.value === '-' && token.type !== 'symbol') {
      token = { type: 'not', value: token }
      tokens.splice(i - 1, 2, token)
      i -= 1
    }
  }

  // bracket_and_expr
  for (let i = 1; i < tokens.length - 1; i++) {
    const left = tokens[i - 1]
    let token = tokens[i]
    const right = tokens[i + 1]
    if (token.value === '+') {
      token = { type: 'and', value: { left, right } }
      tokens.splice(i - 1, 3, token)
      i -= 1
    }
  }

  // bracket_or_expr
  for (let i = 1; i < tokens.length - 1; i++) {
    const left = tokens[i - 1]
    let token = tokens[i]
    const right = tokens[i + 1]
    if (token.value === ',') {
      token = { type: 'or', value: { left, right } }
      tokens.splice(i - 1, 3, token)
      i -= 1
    }
  }

  if (tokens.length !== 1) {
    console.error('expect 1 token, got ' + tokens.length)
    console.error('tokens:', tokens)
    console.error('keywords:', keywords)
    throw new Error('not fully parsed token stream')
  }
  return tokens[0]
}

const symbol_list = `+,()-`.split('')

export type Word = { type: 'word'; value: string }
export type Symbol = { type: 'symbol'; value: string }
export type Token = Word | Symbol

export function tokenize(keywords: string): Token[] {
  let tokens: Token[] = [{ type: 'word', value: keywords }]
  symbol_list.forEach(symbol => {
    const acc: Token[] = []
    tokens.forEach(token => {
      if (token.type === 'symbol') {
        acc.push(token)
        return
      }
      token.value
        .split(symbol)
        .forEach(word =>
          acc.push(
            { type: 'word', value: word },
            { type: 'symbol', value: symbol },
          ),
        )
      acc.pop()
    })
    tokens = acc
  })
  return tokens.filter(token => {
    token.value = token.value.trim()
    return token.value.length > 0
  })
}

export type Term =
  | Token
  | { type: 'and'; value: { left: Term; right: Term } }
  | { type: 'or'; value: { left: Term; right: Term } }
  | { type: 'not'; value: Term }

export type QueryExpr = Term
