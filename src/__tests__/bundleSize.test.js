// Requirement: Tripwire on the post-split bundle layout. Without this, a
// future dep added to package.json silently drops into the main `index-*.js`
// chunk by default, undoing the cache-friendliness of the manualChunks split
// (vendor chunks stay cached across deploys; the app chunk re-downloads on
// every release). A 100KB regression on the app chunk multiplies across
// every active install.
// Approach: Read dist/assets/, assert chunk filenames match the expected
// vendor split + the app `index` chunk stays under a generous ceiling (well
// above current 349KB but well below pre-split 1099KB). Skipped when no
// dist exists so local `npm test` stays fast.
// Alternatives:
//   - Vite's built-in chunkSizeWarningLimit: Rejected — emits a warning, not
//     a build failure. Easy to overlook in CI logs.
//   - Track gzipped size: Rejected — requires zlib + extra work for marginal
//     accuracy gain. Raw size is the contract that matters for cache
//     invalidation (browsers cache by URL, not by compression).

import { describe, test, expect } from '@jest/globals'
import { readdirSync, statSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const DIST_ASSETS = join(REPO_ROOT, 'dist', 'assets')
const DIST_AVAILABLE = existsSync(DIST_ASSETS)

const APP_CHUNK_MAX_KB = 500
// Hard ceiling used only in the pdf-lib-leak test below — if pdf-lib ever
// ends up in the app chunk, the chunk grows to ~750KB+; this threshold
// distinguishes "normal growth" from "pdf-lib escaped vendor-pdf".
const APP_CHUNK_HARD_MAX_KB = 750
// Lower bound for the pdf-lib chunk itself. pdf-lib is ~430KB; a chunk
// smaller than 100KB means the lib was tree-shaken into app code or split
// incorrectly.
const VENDOR_PDF_MIN_KB = 100
const VENDOR_CHUNKS_REQUIRED = ['vendor-react', 'vendor-pdf', 'vendor-export', 'vendor-text']

const describeDist = DIST_AVAILABLE ? describe : describe.skip

describeDist('Bundle layout — dist-level (run `vite build` first)', () => {
  function listChunks() {
    return readdirSync(DIST_ASSETS).filter((f) => f.endsWith('.js'))
  }

  function findChunk(prefix) {
    return listChunks().find((f) => f.startsWith(`${prefix}-`))
  }

  test.each(VENDOR_CHUNKS_REQUIRED)('vendor chunk %s is present', (prefix) => {
    expect(findChunk(prefix)).toBeDefined()
  })

  test(`app index chunk stays under ${APP_CHUNK_MAX_KB}KB (cache-invalidation tripwire)`, () => {
    const indexChunk = findChunk('index')
    expect(indexChunk).toBeDefined()
    const sizeBytes = statSync(join(DIST_ASSETS, indexChunk)).size
    const sizeKB = Math.round(sizeBytes / 1024)
    // If this fails, either:
    //   (a) a heavy dep was added without updating manualChunks in vite.config.js, or
    //   (b) app code grew significantly — consider further splitting.
    expect(sizeKB).toBeLessThan(APP_CHUNK_MAX_KB)
  })

  test('pdf-lib is in vendor-pdf, not the app chunk (largest dep — must stay isolated)', () => {
    const indexChunk = findChunk('index')
    const pdfChunk = findChunk('vendor-pdf')
    expect(pdfChunk).toBeDefined()
    const indexSizeKB = Math.round(statSync(join(DIST_ASSETS, indexChunk)).size / 1024)
    const pdfSizeKB = Math.round(statSync(join(DIST_ASSETS, pdfChunk)).size / 1024)
    // If pdf-lib escapes vendor-pdf: pdfSize drops near zero (just the
    // chunk bootstrap) AND indexSize grows past APP_CHUNK_HARD_MAX_KB.
    expect(pdfSizeKB).toBeGreaterThan(VENDOR_PDF_MIN_KB)
    expect(indexSizeKB).toBeLessThan(APP_CHUNK_HARD_MAX_KB)
  })
})
