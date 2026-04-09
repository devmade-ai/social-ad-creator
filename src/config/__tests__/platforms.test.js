import { describe, test, expect } from '@jest/globals'
import {
  platformGroups,
  platforms,
  categoryOrder,
  platformsByCategory,
  platformGroupsByCategory,
  getAspectRatio,
  findFormat,
  findPlatformGroup,
} from '../platforms.js'

describe('platformGroups structure', () => {
  test('every group has required fields', () => {
    for (const group of platformGroups) {
      expect(group.id).toBeDefined()
      expect(typeof group.id).toBe('string')
      expect(group.name).toBeDefined()
      expect(typeof group.name).toBe('string')
      expect(group.category).toBeDefined()
      expect(Array.isArray(group.formats)).toBe(true)
      expect(group.formats.length).toBeGreaterThan(0)
    }
  })

  test('every format has required fields with valid values', () => {
    for (const group of platformGroups) {
      for (const format of group.formats) {
        expect(format.id).toBeDefined()
        expect(typeof format.id).toBe('string')
        expect(format.name).toBeDefined()
        expect(format.width).toBeGreaterThan(0)
        expect(format.height).toBeGreaterThan(0)
        expect(['jpg', 'png']).toContain(format.recommendedFormat)
      }
    }
  })

  test('all format IDs are unique', () => {
    const ids = platformGroups.flatMap(g => g.formats.map(f => f.id))
    const unique = new Set(ids)
    expect(unique.size).toBe(ids.length)
  })

  test('all group IDs are unique', () => {
    const ids = platformGroups.map(g => g.id)
    const unique = new Set(ids)
    expect(unique.size).toBe(ids.length)
  })

  test('every group category is in categoryOrder', () => {
    for (const group of platformGroups) {
      expect(categoryOrder).toContain(group.category)
    }
  })
})

describe('platforms flat export', () => {
  test('platforms count matches sum of all formats', () => {
    const formatCount = platformGroups.reduce((sum, g) => sum + g.formats.length, 0)
    expect(platforms).toHaveLength(formatCount)
  })

  test('every platform has category and platformId from parent group', () => {
    for (const p of platforms) {
      expect(p.category).toBeDefined()
      expect(p.platformId).toBeDefined()
      expect(p.platformName).toBeDefined()
    }
  })
})

describe('platformsByCategory', () => {
  test('every category in categoryOrder has entries or is empty', () => {
    for (const cat of categoryOrder) {
      // Category might not have platforms (e.g., 'other' could be empty)
      const entries = platformsByCategory[cat] || []
      expect(Array.isArray(entries)).toBe(true)
    }
  })

  test('total platforms across categories matches flat list', () => {
    const total = Object.values(platformsByCategory).reduce((sum, arr) => sum + arr.length, 0)
    expect(total).toBe(platforms.length)
  })
})

describe('getAspectRatio', () => {
  test('returns correct ratio for known format', () => {
    const ratio = getAspectRatio('instagram-square')
    expect(ratio).toBe(1) // 1080/1080
  })

  test('returns a positive number for unknown format (falls back to first)', () => {
    const ratio = getAspectRatio('nonexistent')
    expect(ratio).toBeGreaterThan(0)
  })
})

describe('findFormat', () => {
  test('finds a known format', () => {
    const format = findFormat('instagram-story')
    expect(format.id).toBe('instagram-story')
    expect(format.width).toBe(1080)
    expect(format.height).toBe(1920)
  })

  test('returns first platform for unknown format', () => {
    const format = findFormat('nonexistent')
    expect(format.id).toBe(platforms[0].id)
  })
})

describe('findPlatformGroup', () => {
  test('finds parent group for a known format', () => {
    const group = findPlatformGroup('instagram-story')
    expect(group.id).toBe('instagram')
  })

  test('returns first group for unknown format', () => {
    const group = findPlatformGroup('nonexistent')
    expect(group.id).toBe(platformGroups[0].id)
  })
})
