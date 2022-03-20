import { expect } from 'chai'
import { parseQueryExpr } from './parse'

describe('parse.ts TestSuit', () => {
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
        type: 'and',
        value: {
          left: {
            type: 'or',
            value: {
              left: { type: 'word', value: 'apple' },
              right: { type: 'word', value: 'tree' },
            },
          },
          right: { type: 'word', value: 'pie' },
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
    it('should parse extra "bracket expression"', () => {
      expect(parseQueryExpr('(lisp)')).deep.equals({
        type: 'word',
        value: 'lisp',
      })
      expect(parseQueryExpr('((lisp))')).deep.equals({
        type: 'word',
        value: 'lisp',
      })
    })
    it('should parse nested "bracket expression"', () => {
      expect(parseQueryExpr('typescript+(angular,(react-redux))')).deep.equals({
        type: 'and',
        value: {
          left: { type: 'word', value: 'typescript' },
          right: {
            type: 'or',
            value: {
              left: { type: 'word', value: 'angular' },
              right: {
                type: 'and',
                value: {
                  left: { type: 'word', value: 'react' },
                  right: {
                    type: 'not',
                    value: { type: 'word', value: 'redux' },
                  },
                },
              },
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
    it('should parse double "not expression"', () => {
      expect(parseQueryExpr('--react')).deep.equals({
        type: 'word',
        value: 'react',
      })
    })
    it('should parse triple "not expression"', () => {
      expect(parseQueryExpr('---react')).deep.equals({
        type: 'not',
        value: { type: 'word', value: 'react' },
      })
    })
    it('should parse quadruple "not expression"', () => {
      expect(parseQueryExpr('----react')).deep.equals({
        type: 'word',
        value: 'react',
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
    it('should parse "not expression" after "bracket expression"', () => {
      expect(parseQueryExpr('typescript+react-google search')).deep.equals({
        type: 'and',
        value: {
          left: {
            type: 'and',
            value: {
              left: { type: 'word', value: 'typescript' },
              right: { type: 'word', value: 'react' },
            },
          },
          right: {
            type: 'not',
            value: { type: 'word', value: 'google search' },
          },
        },
      })
      expect(
        parseQueryExpr('typescript+(angular,react)-google search'),
      ).deep.equals({
        type: 'and',
        value: {
          left: {
            type: 'and',
            value: {
              left: { type: 'word', value: 'typescript' },
              right: {
                type: 'or',
                value: {
                  left: { type: 'word', value: 'angular' },
                  right: { type: 'word', value: 'react' },
                },
              },
            },
          },
          right: {
            type: 'not',
            value: { type: 'word', value: 'google search' },
          },
        },
      })
    })
  })
})
