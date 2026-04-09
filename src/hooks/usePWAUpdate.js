// Requirement: PWA update detection with visibility-based checks and post-update suppression.
// Approach: Module-level singleton so SW state survives React remounts. Checks for updates
//   every 60 minutes and when the tab regains focus (visibilitychange). 30-second suppression
//   after user clicks "Update" prevents false re-detection during SW lifecycle settle.
// Alternatives:
//   - Hook-local state only: Rejected — re-initializes on remount, re-triggers register(),
//     causes "update available" to re-appear after navigation.
//   - No visibility check: Rejected — users who leave tabs open for days would miss updates
//     until the next hourly interval fires.
import { useEffect, useRef, useState, useCallback } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { debugLog } from '../utils/debugLog'

const CHECK_INTERVAL_MS = 60 * 60 * 1000

// Module-level state — survives component remounts
let _registration = null
let _hasUpdate = false
let _userClickedUpdate = false
const _listeners = new Set()

function notifyListeners() { _listeners.forEach(fn => fn()) }

// 30-second suppression after applying an update — prevents false re-detection
// when the browser's SW lifecycle hasn't fully settled after reload.
function wasJustUpdated() {
  try {
    const ts = sessionStorage.getItem('pwa-update-applied')
    if (!ts) return false
    return Date.now() - Number(ts) < 30_000
  } catch { return false }
}

export function usePWAUpdate() {
  const [, forceRender] = useState(0)
  const [checking, setChecking] = useState(false)
  const intervalRef = useRef()

  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      if (r) {
        _registration = r
        debugLog('pwa', 'sw-registered', { scope: r.scope })

        // Clear existing interval before setting new one (prevents leak on re-registration)
        if (intervalRef.current) clearInterval(intervalRef.current)
        intervalRef.current = setInterval(() => r.update(), CHECK_INTERVAL_MS)
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
        _registration.update()
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

  // Cleanup interval on unmount
  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  const update = useCallback(() => {
    _userClickedUpdate = true
    debugLog('pwa', 'update-triggered', 'User triggered update')
    try { sessionStorage.setItem('pwa-update-applied', String(Date.now())) } catch {}
    updateServiceWorker(true)
  }, [updateServiceWorker])

  // Manual "Check for updates" — returns typed result for toast feedback
  const checkForUpdate = useCallback(async () => {
    if (!_registration) return 'no-sw'
    setChecking(true)
    try {
      await _registration.update()
      // 1500ms settle delay for async SW lifecycle events
      await new Promise(r => setTimeout(r, 1500))
      return 'done'
    } catch (e) {
      debugLog('pwa', 'update-check-failed', { error: String(e) }, 'error')
      return 'error'
    } finally {
      setChecking(false)
    }
  }, [])

  return {
    hasUpdate: _hasUpdate || needRefresh,
    update,
    checkForUpdate,
    checking,
  }
}
