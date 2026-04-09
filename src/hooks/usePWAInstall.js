// Requirement: PWA install prompt with browser-specific fallback instructions.
// Approach: Capture beforeinstallprompt via inline script in index.html (fires before
//   React mounts), then this hook reads window.__pwaInstallPrompt on mount. For browsers
//   that don't support beforeinstallprompt (Safari, Firefox), show manual install steps.
// Architecture: Module-level singleton — canInstall and showManualInstructions live at
//   module scope so all hook consumers share the same state. Without this, each hook
//   instance has independent React state that diverges (e.g., one sets canInstall=false
//   after install but others still show the button).
// Alternatives:
//   - Capture event in React only: Rejected - race condition on cached SW repeat visits
//     where the event fires before React mounts and is lost.
//   - Skip non-Chromium browsers: Rejected - Safari/Firefox users can still install PWAs
//     manually; showing instructions is better than hiding the feature.
//   - Per-instance React state: Rejected - multiple consumers get out of sync.
import { useState, useEffect, useMemo } from 'react'
import { debugLog } from '../utils/debugLog'

// Module-level state — survives remounts and shared across all consumers
let deferredPrompt = window.__pwaInstallPrompt || null
// Initialize from captured prompt — avoids an extra render cycle when the
// inline script in index.html already captured beforeinstallprompt.
let _canInstall = !!deferredPrompt && !isStandalone()
let _showManualInstructions = false
const _listeners = new Set()

function notifyListeners() { _listeners.forEach(fn => fn()) }

// Detect browser type
function detectBrowser() {
  const ua = navigator.userAgent

  // Check for Brave (has navigator.brave)
  if (navigator.brave) {
    return 'brave'
  }

  // Check for Firefox
  if (ua.includes('Firefox')) {
    return 'firefox'
  }

  // Check for Safari (but not Chrome which also has Safari in UA)
  if (ua.includes('Safari') && !ua.includes('Chrome') && !ua.includes('Chromium')) {
    return 'safari'
  }

  // Check for Edge
  if (ua.includes('Edg/')) {
    return 'edge'
  }

  // Check for Chrome/Chromium
  if (ua.includes('Chrome') || ua.includes('Chromium')) {
    return 'chrome'
  }

  return 'unknown'
}

// Check if running as installed PWA
function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  )
}

export function usePWAInstall() {
  const [, forceRender] = useState(0)

  const browser = useMemo(() => detectBrowser(), [])
  const isInstalled = useMemo(() => isStandalone(), [])

  // Browsers that support beforeinstallprompt
  const supportsAutoInstall = browser === 'chrome' || browser === 'edge' || browser === 'brave'

  // Browsers where manual install is possible
  const supportsManualInstall = browser === 'safari' || browser === 'firefox'

  // Sync module state to React — all consumers re-render on state change
  useEffect(() => {
    const listener = () => forceRender(n => n + 1)
    _listeners.add(listener)
    return () => { _listeners.delete(listener) }
  }, [])

  useEffect(() => {
    // Already installed - no install option needed
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
    }

    const installedHandler = () => {
      _canInstall = false
      deferredPrompt = null
      notifyListeners()
      debugLog('pwa', 'app-installed', { browser })
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

    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', installedHandler)

    // For browsers that don't fire beforeinstallprompt, show manual install option
    // Give a short delay to allow the event to fire first
    const timeout = setTimeout(() => {
      if (!deferredPrompt && !isInstalled && supportsManualInstall) {
        _showManualInstructions = true
        notifyListeners()
      }
    }, 1000)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      window.removeEventListener('appinstalled', installedHandler)
      clearTimeout(timeout)
    }
  }, [isInstalled, supportsManualInstall])

  const install = async () => {
    if (!deferredPrompt) return false

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    debugLog('pwa', 'install-choice', { outcome })

    if (outcome === 'accepted') {
      _canInstall = false
      deferredPrompt = null
      notifyListeners()
      return true
    }
    return false
  }

  // Setter for manual instructions — updates module state and notifies all consumers
  const setShowManualInstructions = (value) => {
    _showManualInstructions = value
    notifyListeners()
  }

  // Get browser-specific install instructions
  const getInstallInstructions = () => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent)

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
            'Or click the menu (≡) → "Install CanvaGrid..."',
            'Click "Install" to confirm',
          ],
          note: 'If the install option doesn\'t appear, check that Brave Shields isn\'t blocking it.',
        }

      case 'chrome':
      case 'edge':
        return {
          browser: browser === 'edge' ? 'Microsoft Edge' : 'Google Chrome',
          steps: [
            'Click the install icon in the address bar (computer with down arrow)',
            `Or click the menu (⋮) → "Install CanvaGrid..."`,
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
