import { describe, test, expect } from '@jest/globals'
import { getSuggestedLayouts, getPresetsByAspectRatio } from '../layoutPresets.js'

describe('getSuggestedLayouts', () => {
  test('returns text-focused layouts when no image (null)', () => {
    const result = getSuggestedLayouts(null, 'instagram-feed')
    expect(result).toEqual(['hero', 'split-vertical', 'l-shape-right'])
  })

  test('suggests horizontal-friendly layouts for wide images', () => {
    const result = getSuggestedLayouts(1.8, 'twitter')
    expect(result).toContain('hero')
    expect(result).toContain('split-vertical')
    expect(result).toContain('golden-left')
  })

  test('suggests vertical-friendly layouts for tall images', () => {
    const result = getSuggestedLayouts(0.5, 'facebook-feed')
    expect(result).toContain('hero')
    expect(result).toContain('split-horizontal')
    expect(result).toContain('golden-top')
  })

  test('suggests balanced layouts for square images', () => {
    const result = getSuggestedLayouts(1.0, 'instagram-square')
    expect(result).toContain('hero')
    expect(result).toContain('quad-grid')
  })

  test('reorders suggestions for vertical story formats', () => {
    const result = getSuggestedLayouts(1.0, 'instagram-story')
    // Vertical format should prioritize horizontal splits
    expect(result[0]).toBe('split-horizontal')
  })

  test('reorders suggestions for tiktok', () => {
    const result = getSuggestedLayouts(1.5, 'tiktok')
    expect(result[0]).toBe('split-horizontal')
  })

  test('returns max 5 unique results', () => {
    const result = getSuggestedLayouts(1.0, 'instagram-story')
    expect(result.length).toBeLessThanOrEqual(5)
    expect(new Set(result).size).toBe(result.length)
  })

  test('deduplicates suggestions', () => {
    // hero appears in both square suggestions and story reordering
    const result = getSuggestedLayouts(1.0, 'instagram-story')
    const heroCount = result.filter((id) => id === 'hero').length
    expect(heroCount).toBeLessThanOrEqual(1)
  })
})

describe('getPresetsByAspectRatio', () => {
  test('returns filtered presets for valid aspect ratio', () => {
    const result = getPresetsByAspectRatio('square')
    expect(Array.isArray(result)).toBe(true)
    result.forEach((preset) => {
      expect(preset.aspectRatios).toContain('square')
    })
  })

  test('returns empty array for invalid aspect ratio', () => {
    const result = getPresetsByAspectRatio('nonexistent')
    expect(result).toEqual([])
  })

  test('returns presets for portrait filter', () => {
    const result = getPresetsByAspectRatio('portrait')
    expect(result.length).toBeGreaterThan(0)
  })

  test('returns presets for landscape filter', () => {
    const result = getPresetsByAspectRatio('landscape')
    expect(result.length).toBeGreaterThan(0)
  })
})
