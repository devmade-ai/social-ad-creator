import { describe, test, expect } from '@jest/globals'

describe('stylePresets', () => {
  let getLookSettingsForLayout, getLookPreset, lookPresets

  beforeAll(async () => {
    // Dynamic import needed because lookPresets references textStyles constants
    // defined later in the file, causing initialization order issues in Jest ESM
    const mod = await import('../stylePresets.js')
    getLookSettingsForLayout = mod.getLookSettingsForLayout
    getLookPreset = mod.getLookPreset
    lookPresets = mod.lookPresets
  })

  describe('getLookPreset', () => {
    test('returns preset by ID', () => {
      const result = getLookPreset('clean')
      expect(result).toBeDefined()
      expect(result.id).toBe('clean')
    })

    test('returns undefined for non-existent ID', () => {
      expect(getLookPreset('nonexistent')).toBeUndefined()
    })
  })

  describe('getLookSettingsForLayout', () => {
    test('returns null for non-existent look ID', () => {
      expect(getLookSettingsForLayout('nonexistent', 'hero')).toBeNull()
    })

    test('returns settings with fonts and imageFilters', () => {
      const result = getLookSettingsForLayout('clean', 'hero')
      expect(result).toBeDefined()
      expect(result.fonts).toBeDefined()
      expect(result.fonts.title).toBeDefined()
      expect(result.fonts.body).toBeDefined()
      expect(result.imageFilters).toBeDefined()
    })

    test('includes textStyles when defined on preset', () => {
      const result = getLookSettingsForLayout('clean', 'hero')
      expect(result.textStyles).toBeDefined()
      expect(result.textStyles.title).toBeDefined()
      expect(result.textStyles.title.color).toBeDefined()
    })

    test('falls back to hero settings for unknown layout', () => {
      const heroResult = getLookSettingsForLayout('clean', 'hero')
      const unknownResult = getLookSettingsForLayout('clean', 'nonexistent-layout')
      expect(unknownResult.fonts).toEqual(heroResult.fonts)
      expect(unknownResult.textStyles).toEqual(heroResult.textStyles)
    })

    test('returns layout-specific overlay when defined', () => {
      const result = getLookSettingsForLayout('clean', 'hero')
      expect(result.imageOverlay).toBeDefined()
      expect(result.imageOverlay.type).toBeDefined()
    })
  })

  describe('lookPresets data integrity', () => {
    test('all presets have textStyles defined', () => {
      lookPresets.forEach((preset) => {
        expect(preset.textStyles).toBeDefined()
        expect(preset.textStyles.title).toBeDefined()
        expect(preset.textStyles.title.color).toBeDefined()
      })
    })

    test('all presets have fonts, imageFilters, and layouts', () => {
      lookPresets.forEach((preset) => {
        expect(preset.fonts).toBeDefined()
        expect(preset.fonts.title).toBeDefined()
        expect(preset.fonts.body).toBeDefined()
        expect(preset.imageFilters).toBeDefined()
        expect(preset.layouts).toBeDefined()
      })
    })

    test('textStyles define all 6 text elements', () => {
      const elementIds = ['title', 'tagline', 'bodyHeading', 'bodyText', 'cta', 'footnote']
      lookPresets.forEach((preset) => {
        elementIds.forEach((id) => {
          expect(preset.textStyles[id]).toBeDefined()
          expect(typeof preset.textStyles[id].color).toBe('string')
        })
      })
    })
  })
})
