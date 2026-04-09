// Requirement: PWA install prompt with browser-specific fallback instructions.
// Approach: Capture beforeinstallprompt via inline script in index.html (fires before
//   React mounts), then this hook reads window.__pwaInstallPrompt on mount. For browsers
//   that don't support beforeinstallprompt (Safari, Firefox), show manual install steps.
// Architecture: Module-level singleton — canInstall and showManualInstructions live at
//   module scope so all hook consumers share the same state. Without this, each hook
//   instance has independent React state that diverges (e.g., one sets canInstall=false
//   after install but others still show the button).
// Alternatives:
//   - Capture event in React only: Rejected — race condition on cached SW repeat visits
//     where the event fires before React mounts and is lost.
//   - Skip non-Chromium browsers: Rejected — Safari/Firefox users can still install PWAs
//     manually; showing instructions is better than hiding the feature.
//   - Per-instance React state: Rejected — multiple consumers get out of sync.
import { useState, useEffect, useMemo } from 'react'
import { debugLog } from '../utils/debugLog'

// Chromium browsers that support beforeinstallprompt — single source of truth.
// Shared by install hook, diagnostics, and analytics.
export const CHROMIUM_BROWSERS = ['chrome', 'edge', 'brave', 'opera', 'samsung', 'vivaldi', 'arc']

// Display names for UI — separate from detection logic
const BROWSER_DISPLAY_NAMES = {
  chrome: 'Google Chrome', edge: 'Microsoft Edge', brave: 'Brave',
  opera: 'Opera', samsung: 'Samsung Internet', vivaldi: 'Vivaldi',
  arc: 'Arc', safari: 'Safari', firefox: 'Firefox', unknown: 'Your Browser',
}

// Module-level state — survives remounts and shared across all consumers
let deferredPrompt = window.__pwaInstallPrompt || null
// Initialize from captured prompt — avoids an extra render cycle when the
// inline script in index.html already captured beforeinstallprompt.
let _canInstall = !!deferredPrompt && !isStandalone()
let _showManualInstructions = false
const _listeners = new Set()

function notifyListeners() { _listeners.forEach(fn => fn()) }

// Detect browser type — covers 7 Chromium browsers + Safari + Firefox.
// Brave Mobile strips "Brave" from the UA string (confirmed 2026-03-07).
// Use 'brave' in navigator existence check, not UA match.
// Caveat: 'brave' in navigator is unverified on iOS Brave (WebKit engine).
// If absent, iOS Brave falls through to 'safari' — benign, since iOS Brave
// can't install PWAs anyway (same as all non-Safari iOS browsers).
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

// Check if running as installed PWA
function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  )
}

// Install analytics — localStorage event log, capped at 50 entries.
// Useful for understanding install conversion without external analytics.
function trackInstallEvent(event) {
  try {
    const key = 'pwa-install-events'
    const events = JSON.parse(localStorage.getItem(key) || '[]')
    events.push({ event, timestamp: new Date().toISOString(), browser: detectBrowser() })
    if (events.length > 50) events.splice(0, events.length - 50)
    localStorage.setItem(key, JSON.stringify(events))
  } catch { /* best effort */ }
}

