import { useState, useEffect, useMemo } from 'react'

let deferredPrompt = null

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
  const [canInstall, setCanInstall] = useState(false)
  const [showManualInstructions, setShowManualInstructions] = useState(false)

  const browser = useMemo(() => detectBrowser(), [])
  const isInstalled = useMemo(() => isStandalone(), [])

  // Browsers that support beforeinstallprompt
  const supportsAutoInstall = browser === 'chrome' || browser === 'edge' || browser === 'brave'

  // Browsers where manual install is possible
  const supportsManualInstall = browser === 'safari' || browser === 'firefox'

  useEffect(() => {
    // Already installed - no install option needed
    if (isInstalled) {
      setCanInstall(false)
      return
    }

    const handler = (e) => {
      e.preventDefault()
      deferredPrompt = e
      setCanInstall(true)
    }

    const installedHandler = () => {
      setCanInstall(false)
      deferredPrompt = null
    }

    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', installedHandler)

    // For browsers that don't fire beforeinstallprompt, show manual install option
    // Give a short delay to allow the event to fire first
    const timeout = setTimeout(() => {
      if (!deferredPrompt && !isInstalled && supportsManualInstall) {
        setShowManualInstructions(true)
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

    if (outcome === 'accepted') {
      setCanInstall(false)
      deferredPrompt = null
      return true
    }
    return false
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
            'Or click the menu (≡) → "Install Social Ad Creator..."',
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
            `Or click the menu (⋮) → "Install Social Ad Creator..."`,
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
    canInstall,
    install,
    browser,
    isInstalled,
    showManualInstructions,
    setShowManualInstructions,
    supportsAutoInstall,
    getInstallInstructions,
  }
}
