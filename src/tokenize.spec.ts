import { expect } from 'chai'
import { Token, tokenize } from './tokenize'

describe('tokenize.ts TestSuit', () => {
  context('tokenize()', () => {
    function toValue(token: Token) {
      return token.value
    }
    function test(keywords: string, expected: string[]) {
      expect(tokenize(keywords).map(toValue)).deep.equals(expected)
    }
    it('should tokenize word', () => {
      test('apple', ['apple'])
    })
    it('should tokenize word with space', () => {
      test('apple tree', ['apple tree'])
    })
    it('should tokenize "and expression"', () => {
      test('apple + tree', ['apple', '+', 'tree'])
    })
    it('should tokenize "or expression"', () => {
      test('apple , tree', ['apple', ',', 'tree'])
    })
    it('should tokenize "or expression" and "and expression"', () => {
      test('a , b + c', `a,b+c`.split(''))
    })
    it('should tokenize "bracket expression"', () => {
      test('( a , b ) + c', `(a,b)+c`.split(''))
    })
    it('should parse "not expression', () => {
      test('react + typescript - redux', [
        'react',
        '+',
        'typescript',
        '-',
        'redux',
      ])
    })
  })
})