export function usePWAInstall() {
  const [, forceRender] = useState(0)

  const browser = useMemo(() => detectBrowser(), [])
  const isInstalled = useMemo(() => isStandalone(), [])

  const supportsAutoInstall = CHROMIUM_BROWSERS.includes(browser)
  const supportsManualInstall = browser === 'safari' || browser === 'firefox'

  // Sync module state to React — all consumers re-render on state change
  useEffect(() => {
    const listener = () => forceRender(n => n + 1)
    _listeners.add(listener)
    return () => { _listeners.delete(listener) }
  }, [])

  useEffect(() => {
    // Already installed — no install option needed
    if (isInstalled) {
      _canInstall = false
      notifyListeners()
      return
    }

    // Check if the inline script in index.html already captured the prompt
    // before React mounted (common on cached SW repeat visits)
    if (window.__pwaInstallPrompt && !deferredPrompt) {
      deferredPrompt = window.__pwaInstallPrompt
    }
    if (deferredPrompt && !_canInstall) {
      _canInstall = true
      notifyListeners()
      debugLog('pwa', 'install-prompt-cached', { browser })
    }

    const handler = (e) => {
      e.preventDefault()
      deferredPrompt = e
      window.__pwaInstallPrompt = e
      _canInstall = true
      notifyListeners()
      debugLog('pwa', 'install-prompt-captured', { browser })
      trackInstallEvent('prompted')
    }

    const installedHandler = () => {
      _canInstall = false
      deferredPrompt = null
      notifyListeners()
      debugLog('pwa', 'app-installed', { browser })
      trackInstallEvent('installed')
      // Track install in Google Analytics
      if (typeof gtag === 'function') {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
        const ua = navigator.userAgent
        let os = 'unknown'
        if (/Windows/i.test(ua)) os = 'windows'
        else if (/iPhone|iPad|iPod/i.test(ua)) os = 'ios'
        else if (/Android/i.test(ua)) os = 'android'
        else if (/Mac OS/i.test(ua)) os = 'macos'
        else if (/Linux/i.test(ua)) os = 'linux'

        gtag('event', 'app_install', {
          method: browser,
          platform: isMobile ? 'mobile' : 'desktop',
          os,
          referrer: document.referrer || 'direct',
          session_duration: Math.round((Date.now() - window._pageLoadTime) / 1000),
        })
      }
    }

    // Detect installation via browser menu (not the native prompt) —
    // catches side-loads where appinstalled doesn't fire.
    const mediaQuery = window.matchMedia('(display-mode: standalone)')
    const displayHandler = (e) => {
      if (e.matches) {
        _canInstall = false
        notifyListeners()
        trackInstallEvent('installed-via-browser')
      }
    }
    mediaQuery.addEventListener('change', displayHandler)

    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', installedHandler)

    // For browsers that don't fire beforeinstallprompt, show manual install option.
    // Give a short delay to allow the event to fire first.
    const timeout = setTimeout(() => {
      if (!deferredPrompt && !isInstalled && supportsManualInstall) {
        _showManualInstructions = true
        notifyListeners()
      }
    }, 1000)

    // 5-second diagnostic timeout: on Chromium browsers, if beforeinstallprompt
    // hasn't fired, log a warning with manifest/SW status to help debug.
    // Chrome suppresses the prompt for 90 days after user dismissal —
    // fall back to manual instructions so users can still install.
    const diagnosticTimeout = setTimeout(() => {
      if (!deferredPrompt && !isInstalled && supportsAutoInstall) {
        const hasManifest = !!document.querySelector('link[rel="manifest"]')
        const hasSW = !!navigator.serviceWorker?.controller
        debugLog('pwa', 'install-prompt-missing', {
          browser, hasManifest, hasSW, isStandalone: isStandalone(),
        }, 'warn')
        if (!deferredPrompt) {
          _showManualInstructions = true
          notifyListeners()
        }
      }
    }, 5000)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      window.removeEventListener('appinstalled', installedHandler)
      mediaQuery.removeEventListener('change', displayHandler)
      clearTimeout(timeout)
      clearTimeout(diagnosticTimeout)
    }
  }, [isInstalled, supportsManualInstall, supportsAutoInstall, browser])

  // Wrap prompt() in try/catch — Chrome throws DOMException if prompt() is
  // called twice on the same event (e.g., user double-taps install button).
  const install = async () => {
    if (!deferredPrompt) return false

    try {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      debugLog('pwa', 'install-choice', { outcome })

      if (outcome === 'accepted') {
        _canInstall = false
        deferredPrompt = null
        notifyListeners()
        return true
      }
      trackInstallEvent('dismissed')
      return false
    } catch (e) {
      debugLog('pwa', 'install-prompt-error', { error: String(e) }, 'error')
      return false
    }
  }

  // Setter for manual instructions — updates module state and notifies all consumers
  const setShowManualInstructions = (value) => {
    _showManualInstructions = value
    notifyListeners()
  }

  // Data-driven install instructions — the modal just renders whatever this returns.
  // Covers 7 Chromium browsers + Safari (iOS/macOS) + Firefox (mobile/desktop).
  const getInstallInstructions = () => {
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent)
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

    // iOS non-Safari browsers cannot install PWAs — redirect to Safari.
    // Chrome/Firefox/Edge on iOS use Safari's engine but cannot trigger
    // PWA installation. Instructions explicitly tell users to open in Safari.
    if (isIOS && browser !== 'safari') {
      return {
        browser: `${BROWSER_DISPLAY_NAMES[browser]} (iOS)`,
        steps: [
          'Open this page in Safari (iOS requires Safari for PWA installation)',
          'Tap the Share button (square with arrow) at the bottom of the screen',
          'Scroll down and tap "Add to Home Screen"',
          'Tap "Add" in the top right corner',
        ],
        note: 'On iOS, only Safari can install web apps to the home screen. Other browsers use Safari\'s engine but cannot trigger PWA installation.',
      }
    }

    switch (browser) {
      case 'safari':
        if (isIOS) {
          return {
            browser: 'Safari (iOS)',
            steps: [
              'Tap the Share button (square with arrow) at the bottom of the screen',
              'Scroll down and tap "Add to Home Screen"',
              'Tap "Add" in the top right corner',
            ],
          }
        }
        return {
          browser: 'Safari (macOS)',
          steps: [
            'Click File in the menu bar',
            'Select "Add to Dock..."',
            'Click "Add" to confirm',
          ],
        }

      case 'firefox':
        if (isMobile) {
          return {
            browser: 'Firefox (Mobile)',
            steps: [
              'Tap the menu button (three dots)',
              'Tap "Add to Home screen"',
              'Tap "Add" to confirm',
            ],
          }
        }
        return {
          browser: 'Firefox (Desktop)',
          steps: [
            'Firefox desktop does not support PWA installation',
            'For the best experience, use Chrome, Edge, or Brave',
            'Alternatively, bookmark this page for quick access',
          ],
          note: 'Firefox removed PWA support for desktop in 2021.',
        }

      case 'brave':
        return {
          browser: 'Brave',
          steps: [
            'Click the install icon in the address bar (computer with down arrow)',
            'Or click the menu (≡) → "Install App..."',
            'Click "Install" to confirm',
          ],
          note: 'If the install option doesn\'t appear, check that Brave Shields isn\'t blocking it.',
        }

      case 'samsung':
        return {
          browser: 'Samsung Internet',
          steps: [
            'Tap the download icon in the address bar',
            'Or tap the menu (≡) → "Add page to" → "Home screen"',
            'Tap "Install" to confirm',
          ],
        }

      case 'opera':
        return {
          browser: 'Opera',
          steps: [
            'Tap the menu (⋮) → "Add to Home screen"',
            'Tap "Add" to confirm',
          ],
        }

      case 'vivaldi':
      case 'arc':
      case 'chrome':
      case 'edge':
        return {
          browser: BROWSER_DISPLAY_NAMES[browser],
          steps: [
            'Click the install icon in the address bar (computer with down arrow)',
            'Or click the menu (⋮) → "Install App..."',
            'Click "Install" to confirm',
          ],
        }

      default:
        return {
          browser: 'Your Browser',
          steps: [
            'Look for an "Install" or "Add to Home Screen" option in your browser menu',
            'For the best experience, use Chrome, Edge, or Brave',
          ],
        }
    }
  }

  return {
    canInstall: _canInstall,
    install,
    browser,
    isInstalled,
    showManualInstructions: _showManualInstructions,
    setShowManualInstructions,
    supportsAutoInstall,
    getInstallInstructions,
  }
}
