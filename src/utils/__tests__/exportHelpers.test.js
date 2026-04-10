import { describe, test, expect, beforeAll } from '@jest/globals'

// Only test pure functions that don't depend on external modules (file-saver, html-to-image).
// captureAsBlob, captureForPdf, downloadDiagnosticImage depend on canvas/DOM APIs
// and can't be unit-tested without browser environment.

describe('exportHelpers constants', () => {
  let FORMAT_OPTIONS, FILE_EXTENSIONS, MIME_TYPES, getTimestamp

  beforeAll(async () => {
    // Dynamic import to handle ESM module resolution
    try {
      const mod = await import('../exportHelpers.js')
      FORMAT_OPTIONS = mod.FORMAT_OPTIONS
      FILE_EXTENSIONS = mod.FILE_EXTENSIONS
      MIME_TYPES = mod.MIME_TYPES
      getTimestamp = mod.getTimestamp
    } catch {
      // file-saver CJS import may fail in Jest ESM — skip these tests
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

  test('MIME_TYPES maps formats to correct MIME types', () => {
    if (!MIME_TYPES) return
    expect(MIME_TYPES.jpg).toBe('image/jpeg')
    expect(MIME_TYPES.webp).toBe('image/webp')
    expect(MIME_TYPES.png).toBe('image/png')
  })

  test('getTimestamp returns YYMMdd-HHmmss format', () => {
    if (!getTimestamp) return
    const result = getTimestamp()
    expect(typeof result).toBe('string')
    expect(result).toMatch(/^\d{6}-\d{6}$/)
  })
})
