import { describe, test, expect } from '@jest/globals'
import { oklchToHex } from '../oklchToHex.mjs'

describe('oklchToHex', () => {
  // Known reference values — verified against CSS Color Level 4 spec and browser implementations.

  test('pure black — oklch(0% 0 0)', () => {
    expect(oklchToHex('oklch(0% 0 0)')).toBe('#000000')
  })

  test('pure white — oklch(100% 0 0)', () => {
    expect(oklchToHex('oklch(100% 0 0)')).toBe('#ffffff')
  })

  test('mid gray — oklch(50% 0 0)', () => {
    const hex = oklchToHex('oklch(50% 0 0)')
    // oklch 50% lightness maps to ~#3b3b3b in sRGB (not #808080, which is ~70% oklch)
    expect(hex).toMatch(/^#[0-9a-f]{6}$/)
    // Verify it's a neutral gray (R=G=B)
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    expect(r).toBe(g)
    expect(g).toBe(b)
  })

  test('achromatic colors — chroma=0 means hue is irrelevant', () => {
    const h0 = oklchToHex('oklch(70% 0 0)')
    const h180 = oklchToHex('oklch(70% 0 180)')
    const h359 = oklchToHex('oklch(70% 0 359)')
    // All should produce the same gray regardless of hue
    expect(h0).toBe(h180)
    expect(h0).toBe(h359)
  })

  test('optional hue — oklch(50% 0) with only L and C', () => {
    const result = oklchToHex('oklch(50% 0)')
    // Should parse successfully with hue defaulting to 0
    expect(result).not.toBeNull()
    // Should equal the same as explicit hue=0
    expect(result).toBe(oklchToHex('oklch(50% 0 0)'))
  })

  test('alpha channel is ignored — oklch(50% 0.1 250 / 0.5)', () => {
    const withAlpha = oklchToHex('oklch(50% 0.1 250 / 0.5)')
    const without = oklchToHex('oklch(50% 0.1 250)')
    expect(withAlpha).not.toBeNull()
    expect(withAlpha).toBe(without)
  })

  test('alpha as percentage — oklch(50% 0.1 250 / 80%)', () => {
    const result = oklchToHex('oklch(50% 0.1 250 / 80%)')
    expect(result).not.toBeNull()
    expect(result).toBe(oklchToHex('oklch(50% 0.1 250)'))
  })

  test('DaisyUI nord primary — oklch(59.435% 0.077 254.027)', () => {
    const hex = oklchToHex('oklch(59.435% 0.077 254.027)')
    expect(hex).toBe('#5e81ac')
  })

  test('DaisyUI autumn primary — oklch(40.723% 0.161 17.53)', () => {
    const hex = oklchToHex('oklch(40.723% 0.161 17.53)')
    expect(hex).toBe('#8c0327')
  })

  test('DaisyUI black base-100 — oklch(0% 0 0)', () => {
    expect(oklchToHex('oklch(0% 0 0)')).toBe('#000000')
  })

  test('DaisyUI dracula base-100 — oklch(28.822% 0.022 277.508)', () => {
    expect(oklchToHex('oklch(28.822% 0.022 277.508)')).toBe('#282a36')
  })

  test('returns valid 6-digit hex for all chromatic DaisyUI values', () => {
    const samples = [
      'oklch(76.662% 0.135 153.45)',    // emerald primary
      'oklch(85% 0.138 181.071)',        // cupcake primary
      'oklch(90% 0.063 306.703)',        // pastel primary
      'oklch(75.351% 0.138 232.661)',    // night primary
      'oklch(15% 0.09 281.288)',         // synthwave base-100
      'oklch(71.996% 0.123 62.756)',     // coffee primary
    ]
    for (const oklch of samples) {
      const hex = oklchToHex(oklch)
      expect(hex).toMatch(/^#[0-9a-f]{6}$/)
    }
  })

  test('output is always lowercase hex', () => {
    const hex = oklchToHex('oklch(59.435% 0.077 254.027)')
    expect(hex).toBe(hex.toLowerCase())
  })

  test('clamps out-of-gamut values instead of producing invalid hex', () => {
    // Extremely saturated color — may exceed sRGB gamut.
    // Key assertion: output is still a valid 6-digit hex (clamped, not NaN or overflow).
    const hex = oklchToHex('oklch(50% 0.5 29)')
    expect(hex).toMatch(/^#[0-9a-f]{6}$/)
    // Verify each channel is within 00–ff (no overflow from clamping)
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    expect(r).toBeGreaterThanOrEqual(0)
    expect(r).toBeLessThanOrEqual(255)
    expect(g).toBeGreaterThanOrEqual(0)
    expect(g).toBeLessThanOrEqual(255)
    expect(b).toBeGreaterThanOrEqual(0)
    expect(b).toBeLessThanOrEqual(255)
  })

  test('returns null for invalid input', () => {
    expect(oklchToHex('rgb(255, 0, 0)')).toBeNull()
    expect(oklchToHex('not a color')).toBeNull()
    expect(oklchToHex('')).toBeNull()
  })

  test('handles extra whitespace', () => {
    const normal = oklchToHex('oklch(50% 0.1 200)')
    const spaced = oklchToHex('oklch(  50%  0.1  200  )')
    expect(spaced).toBe(normal)
  })
})
