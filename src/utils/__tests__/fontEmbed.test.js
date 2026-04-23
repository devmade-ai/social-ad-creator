import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals'

// Tests for the fontEmbed utility — verifies that we pre-fetch Google Fonts
// CSS and inline its woff2 url(...) refs as data URLs, with caching and graceful
// failure handling. The util uses globalThis.fetch + FileReader; both are mocked
// here because Node's test environment lacks FileReader and we don't want real
// network calls.

// Mock the fonts config — fontEmbed imports from '../config/fonts' (TypeScript)
// and Jest's no-transform setup can't parse .ts. Mocking dodges the issue and
// lets us control the test fixture.
jest.unstable_mockModule('../../config/fonts', () => ({
  fonts: [
    { id: 'inter', name: 'Inter', family: "'Inter', sans-serif", url: 'https://fonts.googleapis.com/css2?family=Inter' },
    { id: 'merriweather', name: 'Merriweather', family: "'Merriweather', serif", url: 'https://fonts.googleapis.com/css2?family=Merriweather' },
  ],
}))

let originalFetch
let originalFileReader
let getEmbeddedFontCSS
let _resetFontEmbedCache

const INTER_CSS = `
/* latin */
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url(https://fonts.gstatic.com/s/inter/inter-regular.woff2) format('woff2');
}
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url(https://fonts.gstatic.com/s/inter/inter-bold.woff2) format('woff2');
}
`.trim()

const RELATIVE_CSS = `
@font-face {
  font-family: 'Test';
  src: url(/relative/path.woff2) format('woff2');
}
`.trim()

function mockFetch(impl) {
  globalThis.fetch = jest.fn(impl)
}

function setupFileReader() {
  // Simulate FileReader: blob carries `_text` (a URL or marker string) which
  // we encode via btoa to look like real data URL output. Avoids needing
  // Node's Buffer (which isn't a browser global) so the test stays portable.
  globalThis.FileReader = class {
    readAsDataURL(blob) {
      // queueMicrotask so the load fires asynchronously like the real API.
      queueMicrotask(() => {
        const text = blob._text ?? 'mock-bytes'
        // btoa requires latin-1; URLs are safe.
        this.result = `data:font/woff2;base64,${btoa(text)}`
        this.onload?.()
      })
    }
  }
}

function makeBlob(text) {
  return { _text: text }
}

beforeEach(async () => {
  originalFetch = globalThis.fetch
  originalFileReader = globalThis.FileReader
  setupFileReader()

  // Re-import the module fresh each test so module-scoped caches are clean.
  jest.resetModules()
  const mod = await import('../fontEmbed.js')
  getEmbeddedFontCSS = mod.getEmbeddedFontCSS
  _resetFontEmbedCache = mod._resetFontEmbedCache
  _resetFontEmbedCache()
})

afterEach(() => {
  globalThis.fetch = originalFetch
  globalThis.FileReader = originalFileReader
})

