import { createHash } from 'node:crypto'
import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// Requirement: PWA icon cache busting across HTTP, CDN, Workbox precache, and
// Chrome WebAPK layers. Stable filenames (`pwa-192x192.png`, `apple-touch-icon.png`,
// `favicon.png`, `icon.svg`) are keyed by URL — every layer caches the old icon
// for weeks after a deploy until the URL changes.
// Approach: Append `?v=<sha256-prefix>` to every icon URL (manifest + index.html).
// Hash-derived, so URL only bumps when icon bytes change (prevents spurious
// WebAPK regens). Workbox is told to strip the `v` param on precache lookup so
// precache matching still works.
// Pattern: glow-props/docs/implementations/PWA_ICON_CACHE_BUST.md.
// Alternatives:
//   - Content-hashed filenames: Rejected — requires custom prebuild rename +
//     stale-file cleanup; most PWA plugins don't participate in the asset graph.
//   - Timestamp versioning: Rejected — bumps on every deploy, forces WebAPK
//     regen even when icons are unchanged (costs bandwidth on Android).
const __dirname = dirname(fileURLToPath(import.meta.url))
const PUBLIC_DIR = resolve(__dirname, 'public')

function iconVersion(relPath) {
  const full = resolve(PUBLIC_DIR, relPath)
  if (!existsSync(full)) {
    // Warn-not-throw — first-time clones legitimately have no icons before
    // the prebuild generate-icons step runs.
    console.warn(`[iconVersion] missing icon at ${full} — using '0' as version.`)
    return '0'
  }
  return createHash('sha256').update(readFileSync(full)).digest('hex').slice(0, 8)
}

const ICON_PATHS = [
  'apple-touch-icon.png',
  'favicon.png',
  'icon.svg',
  'pwa-192x192.png',
  'pwa-512x512.png',
  'pwa-maskable-1024.png',
]

const ICON_VERSIONS = Object.fromEntries(ICON_PATHS.map((p) => [p, iconVersion(p)]))
const versioned = (relPath) => `${relPath}?v=${ICON_VERSIONS[relPath]}`

// Rewrites the four icon <link> tags in index.html to carry ?v=<hash>.
// Throws on missing literals so a tag-formatting change can't silently ship
// un-versioned URLs.
function iconCacheBustHtml() {
  const REPLACEMENTS = [
    { from: 'href="/apple-touch-icon.png"',
      to: () => `href="/${versioned('apple-touch-icon.png')}"` },
    { from: 'href="/icon.svg"',
      to: () => `href="/${versioned('icon.svg')}"` },
    { from: 'href="/favicon.png"',
      to: () => `href="/${versioned('favicon.png')}"` },
    { from: 'href="/pwa-192x192.png"',
      to: () => `href="/${versioned('pwa-192x192.png')}"` },
  ]

  return {
    name: 'icon-cache-bust-html',
    transformIndexHtml(html) {
      let out = html
      for (const { from, to } of REPLACEMENTS) {
        if (!out.includes(from)) {
          throw new Error(
            `[icon-cache-bust-html] expected literal not found in index.html: ${from}\n` +
            `Update the REPLACEMENTS table in vite.config.js to match the current tag formatting.`,
          )
        }
        out = out.replace(from, to())
      }
      return out
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    // Must run before VitePWA — locks the contract even though VitePWA only
    // injects <link rel="manifest"> today. Defensive against future plugin
    // behavior changes on either side.
    iconCacheBustHtml(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'CanvaGrid',
        short_name: 'CanvaGrid',
        description: 'CanvaGrid - Create social media ads for LinkedIn, Facebook, Instagram, Twitter/X, and TikTok',
        // Requirement: Colors match DaisyUI lofi (light) / black (dark) default themes.
        // theme_color = lofi neutral (#808080), background_color = black base-100 (#000000).
        theme_color: '#808080',
        background_color: '#000000',
        display: 'standalone',
        // Requirement: Without this, Chrome may skip beforeinstallprompt if it
        // thinks a native app exists. Ref: glow-props Implementation Patterns.
        prefer_related_applications: false,
        // Requirement: Explicit id prevents Chrome from deriving identity from start_url.
        // Without this, changing start_url would break install identity for existing users.
        id: '/',
        scope: '/',
        start_url: '/',
        // Requirement: Separate icon entries per purpose — never combine "any maskable".
        // Dedicated 1024px maskable icon ensures proper safe-zone rendering on all platforms.
        icons: [
          {
            src: versioned('icon.svg'),
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any'
          },
          {
            src: versioned('pwa-192x192.png'),
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: versioned('pwa-512x512.png'),
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: versioned('pwa-maskable-1024.png'),
            sizes: '1024x1024',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,woff2}', 'pwa-*.png', 'apple-touch-icon.png', 'favicon.png', 'icon.svg'],
        // Requirement: Without `/^v$/`, Workbox precache only matches un-versioned
        // URLs — versioned icon requests fall through to network, breaking offline.
        // `cleanupOutdatedCaches` deletes precache stores from older workbox
        // major versions (defense-in-depth across SW upgrades).
        cleanupOutdatedCaches: true,
        ignoreURLParametersMatching: [/^utm_/, /^v$/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/gh\/devmade-ai\/canva-grid-assets(@[^/]+)?\/.*manifest\.json(\?.*)?$/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'sample-manifest-cache',
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 1,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/gh\/devmade-ai\/canva-grid-assets(@[^/]+)?\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'sample-images-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
})
