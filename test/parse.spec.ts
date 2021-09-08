import { expect } from 'chai'
import { parseQueryExpr, Token, tokenize } from '../src/parse'

describe('parse spec', () => {
  function toValue(token: Token) {
    return token.value
  }

  context('tokenize()', () => {
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

  context('parseQueryExpr()', () => {
    it('should parse "word expression"', () => {
      expect(parseQueryExpr('apple')).deep.equals({
        type: 'word',
        value: 'apple',
      })
    })
    it('should parse "and expression"', () => {
      expect(parseQueryExpr('apple+tree')).deep.equals({
        type: 'and',
        value: {
          left: { type: 'word', value: 'apple' },
          right: { type: 'word', value: 'tree' },
        },
      })
    })
    it('should parse "or expression"', () => {
      expect(parseQueryExpr('apple,tree')).deep.equals({
        type: 'or',
        value: {
          left: { type: 'word', value: 'apple' },
          right: { type: 'word', value: 'tree' },
        },
      })
    })
    it('should parse "or expression" and "and expression"', () => {
      expect(parseQueryExpr('apple+tree,pie')).deep.equals({
        type: 'or',
        value: {
          left: {
            type: 'and',
            value: {
              left: { type: 'word', value: 'apple' },
              right: { type: 'word', value: 'tree' },
            },
          },
          right: { type: 'word', value: 'pie' },
        },
      })
      expect(parseQueryExpr('apple,tree+pie')).deep.equals({
        type: 'or',
        value: {
          left: { type: 'word', value: 'apple' },
          right: {
            type: 'and',
            value: {
              left: { type: 'word', value: 'tree' },
              right: { type: 'word', value: 'pie' },
            },
          },
        },
      })
    })
    it('should parse "bracket expression"', () => {
      expect(parseQueryExpr('apple+(tree,pie)')).deep.equals({
        type: 'and',
        value: {
          left: { type: 'word', value: 'apple' },
          right: {
            type: 'or',
            value: {
              left: { type: 'word', value: 'tree' },
              right: { type: 'word', value: 'pie' },
            },
          },
        },
      })
      expect(parseQueryExpr('apple,(tree+pie)')).deep.equals({
        type: 'or',
        value: {
          left: { type: 'word', value: 'apple' },
          right: {
            type: 'and',
            value: {
              left: { type: 'word', value: 'tree' },
              right: { type: 'word', value: 'pie' },
            },
          },
        },
      })
    })
    it('should parse "not expression"', () => {
      expect(parseQueryExpr('-react')).deep.equals({
        type: 'not',
        value: { type: 'word', value: 'react' },
      })
    })
    it('should parse "not expression" and "and expression"', () => {
      expect(parseQueryExpr('-react+typescript')).deep.equals({
        type: 'and',
        value: {
          left: { type: 'not', value: { type: 'word', value: 'react' } },
          right: { type: 'word', value: 'typescript' },
        },
      })
      expect(parseQueryExpr('typescript-react')).deep.equals({
        type: 'and',
        value: {
          left: { type: 'word', value: 'typescript' },
          right: { type: 'not', value: { type: 'word', value: 'react' } },
        },
      })
    })
    it('should parse "not expression" and "or expression"', () => {
      expect(parseQueryExpr('-react,typescript')).deep.equals({
        type: 'or',
        value: {
          left: { type: 'not', value: { type: 'word', value: 'react' } },
          right: { type: 'word', value: 'typescript' },
        },
      })
      expect(parseQueryExpr('typescript,-react')).deep.equals({
        type: 'or',
        value: {
          left: { type: 'word', value: 'typescript' },
          right: { type: 'not', value: { type: 'word', value: 'react' } },
        },
      })
    })
    it('should parse "not expression" on "and expression" in "bracket expression"', () => {
      expect(parseQueryExpr('-(react+typescript)')).deep.equals({
        type: 'not',
        value: {
          type: 'and',
          value: {
            left: { type: 'word', value: 'react' },
            right: { type: 'word', value: 'typescript' },
          },
        },
      })
    })
    it('should parse "not expression" on "or expression" in "bracket expression"', () => {
      expect(parseQueryExpr('-(react,typescript)')).deep.equals({
        type: 'not',
        value: {
          type: 'or',
          value: {
            left: { type: 'word', value: 'react' },
            right: { type: 'word', value: 'typescript' },
          },
        },
      })
    })
  })
})
