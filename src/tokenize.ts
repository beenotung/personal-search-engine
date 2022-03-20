export type Word = { type: 'word'; value: string }
export type Symbol = { type: 'symbol'; value: string }
export type Token = Word | Symbol

const symbol_list = `+,()-`.split('')

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
