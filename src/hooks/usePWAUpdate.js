// Requirement: PWA update detection with visibility-based checks and post-update suppression.
// Approach: Module-level singleton so SW state survives React remounts. Checks for updates
//   every 60 minutes and when the tab regains focus (visibilitychange). 30-second suppression
//   after user clicks "Update" prevents false re-detection during SW lifecycle settle.
// Alternatives:
//   - Hook-local state only: Rejected — re-initializes on remount, re-triggers register(),
//     causes "update available" to re-appear after navigation.
//   - No visibility check: Rejected — users who leave tabs open for days would miss updates
//     until the next hourly interval fires.
import { useEffect, useState, useCallback } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { debugLog } from '../utils/debugLog'
import { wasJustUpdated } from '../utils/pwaHelpers'

const CHECK_INTERVAL_MS = 60 * 60 * 1000
// SW lifecycle events (onNeedRefresh, onOfflineReady) fire asynchronously after
// registration.update(). No event signals "check complete", so we settle with a delay.
const UPDATE_CHECK_SETTLE_MS = 1500

// Module-level state — survives component remounts
let _registration = null
let _hasUpdate = false
let _userClickedUpdate = false
let _isChecking = false
const _listeners = new Set()

function notifyListeners() { _listeners.forEach(fn => fn()) }

export function usePWAUpdate() {
  const [, forceRender] = useState(0)
  const [checking, setChecking] = useState(false)
  // Requirement: Interval must survive React Strict Mode double-mount.
  // Approach: registered state flag triggers the interval effect. useRegisterSW uses
  //   useState lazy initializer internally — onRegistered only fires once, not on re-mount.
  //   Without this flag, Strict Mode cleanup kills the interval and it's never recreated.
  const [registered, setRegistered] = useState(false)

  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      if (r) {
        _registration = r
        setRegistered(true)
        debugLog('pwa', 'sw-registered', { scope: r.scope })
      }
    },
    onNeedRefresh() {
      if (wasJustUpdated()) return
      _hasUpdate = true
      debugLog('pwa', 'update-available', 'New version available')
      notifyListeners()
    },
    onOfflineReady() {
      debugLog('pwa', 'offline-ready', 'App ready for offline use')
    },
    onRegisterError(error) {
      debugLog('pwa', 'sw-register-error', { error: String(error) }, 'error')
    },
  })

  // Sync module state to React
  useEffect(() => {
    const listener = () => forceRender(n => n + 1)
    _listeners.add(listener)
    return () => { _listeners.delete(listener) }
  }, [])

  // Visibility-based update checks — catches updates when user returns to tab
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && _registration) {
        _registration.update().catch(() => {})
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  // controllerchange reload guard — auto-reload once when new SW takes control,
  // but ONLY if the user explicitly clicked "Update"
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    let refreshing = false
    const handleController = () => {
      if (refreshing || !_userClickedUpdate) return
      refreshing = true
      window.location.reload()
    }
    navigator.serviceWorker.addEventListener('controllerchange', handleController)
    return () => navigator.serviceWorker.removeEventListener('controllerchange', handleController)
  }, [])

  // Hourly update check interval — depends on registered flag so it re-creates
  // after Strict Mode cleanup/re-mount (onRegistered only fires once).
  useEffect(() => {
    if (!registered || !_registration) return
    const id = setInterval(() => {
      _registration.update().catch(() => {})
    }, CHECK_INTERVAL_MS)
    return () => clearInterval(id)
  }, [registered])

  const update = useCallback(() => {
    _userClickedUpdate = true
    debugLog('pwa', 'update-triggered', 'User triggered update')
    try { sessionStorage.setItem('pwa-update-applied', String(Date.now())) } catch { /* sessionStorage may be unavailable in private browsing */ }
    updateServiceWorker(true)
  }, [updateServiceWorker])

  // Manual "Check for updates" — returns typed result for toast feedback.
  // Module-level _isChecking guard prevents concurrent calls from overlapping
  // (e.g., user double-taps "Check for updates" button).
  const checkForUpdate = useCallback(async () => {
    if (!_registration) return 'no-sw'
    if (_isChecking) return 'checking'
    _isChecking = true
    setChecking(true)
    try {
      await _registration.update()
      await new Promise(r => setTimeout(r, UPDATE_CHECK_SETTLE_MS))
      return 'done'
    } catch (e) {
      debugLog('pwa', 'update-check-failed', { error: String(e) }, 'error')
      return 'error'
    } finally {
      _isChecking = false
      setChecking(false)
    }
  }, [])

  return {
    // Gate needRefresh with wasJustUpdated() — the library sets needRefresh
    // internally regardless of what onNeedRefresh does, so without this check
    // the 30-second suppression could be bypassed.
    hasUpdate: _hasUpdate || (needRefresh && !wasJustUpdated()),
    update,
    checkForUpdate,
    checking,
  }
}
