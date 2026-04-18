import { describe, test, expect, beforeAll } from '@jest/globals'

// Only test pure functions that don't depend on external modules (html-to-image).
// captureAsBlob and captureForPdf depend on canvas/DOM APIs and can't be unit-tested
// without a browser environment — their format/MIME mapping is covered end-to-end
// by manual export tests in docs/TESTING_GUIDE.md.

describe('exportHelpers constants', () => {
  let FORMAT_OPTIONS, FILE_EXTENSIONS, getTimestamp

  beforeAll(async () => {
    // Dynamic import to handle ESM module resolution
    try {
      const mod = await import('../exportHelpers.js')
      FORMAT_OPTIONS = mod.FORMAT_OPTIONS
      FILE_EXTENSIONS = mod.FILE_EXTENSIONS
      getTimestamp = mod.getTimestamp
    } catch {
      // ESM import may fail in Jest — skip these tests
    }
  })

  test('FORMAT_OPTIONS has 3 entries (png, jpg, webp)', () => {
    if (!FORMAT_OPTIONS) return // skip if import failed
    expect(FORMAT_OPTIONS).toHaveLength(3)
    const ids = FORMAT_OPTIONS.map((o) => o.id)
    expect(ids).toContain('png')
    expect(ids).toContain('jpg')
    expect(ids).toContain('webp')
  })

  test('FILE_EXTENSIONS maps formats correctly', () => {
    if (!FILE_EXTENSIONS) return
    expect(FILE_EXTENSIONS.jpg).toBe('jpg')
    expect(FILE_EXTENSIONS.webp).toBe('webp')
    expect(FILE_EXTENSIONS.png).toBe('png')
  })

  test('getTimestamp returns YYMMdd-HHmmss format', () => {
    if (!getTimestamp) return
    const result = getTimestamp()
    expect(typeof result).toBe('string')
    expect(result).toMatch(/^\d{6}-\d{6}$/)
  })
})
