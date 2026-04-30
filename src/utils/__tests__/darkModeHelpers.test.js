import { describe, test, expect } from '@jest/globals'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { computeInitialDarkMode } from '../darkModeHelpers.js'

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..')

// Tripwire for the light-mode-default contract. The previous behavior honored
// `prefers-color-scheme` when no value was stored; that was deliberately
// removed for brand consistency on first impression. If a future change
// re-introduces an OS-preference fallback (or any non-light default), the
// `null`/`undefined` cases below will fail loudly.

describe('computeInitialDarkMode', () => {
  test('stored "true" → dark mode', () => {
    expect(computeInitialDarkMode('true')).toBe(true)
  })

  test('stored "false" → light mode', () => {
    expect(computeInitialDarkMode('false')).toBe(false)
  })

  test('null (no stored value, first visit) → light mode', () => {
    expect(computeInitialDarkMode(null)).toBe(false)
  })

  test('undefined (storage cleared mid-session) → light mode', () => {
    expect(computeInitialDarkMode(undefined)).toBe(false)
  })

  test('arbitrary string (corrupted storage) → light mode', () => {
    expect(computeInitialDarkMode('yes')).toBe(false)
    expect(computeInitialDarkMode('1')).toBe(false)
    expect(computeInitialDarkMode('TRUE')).toBe(false)
    expect(computeInitialDarkMode('')).toBe(false)
  })
})

// Second tripwire — index.html runs an inline flash-prevention script BEFORE
// React mounts, with its own copy of the dark-mode init logic. The pure
// helper above doesn't cover that path. If someone re-introduces matchMedia
// or any prefers-color-scheme branch in the inline script, OS-dark first
// visits would once again render dark before React takes over. Assert the
// literal contract here so a regression breaks `npm test`.

describe('index.html inline flash-prevention script', () => {
  const html = readFileSync(join(REPO_ROOT, 'index.html'), 'utf8')

  test('isDark is derived strictly from stored value (no matchMedia)', () => {
    // Exact literal — no clever fallback expressions, no ternary, no media query.
    expect(html).toMatch(/var isDark = stored === 'true';/)
  })

  test('inline script does not call matchMedia for prefers-color-scheme', () => {
    // Locate the flash-prevention <script> block by anchoring on the var
    // declaration we asserted above, then assert its surrounding region is
    // free of matchMedia calls. Other inline scripts (debug pill, install
    // prompt) are allowed to use matchMedia for unrelated purposes.
    const idx = html.indexOf("var isDark = stored === 'true';")
    expect(idx).toBeGreaterThan(-1)
    const blockStart = html.lastIndexOf('<script>', idx)
    const blockEnd = html.indexOf('</script>', idx)
    const block = html.slice(blockStart, blockEnd)
    expect(block).not.toMatch(/matchMedia/)
    expect(block).not.toMatch(/prefers-color-scheme/)
  })

  test('exactly one <meta name="theme-color"> tag exists', () => {
    // Two media-queried tags previously caused an OS-dark address-bar flash
    // before the inline script ran. Force-light default → single tag.
    const matches = html.match(/<meta name="theme-color"[^>]*\/>/g) || []
    expect(matches).toHaveLength(1)
  })

  test('the meta theme-color tag has no media query', () => {
    const matches = html.match(/<meta name="theme-color"[^>]*\/>/g) || []
    expect(matches[0]).not.toMatch(/media=/)
  })
})
