import { describe, test, expect } from '@jest/globals'
import { buildFilterStyle, getAlignItems, getJustifyContent, getFrameDimensions } from '../canvasRenderers.js'

describe('buildFilterStyle', () => {
  test('returns none for null filters', () => {
    expect(buildFilterStyle(null)).toBe('none')
  })

  test('returns none for all-default filters', () => {
    expect(buildFilterStyle({ grayscale: 0, sepia: 0, blur: 0, contrast: 100, brightness: 100 })).toBe('none')
  })

  test('builds grayscale filter', () => {
    expect(buildFilterStyle({ grayscale: 50 })).toBe('grayscale(50%)')
  })

  test('builds compound filter string', () => {
    const result = buildFilterStyle({ grayscale: 100, sepia: 50, blur: 2 })
    expect(result).toContain('grayscale(100%)')
    expect(result).toContain('sepia(50%)')
    expect(result).toContain('blur(2px)')
  })

  test('includes contrast and brightness when not 100', () => {
    const result = buildFilterStyle({ contrast: 120, brightness: 80 })
    expect(result).toContain('contrast(120%)')
    expect(result).toContain('brightness(80%)')
  })
})

describe('getAlignItems', () => {
  test('maps left to flex-start', () => {
    expect(getAlignItems('left')).toBe('flex-start')
  })

  test('maps right to flex-end', () => {
    expect(getAlignItems('right')).toBe('flex-end')
  })

  test('maps center to center', () => {
    expect(getAlignItems('center')).toBe('center')
  })

  test('defaults to center for unknown value', () => {
    expect(getAlignItems('unknown')).toBe('center')
  })
})

describe('getJustifyContent', () => {
  test('maps start to flex-start', () => {
    expect(getJustifyContent('start')).toBe('flex-start')
  })

  test('maps end to flex-end', () => {
    expect(getJustifyContent('end')).toBe('flex-end')
  })

  test('defaults to center', () => {
    expect(getJustifyContent('center')).toBe('center')
    expect(getJustifyContent(undefined)).toBe('center')
  })
})

describe('getFrameDimensions', () => {
  test('calculates frame width and inner padding', () => {
    const result = getFrameDimensions(20, 50)
    expect(result.frameWidth).toBe(10)
    expect(result.innerPadding).toBe(10)
  })

  test('returns zero frame for 0% frame', () => {
    const result = getFrameDimensions(20, 0)
    expect(result.frameWidth).toBe(0)
    expect(result.innerPadding).toBe(20)
  })

  test('returns full frame for 100% frame', () => {
    const result = getFrameDimensions(20, 100)
    expect(result.frameWidth).toBe(20)
    expect(result.innerPadding).toBe(0)
  })
})
