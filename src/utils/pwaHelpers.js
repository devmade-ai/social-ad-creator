// Requirement: Pure utility functions for PWA install/update hooks.
// Approach: Extracted from usePWAInstall.js and usePWAUpdate.js so they can be
//   unit tested without importing browser-only modules (virtual:pwa-register/react,
//   debugLog with console patching). Both hooks import from this file.
// Alternatives:
//   - Test hooks directly with mocks: Rejected — Jest ESM + moduleNameMapper
//     doesn't reliably intercept Vite virtual modules.

// Chromium browsers that support beforeinstallprompt — single source of truth.
const CHROMIUM_BROWSERS = ['chrome', 'edge', 'brave', 'opera', 'samsung', 'vivaldi', 'arc']

// Display names for UI — separate from detection logic.
const BROWSER_DISPLAY_NAMES = {
  chrome: 'Google Chrome', edge: 'Microsoft Edge', brave: 'Brave',
  opera: 'Opera', samsung: 'Samsung Internet', vivaldi: 'Vivaldi',
  arc: 'Arc', safari: 'Safari', firefox: 'Firefox', unknown: 'Your Browser',
}

// Detect browser type — covers 7 Chromium browsers + Safari + Firefox.
// Brave Mobile strips "Brave" from the UA string (confirmed 2026-03-07).
// Use 'brave' in navigator existence check, not UA match.
// Caveat: unverified whether Brave on iOS exposes navigator.brave (WebKit
// engine, not Chromium). If absent, falls through to 'safari' — benign,
// since no iOS browser except Safari can install PWAs.
// iOS browser variants use different UA tokens: CriOS (Chrome), FxiOS (Firefox),
// EdgiOS (Edge) — these must be checked before general patterns, otherwise they
// fall through to 'safari' (all iOS UAs contain "Safari" but not "Chrome").
function detectBrowser() {
  const ua = navigator.userAgent

  if ('brave' in navigator) return 'brave'
  // iOS variants — must come before general checks (UA has "Safari" but not "Chrome")
  if (/CriOS/i.test(ua)) return 'chrome'
  if (/FxiOS/i.test(ua)) return 'firefox'
  if (/EdgiOS/i.test(ua)) return 'edge'
  if (/Firefox/i.test(ua)) return 'firefox'
  if (/Safari/i.test(ua) && !/Chrome/i.test(ua) && !/Chromium/i.test(ua)) return 'safari'
  // Samsung must come before Chrome (UA contains both "SamsungBrowser" and "Chrome")
  if (/SamsungBrowser/i.test(ua)) return 'samsung'
  // Opera must come before Chrome (UA contains both "OPR" and "Chrome")
  if (/OPR\//i.test(ua) || /Opera/i.test(ua)) return 'opera'
  if (/Vivaldi/i.test(ua)) return 'vivaldi'
  if (/Arc\//i.test(ua)) return 'arc'
  if (/Edg\//i.test(ua)) return 'edge'
  if (/Chrome/i.test(ua) || /Chromium/i.test(ua)) return 'chrome'
  return 'unknown'
}

// Check if running as installed PWA.
function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  )
}

// Install analytics — localStorage event log, capped at 50 entries.
function trackInstallEvent(event, browserName) {
  try {
    const key = 'pwa-install-events'
    const events = JSON.parse(localStorage.getItem(key) || '[]')
    events.push({ event, timestamp: new Date().toISOString(), browser: browserName })
    if (events.length > 50) events.splice(0, events.length - 50)
    localStorage.setItem(key, JSON.stringify(events))
  } catch { /* best effort */ }
}

// 30-second suppression after applying an update — prevents false re-detection
// when the browser's SW lifecycle hasn't fully settled after reload.
function wasJustUpdated() {
  try {
    const ts = sessionStorage.getItem('pwa-update-applied')
    if (!ts) return false
    return Date.now() - Number(ts) < 30_000
  } catch { return false }
}

export {
  CHROMIUM_BROWSERS,
  BROWSER_DISPLAY_NAMES,
  detectBrowser,
  isStandalone,
  trackInstallEvent,
  wasJustUpdated,
}
