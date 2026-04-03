// Requirement: Combo-based DaisyUI theme selection with dark/light toggle,
//   system fallback, cross-tab sync, safe storage, and dynamic meta theme-color.
// Approach: User picks a combo (e.g. Mono, Luxe); each combo pairs a light + dark theme.
//   Dark/light toggle switches between the combo's themes. Dual-layer theming:
//   .dark class on <html> for Tailwind dark: utilities, data-theme for DaisyUI.
// Alternatives:
//   - Independent per-mode selection: Rejected — simplified to combos for fewer choices.
//   - CSS-only prefers-color-scheme: Rejected — no user override possible.
import { useState, useEffect, useCallback } from 'react'
import { debugLog } from '../utils/debugLog'
import {
  themeCombos,
  DEFAULT_COMBO,
  getMetaColor,
  getCombo,
} from '../config/daisyuiThemes'

// Safe localStorage wrappers — localStorage throws SecurityError in sandboxed
// iframes, disabled-storage settings, and some enterprise environments.
function safeStorageGet(key) {
  try { return localStorage.getItem(key) } catch { return null }
}

function safeStorageSet(key, value) {
  try { localStorage.setItem(key, value) } catch { /* sandboxed iframe, disabled storage */ }
}

// Validate a combo ID exists in the catalog.
const comboIds = new Set(themeCombos.map(c => c.id))

function validCombo(id) {
  return comboIds.has(id) ? id : DEFAULT_COMBO
}

// One-time migration from old independent theme keys to combo key.
// If user had lightTheme/darkTheme but no themeCombo, infer the combo
// from their dark theme (luxury → luxe, anything else → mono).
// Runs once on module load; cleans up old keys.
function migrateOldThemeKeys() {
  try {
    if (localStorage.getItem('themeCombo') !== null) return
    const oldDark = localStorage.getItem('darkTheme')
    if (oldDark === null) return
    const combo = oldDark === 'luxury' ? 'luxe' : 'mono'
    localStorage.setItem('themeCombo', combo)
    localStorage.removeItem('lightTheme')
    localStorage.removeItem('darkTheme')
  } catch { /* sandboxed/disabled storage */ }
}
migrateOldThemeKeys()

export function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    const stored = safeStorageGet('darkMode')
    if (stored !== null) return stored === 'true'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  // Combo selection — one choice controls both light and dark themes.
  // localStorage key: 'themeCombo'. Validated on init.
  const [comboId, setComboIdState] = useState(
    () => validCombo(safeStorageGet('themeCombo'))
  )

  const combo = getCombo(comboId)
  const activeTheme = isDark ? combo.dark.id : combo.light.id

  // Apply .dark class + data-theme to <html>, persist, and update meta theme-color.
  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    root.setAttribute('data-theme', activeTheme)
    safeStorageSet('darkMode', isDark)
    debugLog('dark-mode', 'theme-applied', { isDark, activeTheme, combo: comboId })

    // Update ALL meta theme-color tags so Android Chrome address bar syncs.
    const color = getMetaColor(activeTheme)
    document.querySelectorAll('meta[name="theme-color"]').forEach(meta => {
      meta.setAttribute('content', color)
    })
  }, [isDark, activeTheme, comboId])

  // Setter that validates + persists combo to localStorage.
  const setCombo = useCallback((id) => {
    const valid = validCombo(id)
    if (valid !== id) debugLog('dark-mode', 'invalid-combo', { requested: id, fallback: valid }, 'warn')
    setComboIdState(valid)
    safeStorageSet('themeCombo', valid)
    debugLog('dark-mode', 'combo-set', { combo: valid })
  }, [])

  // Cross-tab sync — when another tab changes theme keys in localStorage,
  // update this tab to match.
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'darkMode') {
        const newDark = e.newValue !== null ? e.newValue === 'true' : window.matchMedia('(prefers-color-scheme: dark)').matches
        setIsDark(newDark)
        debugLog('dark-mode', 'cross-tab-sync', { key: 'darkMode', value: newDark })
      } else if (e.key === 'themeCombo' && e.newValue) {
        const valid = validCombo(e.newValue)
        setComboIdState(valid)
        debugLog('dark-mode', 'cross-tab-sync', { key: 'themeCombo', value: valid })
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  // Track OS preference changes — only when user hasn't made an explicit choice
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e) => {
      if (safeStorageGet('darkMode') === null) setIsDark(e.matches)
    }
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const toggle = () => setIsDark((prev) => !prev)

  return {
    isDark,
    toggle,
    setIsDark,
    // Combo-based theme selection
    comboId,
    activeTheme,
    setCombo,
  }
}
