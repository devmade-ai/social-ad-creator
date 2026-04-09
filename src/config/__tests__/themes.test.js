import { describe, test, expect } from '@jest/globals'
import { neutralColors, getNeutralColor, presetThemes } from '../themes.js'

const HEX_REGEX = /^#[0-9a-fA-F]{6}$/

describe('neutralColors', () => {
  test('has 6 neutral colors', () => {
    expect(neutralColors).toHaveLength(6)
  })

  test('every neutral has id, name, and valid hex', () => {
    for (const color of neutralColors) {
      expect(typeof color.id).toBe('string')
      expect(typeof color.name).toBe('string')
      expect(color.hex).toMatch(HEX_REGEX)
    }
  })

  test('all neutral IDs are unique', () => {
    const ids = neutralColors.map(c => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('getNeutralColor', () => {
  test('returns hex for valid ID', () => {
    expect(getNeutralColor('white')).toBe('#ffffff')
    expect(getNeutralColor('off-black')).toBe('#1a1a1a')
  })

  test('returns null for invalid ID', () => {
    expect(getNeutralColor('nonexistent')).toBeNull()
  })

  test('returns null for empty string', () => {
    expect(getNeutralColor('')).toBeNull()
  })
})

describe('presetThemes', () => {
  test('has at least 10 themes', () => {
    expect(presetThemes.length).toBeGreaterThanOrEqual(10)
  })

  test('every theme has required fields', () => {
    for (const theme of presetThemes) {
      expect(typeof theme.id).toBe('string')
      expect(typeof theme.name).toBe('string')
      expect(['light', 'dark']).toContain(theme.defaultVariant)
      expect(theme.variants).toBeDefined()
      expect(theme.variants.light).toBeDefined()
      expect(theme.variants.dark).toBeDefined()
    }
  })

  test('all theme IDs are unique', () => {
    const ids = presetThemes.map(t => t.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  test('every variant has primary, secondary, accent as valid hex', () => {
    for (const theme of presetThemes) {
      for (const variant of ['light', 'dark']) {
        const v = theme.variants[variant]
        expect(v.primary).toMatch(HEX_REGEX)
        expect(v.secondary).toMatch(HEX_REGEX)
        expect(v.accent).toMatch(HEX_REGEX)
      }
    }
  })

  test('light and dark variants have different primary colors', () => {
    for (const theme of presetThemes) {
      expect(theme.variants.light.primary).not.toBe(theme.variants.dark.primary)
    }
  })
})
