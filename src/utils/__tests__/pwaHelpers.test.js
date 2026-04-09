import { describe, test, expect, beforeEach, afterEach } from '@jest/globals'
import { detectBrowser, trackInstallEvent, wasJustUpdated } from '../pwaHelpers.js'

// --- detectBrowser ---

describe('detectBrowser', () => {
  let originalUA
  let originalBrave

  beforeEach(() => {
    originalUA = navigator.userAgent
    originalBrave = navigator.brave
  })

  afterEach(() => {
    Object.defineProperty(navigator, 'userAgent', { value: originalUA, configurable: true })
    if (originalBrave !== undefined) {
      Object.defineProperty(navigator, 'brave', { value: originalBrave, configurable: true })
    } else {
      delete navigator.brave
    }
  })

  function setUA(ua) {
    Object.defineProperty(navigator, 'userAgent', { value: ua, configurable: true })
  }

  function setBrave(value) {
    if (value) {
      Object.defineProperty(navigator, 'brave', { value: { isBrave: () => true }, configurable: true })
    } else {
      delete navigator.brave
    }
  }

  test('detects Brave via navigator.brave', () => {
    setBrave(true)
    setUA('Mozilla/5.0 Chrome/120.0')
    expect(detectBrowser()).toBe('brave')
  })

  test('detects iOS Chrome via CriOS', () => {
    setBrave(false)
    setUA('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/120.0 Mobile/15E148 Safari/604.1')
    expect(detectBrowser()).toBe('chrome')
  })

  test('detects iOS Firefox via FxiOS', () => {
    setBrave(false)
    setUA('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/120.0 Mobile/15E148 Safari/604.1')
    expect(detectBrowser()).toBe('firefox')
  })

  test('detects iOS Edge via EdgiOS', () => {
    setBrave(false)
    setUA('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) EdgiOS/120.0 Mobile/15E148 Safari/604.1')
    expect(detectBrowser()).toBe('edge')
  })

  test('detects Firefox desktop', () => {
    setBrave(false)
    setUA('Mozilla/5.0 (Windows NT 10.0; rv:120.0) Gecko/20100101 Firefox/120.0')
    expect(detectBrowser()).toBe('firefox')
  })

  test('detects Safari (not Chrome)', () => {
    setBrave(false)
    setUA('Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15')
    expect(detectBrowser()).toBe('safari')
  })

  test('detects Samsung Internet before Chrome', () => {
    setBrave(false)
    setUA('Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/23.0 Chrome/115.0 Mobile Safari/537.36')
    expect(detectBrowser()).toBe('samsung')
  })

  test('detects Opera via OPR/', () => {
    setBrave(false)
    setUA('Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36 OPR/106.0')
    expect(detectBrowser()).toBe('opera')
  })

  test('detects Vivaldi', () => {
    setBrave(false)
    setUA('Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36 Vivaldi/6.5')
    expect(detectBrowser()).toBe('vivaldi')
  })

  test('detects Arc', () => {
    setBrave(false)
    setUA('Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36 Arc/1.0')
    expect(detectBrowser()).toBe('arc')
  })

  test('detects Edge desktop via Edg/', () => {
    setBrave(false)
    setUA('Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36 Edg/120.0')
    expect(detectBrowser()).toBe('edge')
  })

  test('detects Chrome as fallback', () => {
    setBrave(false)
    setUA('Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36')
    expect(detectBrowser()).toBe('chrome')
  })

  test('returns unknown for unrecognized UA', () => {
    setBrave(false)
    setUA('SomeBot/1.0')
    expect(detectBrowser()).toBe('unknown')
  })
})

// --- wasJustUpdated ---

describe('wasJustUpdated', () => {
  let store = {}

  beforeEach(() => {
    store = {}
    globalThis.sessionStorage = {
      getItem: (key) => store[key] ?? null,
      setItem: (key, value) => { store[key] = value },
      removeItem: (key) => { delete store[key] },
    }
  })

  test('returns false when no timestamp stored', () => {
    expect(wasJustUpdated()).toBe(false)
  })

  test('returns true when timestamp is within 30 seconds', () => {
    store['pwa-update-applied'] = String(Date.now() - 10_000) // 10s ago
    expect(wasJustUpdated()).toBe(true)
  })

  test('returns false when timestamp is older than 30 seconds', () => {
    store['pwa-update-applied'] = String(Date.now() - 60_000) // 60s ago
    expect(wasJustUpdated()).toBe(false)
  })

  test('returns false when sessionStorage throws', () => {
    globalThis.sessionStorage = {
      getItem: () => { throw new Error('SecurityError') },
    }
    expect(wasJustUpdated()).toBe(false)
  })
})

// --- trackInstallEvent ---

describe('trackInstallEvent', () => {
  let store = {}

  beforeEach(() => {
    store = {}
    globalThis.localStorage = {
      getItem: (key) => store[key] ?? null,
      setItem: (key, value) => { store[key] = value },
    }
  })

  test('writes event to localStorage', () => {
    trackInstallEvent('prompted', 'chrome')
    const events = JSON.parse(store['pwa-install-events'])
    expect(events).toHaveLength(1)
    expect(events[0].event).toBe('prompted')
    expect(events[0].browser).toBe('chrome')
    expect(events[0].timestamp).toBeDefined()
  })

  test('appends to existing events', () => {
    store['pwa-install-events'] = JSON.stringify([{ event: 'old', timestamp: '2024-01-01', browser: 'chrome' }])
    trackInstallEvent('installed', 'edge')
    const events = JSON.parse(store['pwa-install-events'])
    expect(events).toHaveLength(2)
    expect(events[1].event).toBe('installed')
  })

  test('caps at 50 entries', () => {
    const existing = Array.from({ length: 50 }, (_, i) => ({ event: `e${i}`, timestamp: '2024-01-01', browser: 'x' }))
    store['pwa-install-events'] = JSON.stringify(existing)
    trackInstallEvent('new', 'chrome')
    const events = JSON.parse(store['pwa-install-events'])
    expect(events).toHaveLength(50)
    expect(events[events.length - 1].event).toBe('new')
  })

  test('does not throw when localStorage fails', () => {
    globalThis.localStorage = {
      getItem: () => { throw new Error('SecurityError') },
      setItem: () => { throw new Error('SecurityError') },
    }
    expect(() => trackInstallEvent('test', 'chrome')).not.toThrow()
  })
})
