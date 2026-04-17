// Requirement: Tripwire for the PWA icon cache-bust contract. Silent regressions
// here mean every user sees stale icons for weeks until they uninstall/reinstall.
// Approach: Assert the three pieces that together make the pattern work —
//   (1) source plugin wiring in vite.config.js,
//   (2) literal href tags in index.html that the plugin rewrites,
//   (3) built artifacts in dist/ (skipped if no build — keeps local `npm test` fast).
// Pattern: glow-props/docs/implementations/PWA_ICON_CACHE_BUST.md.
// Alternatives:
//   - End-to-end Playwright test against a running SW: Rejected — slow, flaky,
//     doesn't catch the source-level misconfig cases (wrong plugin order, missing
//     literal) that actually cause regressions.
//   - Only source-level assertions: Rejected — plugin-order config can be right
//     while the built output is wrong (e.g. vite-plugin-pwa upgrade changes defaults).

import { describe, test, expect } from '@jest/globals'
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const VITE_CONFIG = readFileSync(join(REPO_ROOT, 'vite.config.js'), 'utf8')
const INDEX_HTML = readFileSync(join(REPO_ROOT, 'index.html'), 'utf8')
const DIST_DIR = join(REPO_ROOT, 'dist')
const DIST_AVAILABLE = existsSync(join(DIST_DIR, 'manifest.webmanifest'))

// 8 hex chars = sha256 prefix used by iconVersion()
const VERSIONED = /\?v=[0-9a-f]{8}(?=[^0-9a-f]|$)/

describe('PWA icon cache bust — source-level', () => {
  test('vite.config.js defines iconCacheBustHtml() plugin', () => {
    expect(VITE_CONFIG).toMatch(/function iconCacheBustHtml\s*\(/)
  })

  test('vite.config.js defines iconVersion() helper', () => {
    expect(VITE_CONFIG).toMatch(/function iconVersion\s*\(/)
  })

  test('iconCacheBustHtml() is wired before VitePWA() in plugins array', () => {
    const pluginsStart = VITE_CONFIG.indexOf('plugins: [')
    expect(pluginsStart).toBeGreaterThan(-1)
    const iconPluginIdx = VITE_CONFIG.indexOf('iconCacheBustHtml()', pluginsStart)
    const vitePwaIdx = VITE_CONFIG.indexOf('VitePWA(', pluginsStart)
    expect(iconPluginIdx).toBeGreaterThan(pluginsStart)
    expect(iconPluginIdx).toBeLessThan(vitePwaIdx)
  })

  test('workbox config contains /^v$/ in ignoreURLParametersMatching', () => {
    expect(VITE_CONFIG).toMatch(/ignoreURLParametersMatching:\s*\[[^\]]*\/\^v\$\//)
  })

  test('workbox config enables cleanupOutdatedCaches', () => {
    expect(VITE_CONFIG).toMatch(/cleanupOutdatedCaches:\s*true/)
  })

  test('index.html contains the exact literal hrefs the plugin replaces', () => {
    for (const literal of [
      'href="/apple-touch-icon.png"',
      'href="/icon.svg"',
      'href="/favicon.png"',
      'href="/pwa-192x192.png"',
    ]) {
      expect(INDEX_HTML).toContain(literal)
    }
  })
})

const describeDist = DIST_AVAILABLE ? describe : describe.skip

describeDist('PWA icon cache bust — dist-level (run `vite build` first)', () => {
  test('dist/manifest.webmanifest icon src values are versioned', () => {
    const manifest = JSON.parse(readFileSync(join(DIST_DIR, 'manifest.webmanifest'), 'utf8'))
    expect(Array.isArray(manifest.icons)).toBe(true)
    expect(manifest.icons.length).toBeGreaterThan(0)
    for (const icon of manifest.icons) {
      expect(icon.src).toMatch(VERSIONED)
    }
  })

  test('dist/index.html icon and apple-touch-icon links are versioned, no bare URLs leak', () => {
    const html = readFileSync(join(DIST_DIR, 'index.html'), 'utf8')
    const links = html.match(/<link[^>]+rel="(?:icon|apple-touch-icon)"[^>]*>/g) || []
    expect(links.length).toBeGreaterThanOrEqual(3)
    for (const link of links) {
      const hrefMatch = link.match(/href="([^"]+)"/)
      expect(hrefMatch).not.toBeNull()
      expect(hrefMatch[1]).toMatch(VERSIONED)
    }
    // Defense-in-depth — none of the bare literals should survive the rewrite.
    for (const bare of [
      '/apple-touch-icon.png"',
      '/icon.svg"',
      '/favicon.png"',
      '/pwa-192x192.png"',
    ]) {
      expect(html).not.toContain(bare)
    }
  })

  test('dist/sw.js wires cleanupOutdatedCaches() and /^v$/ ignore param', () => {
    const sw = readFileSync(join(DIST_DIR, 'sw.js'), 'utf8')
    expect(sw).toMatch(/cleanupOutdatedCaches\(\)/)
    expect(sw).toMatch(/ignoreURLParametersMatching:\s*\[[^\]]*\/\^v\$\//)
  })
})