describe('getEmbeddedFontCSS', () => {
  test('returns empty string when no font IDs provided', async () => {
    mockFetch(() => { throw new Error('should not fetch') })
    expect(await getEmbeddedFontCSS([])).toBe('')
    expect(await getEmbeddedFontCSS(undefined)).toBe('')
    expect(await getEmbeddedFontCSS([null, undefined, ''])).toBe('')
  })

  test('skips unknown font IDs without fetching', async () => {
    mockFetch(() => { throw new Error('should not fetch') })
    expect(await getEmbeddedFontCSS(['nonexistent-font-id'])).toBe('')
  })

  test('fetches CSS and inlines woff2 url(...) refs as data URLs', async () => {
    mockFetch(async (url) => {
      if (url.includes('fonts.googleapis.com')) {
        return { ok: true, status: 200, text: async () => INTER_CSS }
      }
      // woff2 fetch — tag the blob with the URL so we can verify it later.
      return { ok: true, status: 200, blob: async () => makeBlob(url) }
    })

    const result = await getEmbeddedFontCSS(['inter'])

    // Original https URLs replaced — none should remain in output.
    expect(result).not.toContain('https://fonts.gstatic.com/s/inter/inter-regular.woff2')
    expect(result).not.toContain('https://fonts.gstatic.com/s/inter/inter-bold.woff2')
    // Replaced with data: URLs.
    expect(result).toContain('data:font/woff2;base64,')
    // Two distinct woff2 refs → two distinct data URLs.
    const dataUrlMatches = result.match(/data:font\/woff2;base64,[A-Za-z0-9+/=]+/g)
    expect(dataUrlMatches).toHaveLength(2)
    expect(new Set(dataUrlMatches).size).toBe(2)
    // Original CSS structure preserved (font-face blocks still present).
    expect(result).toContain('@font-face')
    expect(result).toContain("font-family: 'Inter'")
  })

  test('caches per CSS URL — second call hits cache, no extra fetch', async () => {
    let cssFetchCount = 0
    let woff2FetchCount = 0
    mockFetch(async (url) => {
      if (url.includes('fonts.googleapis.com')) {
        cssFetchCount++
        return { ok: true, status: 200, text: async () => INTER_CSS }
      }
      woff2FetchCount++
      return { ok: true, status: 200, blob: async () => makeBlob(url) }
    })

    const first = await getEmbeddedFontCSS(['inter'])
    const second = await getEmbeddedFontCSS(['inter'])

    expect(first).toBe(second)
    expect(cssFetchCount).toBe(1)
    expect(woff2FetchCount).toBe(2)
  })

  test('dedupes concurrent calls for the same font (inflight promise)', async () => {
    let cssFetchCount = 0
    mockFetch(async (url) => {
      if (url.includes('fonts.googleapis.com')) {
        cssFetchCount++
        // Tiny delay to ensure both concurrent calls overlap.
        await new Promise((r) => setTimeout(r, 10))
        return { ok: true, status: 200, text: async () => INTER_CSS }
      }
      return { ok: true, status: 200, blob: async () => makeBlob(url) }
    })

    const [a, b] = await Promise.all([
      getEmbeddedFontCSS(['inter']),
      getEmbeddedFontCSS(['inter']),
    ])

    expect(a).toBe(b)
    expect(cssFetchCount).toBe(1)
  })

  test('swallows individual font failures and returns partial CSS', async () => {
    mockFetch(async (url) => {
      if (url.includes('Inter')) {
        return { ok: true, status: 200, text: async () => INTER_CSS }
      }
      if (url.includes('fonts.gstatic.com')) {
        return { ok: true, status: 200, blob: async () => makeBlob(url) }
      }
      // Any other CSS fetch fails.
      throw new Error('simulated network failure')
    })

    const result = await getEmbeddedFontCSS(['inter', 'merriweather'])
    // Inter succeeds, Merriweather fails — partial result still useful.
    expect(result).toContain("font-family: 'Inter'")
    expect(result.length).toBeGreaterThan(0)
  })

  test('handles non-200 CSS responses gracefully', async () => {
    mockFetch(async () => ({ ok: false, status: 500, text: async () => '' }))
    const result = await getEmbeddedFontCSS(['inter'])
    expect(result).toBe('')
  })

  test('resolves relative woff2 url(...) refs against the CSS URL', async () => {
    const fetchedUrls = []
    mockFetch(async (url) => {
      fetchedUrls.push(url)
      if (url.endsWith('css2?family=Inter')) {
        return { ok: true, status: 200, text: async () => RELATIVE_CSS }
      }
      return { ok: true, status: 200, blob: async () => makeBlob(url) }
    })

    const result = await getEmbeddedFontCSS(['inter'])
    // The relative /relative/path.woff2 ref must be resolved against the CSS
    // URL's origin before fetching — Google Fonts CSS host.
    expect(fetchedUrls).toContain('https://fonts.googleapis.com/relative/path.woff2')
    expect(result).toContain('data:font/woff2;base64,')
    expect(result).not.toContain('url(/relative/path.woff2)')
  })

  test('aborts fetch that takes longer than the timeout', async () => {
    mockFetch((url, { signal }) => {
      return new Promise((_resolve, reject) => {
        // Hang forever; only the abort signal can resolve us.
        signal.addEventListener('abort', () => {
          const err = new Error('aborted')
          err.name = 'AbortError'
          reject(err)
        })
      })
    })

    const result = await getEmbeddedFontCSS(['inter'])
    // The hung fetch is aborted; failure swallowed → empty CSS for that font.
    expect(result).toBe('')
  }, 12000)
})
