// Requirement: Embed Google Fonts into html-to-image exports without relying
// on the library's own CORS-broken stylesheet walker.
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
//   - Use html-to-image's exported getFontEmbedCSS(): Rejected — internally
//     calls the same getCSSRules walker that throws SecurityError on cross-
//     origin sheets. Pre-fetching by URL sidesteps the CSSOM entirely.

import { fonts } from '../config/fonts'

const FETCH_TIMEOUT_MS = 8000

const cssCache = new Map() // cssUrl -> resolved CSS with data: woff2 inlined
const inflight = new Map() // cssUrl -> Promise<string>

// Wrap fetch with an AbortController so a hung gstatic.com response can't
// block the export indefinitely. On timeout the export silently falls back
// to system fonts — preferable to a frozen UI. Tests bypass the wall-clock
// wait via jest.useFakeTimers() + jest.advanceTimersByTime().
async function fetchWithTimeout(url, init = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  try {
    return await fetch(url, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

async function blobToDataURL(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(reader.error || new Error('FileReader failed'))
    reader.readAsDataURL(blob)
  })
}

// Defensive wrapper — a buggy caller-supplied onWarning that throws must NOT
// break the export pipeline. Without this, a throw from onWarning inside the
// woff2 loop would reject the inflight CSS fetch, drop the cache entry, then
// re-throw inside getEmbeddedFontCSS's per-font .catch (which itself calls
// onWarning), producing an unhandled rejection that aborts the entire export.
function safeWarn(onWarning, msg) {
  if (!onWarning) return
  try { onWarning(msg) } catch { /* swallow — caller-supplied callback bugs must not break the export */ }
}

// Fetch one Google Fonts CSS URL and return a self-contained CSS string
// where every successfully-fetched url(...) has been replaced with a data:
// URL. Uses CORS so the browser response is readable (Google Fonts returns
// ACAO: *).
//
// External assumption: Google Fonts continues to serve `Access-Control-
// Allow-Origin: *` on both the CSS endpoint and the gstatic woff2 files. If
// they ever stop, every fetch here rejects with a CORS error and the export
// falls back to system fonts via the warn-and-degrade path below. The SW
// runtime cache (cache-first, 1 year) buffers existing entries so removal
// would only affect new fonts users haven't loaded yet.
//
// Failure model: a failed individual woff2 fetch (one weight, one subset)
// must NOT abort the whole font. The original url(...) ref is left in the
// CSS — when the SVG renders it will try to fetch the woff2 anyway, and
// even if that also fails the browser falls back to the next family in the
// stack. Other weights still load from their data: URLs. onWarning is
// called once per dropped weight so callers can surface partial failures.
async function fetchInlinedCSS(cssUrl, { onWarning } = {}) {
  if (cssCache.has(cssUrl)) return cssCache.get(cssUrl)
  if (inflight.has(cssUrl)) return inflight.get(cssUrl)

  const promise = (async () => {
    // Google Fonts serves different woff2 URLs based on the User-Agent
    // string. The browser's User-Agent gets us the modern woff2 variant.
    const cssRes = await fetchWithTimeout(cssUrl, { mode: 'cors', credentials: 'omit' })
    if (!cssRes.ok) throw new Error(`Font CSS HTTP ${cssRes.status}`)
    const cssText = await cssRes.text()

    // Match every url(...). Google Fonts CSS uses absolute https URLs
    // today, but resolve relative refs against the CSS URL so a future
    // format change (or a non-Google CDN with relative refs) doesn't
    // break embedding.
    const urlRegex = /url\((["']?)([^)"']+)\1\)/g
    const rawUrls = [...new Set([...cssText.matchAll(urlRegex)].map((m) => m[2]))]
    const resolvedUrls = rawUrls.map((raw) => {
      try {
        return { raw, resolved: new URL(raw, cssUrl).href }
      } catch {
        return { raw, resolved: raw }
      }
    })

    // Promise.allSettled: one weight failing must not drop the whole font.
    const settled = await Promise.allSettled(
      resolvedUrls.map(async ({ raw, resolved }) => {
        const res = await fetchWithTimeout(resolved, { mode: 'cors', credentials: 'omit' })
        if (!res.ok) throw new Error(`Font file HTTP ${res.status} for ${resolved}`)
        const data = await blobToDataURL(await res.blob())
        return [raw, data]
      })
    )

    const replacements = []
    for (let i = 0; i < settled.length; i++) {
      const r = settled[i]
      if (r.status === 'fulfilled') {
        replacements.push(r.value)
      } else {
        safeWarn(onWarning, `woff2 fetch failed for ${resolvedUrls[i].resolved}: ${r.reason?.message || r.reason}`)
      }
    }

    let inlined = cssText
    for (const [orig, data] of replacements) {
      // String.split/join replaces every occurrence and is safe for
      // arbitrary URL contents (no regex escaping needed).
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
// onWarning (optional) is called once per dropped weight or font with a
// short human-readable message. Per-font failures (CSS fetch dies entirely)
// produce one onWarning call and the font is omitted from the result.
// Returns a possibly-empty CSS string — never throws.
export async function getEmbeddedFontCSS(fontIds, { onWarning } = {}) {
  const wanted = new Set((fontIds || []).filter(Boolean))
  if (wanted.size === 0) return ''
  const active = fonts.filter((f) => wanted.has(f.id))
  const results = await Promise.all(
    active.map((f) =>
      fetchInlinedCSS(f.url, { onWarning }).catch((e) => {
        safeWarn(onWarning, `Font CSS failed for ${f.id}: ${e?.message || e}`)
        return ''
      })
    )
  )
  return results.filter(Boolean).join('\n')
}

