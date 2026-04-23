// Requirement: Embed Google Fonts into html-to-image exports without relying on
// the library's own CORS-broken stylesheet walker.
// Approach: Fetch each font's CSS over CORS ourselves, inline every woff2
// url(...) reference as a data: URL, concat, hand the result to toCanvas via
// the `fontEmbedCSS` option. With that option set, html-to-image skips
// getCSSRules entirely — no more SecurityError on cssRules access, no more
// fallback fetch attempting to walk document.styleSheets.
// Alternatives:
//   - Add `crossorigin="anonymous"` to <link> tags only: Done as defense in
//     depth, but doesn't help woff2 fetches that html-to-image still makes
//     internally; pre-fetching is the only fully reliable path.
//   - skipFonts: true: Rejected — SVG foreignObject loses parent document
//     context when rasterized via Image element, so document.fonts isn't
//     consulted; result would render with system fonts.
//   - Fetch all 24 fonts up front: Rejected — wastes bandwidth on fonts the
//     user never picked. Only the active title + body fonts are embedded.

import { fonts } from '../config/fonts'

const cssCache = new Map() // url -> resolved CSS with data: woff2 inlined
const inflight = new Map() // url -> Promise<string>

async function blobToDataURL(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(reader.error || new Error('FileReader failed'))
    reader.readAsDataURL(blob)
  })
}

// Fetch a single Google Fonts CSS URL and return a self-contained CSS string
// where every external url(...) has been replaced with a data: URL. Uses CORS
// so the browser response is readable (Google Fonts returns ACAO: *).
async function fetchInlinedCSS(cssUrl) {
  if (cssCache.has(cssUrl)) return cssCache.get(cssUrl)
  if (inflight.has(cssUrl)) return inflight.get(cssUrl)

  const promise = (async () => {
    // Google Fonts serves different woff2 URLs based on the User-Agent string.
    // The browser's User-Agent gets us the modern woff2 variant — perfect.
    const cssRes = await fetch(cssUrl, { mode: 'cors', credentials: 'omit' })
    if (!cssRes.ok) throw new Error(`Font CSS HTTP ${cssRes.status}`)
    const cssText = await cssRes.text()

    // Match every url(...) — Google Fonts CSS uses unquoted https:// URLs.
    const urlRegex = /url\((?:["']?)(https:\/\/[^)"']+)(?:["']?)\)/g
    const uniqueUrls = [...new Set([...cssText.matchAll(urlRegex)].map((m) => m[1]))]

    const dataUrls = await Promise.all(
      uniqueUrls.map(async (u) => {
        const res = await fetch(u, { mode: 'cors', credentials: 'omit' })
        if (!res.ok) throw new Error(`Font file HTTP ${res.status} for ${u}`)
        const data = await blobToDataURL(await res.blob())
        return [u, data]
      })
    )

    let inlined = cssText
    for (const [orig, data] of dataUrls) {
      // Replace every occurrence of the original URL token with its data URL.
      // String.split/join is safe for arbitrary URL contents (no regex escaping).
      inlined = inlined.split(orig).join(data)
    }

    cssCache.set(cssUrl, inlined)
    return inlined
  })()
    .finally(() => inflight.delete(cssUrl))

  inflight.set(cssUrl, promise)
  return promise
}

// Build a single CSS string embedding the requested fonts (by font.id).
// Failures for individual fonts are swallowed — partial coverage is better
// than aborting the export. The browser's font fallback will pick up any
// missing family from system fonts, matching pre-fix behavior.
export async function getEmbeddedFontCSS(fontIds) {
  const wanted = new Set((fontIds || []).filter(Boolean))
  if (wanted.size === 0) return ''
  const active = fonts.filter((f) => wanted.has(f.id))
  const results = await Promise.all(
    active.map((f) => fetchInlinedCSS(f.url).catch(() => ''))
  )
  return results.filter(Boolean).join('\n')
}

// Test hook — clears the in-memory cache. Not exposed in production paths.
export function _resetFontEmbedCache() {
  cssCache.clear()
  inflight.clear()
}
