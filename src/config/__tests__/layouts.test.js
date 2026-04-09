import { describe, test, expect } from '@jest/globals'
import { toRgba, toTransparentRgba } from '../layouts.js'

describe('toRgba', () => {
  test('converts rgb() to rgba() with opacity', () => {
    expect(toRgba('rgb(255, 0, 0)', 50)).toBe('rgba(255, 0, 0, 0.5)')
  })

  test('converts rgb() with full opacity', () => {
    expect(toRgba('rgb(0, 128, 255)', 100)).toBe('rgba(0, 128, 255, 1)')
  })

  test('converts rgb() with zero opacity', () => {
    expect(toRgba('rgb(0, 0, 0)', 0)).toBe('rgba(0, 0, 0, 0)')
  })

  test('handles rgba() input — strips existing alpha', () => {
    expect(toRgba('rgba(100, 200, 50, 0.8)', 25)).toBe('rgba(100, 200, 50, 0.25)')
  })

  test('handles rgb() without spaces', () => {
    expect(toRgba('rgb(10,20,30)', 75)).toBe('rgba(10, 20, 30, 0.75)')
  })

  test('returns original string for non-rgb input', () => {
    expect(toRgba('#ff0000', 50)).toBe('#ff0000')
  })

  test('returns original string for empty input', () => {
    expect(toRgba('', 50)).toBe('')
  })

  test('returns original string for named color', () => {
    expect(toRgba('red', 50)).toBe('red')
  })
})

describe('toTransparentRgba', () => {
  test('converts to fully transparent', () => {
    expect(toTransparentRgba('rgb(255, 0, 0)')).toBe('rgba(255, 0, 0, 0)')
  })

  test('passes through non-rgb input', () => {
    expect(toTransparentRgba('#000')).toBe('#000')
  })
})
