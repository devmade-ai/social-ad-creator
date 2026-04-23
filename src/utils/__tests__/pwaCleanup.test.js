import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals'

// Tests for pwaCleanup — verifies that one-shot delete fires for every
// pre-rename SW runtime cache name, and that missing `caches` (e.g.,
// non-PWA environments, SSR) is a no-op rather than a throw.

let originalCaches
let cleanupOldCaches

async function loadModule() {
  jest.resetModules()
  const mod = await import('../pwaCleanup.js')
  cleanupOldCaches = mod.cleanupOldCaches
}

beforeEach(() => {
  originalCaches = globalThis.caches
})

afterEach(() => {
  if (originalCaches === undefined) {
    delete globalThis.caches
  } else {
    globalThis.caches = originalCaches
  }
})

describe('cleanupOldCaches', () => {
  test('calls caches.delete for both pre-rename cache names', async () => {
    const deleteCalls = []
    globalThis.caches = {
      delete: jest.fn((name) => {
        deleteCalls.push(name)
        return Promise.resolve(true)
      }),
    }
    await loadModule()
    cleanupOldCaches()
    // Let the fire-and-forget Promise microtasks drain.
    await Promise.resolve()
    expect(deleteCalls).toEqual(
      expect.arrayContaining(['google-fonts-cache', 'gstatic-fonts-cache'])
    )
    expect(deleteCalls).toHaveLength(2)
  })

  test('is a no-op when caches is undefined (non-PWA / SSR env)', async () => {
    delete globalThis.caches
    await loadModule()
    expect(() => cleanupOldCaches()).not.toThrow()
  })

  test('a rejected delete is swallowed (idempotent on missing cache)', async () => {
    globalThis.caches = {
      delete: jest.fn(() => Promise.reject(new Error('cache not found'))),
    }
    await loadModule()
    // The function returns synchronously; rejected promises must not surface
    // as unhandled rejections.
    cleanupOldCaches()
    // Drain microtasks. If the .catch() inside cleanupOldCaches fires
    // correctly, no unhandled rejection bubbles up.
    await new Promise((r) => setTimeout(r, 0))
    expect(globalThis.caches.delete).toHaveBeenCalledTimes(2)
  })
})
