// Requirement: Independent per-mode DaisyUI theme selection with dark/light toggle,
//   system fallback, cross-tab sync, safe storage, and dynamic meta theme-color.
// Approach: Each mode (light/dark) stores its own DaisyUI theme choice in localStorage.
//   Dual-layer theming: .dark class on <html> for Tailwind dark: utilities, data-theme
//   attribute for DaisyUI component colors. Both set together on every change.
//   All theme IDs are validated against the catalog — invalid values fall back to defaults.
// Alternatives:
//   - Paired combos (glow-props pattern): Rejected — user wants independent per-mode selection.
//   - CSS-only prefers-color-scheme: Rejected — no user override possible.
//   - data-theme only: Rejected — Tailwind dark: utilities need .dark class.
import { useState, useEffect, useCallback } from 'react'
import { debugLog } from '../utils/debugLog'
import {
  lightThemes,
  darkThemes,
  DEFAULT_LIGHT_THEME,
  DEFAULT_DARK_THEME,
  getMetaColor,
} from '../config/daisyuiThemes'

// Safe localStorage wrappers — localStorage throws SecurityError in sandboxed
// iframes, disabled-storage settings, and some enterprise environments.
function safeStorageGet(key) {
  try { return localStorage.getItem(key) } catch { return null }
}

function safeStorageSet(key, value) {
  try { localStorage.setItem(key, value) } catch { /* sandboxed iframe, disabled storage */ }
}

// Validate a theme ID exists in its respective catalog array.
// Returns the ID if valid, or the default for that mode if not.
// Prevents garbage localStorage values or cross-mode mismatches
// (e.g. a light theme ID stored as darkTheme) from producing unstyled pages.
const lightIds = new Set(lightThemes.map(t => t.id))
const darkIds = new Set(darkThemes.map(t => t.id))

function validLightTheme(id) {
  return lightIds.has(id) ? id : DEFAULT_LIGHT_THEME
}

function validDarkTheme(id) {
  return darkIds.has(id) ? id : DEFAULT_DARK_THEME
}

export function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    const stored = safeStorageGet('darkMode')
    if (stored !== null) return stored === 'true'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  // Per-mode theme selection — each mode remembers its own DaisyUI theme.
  // localStorage keys: 'lightTheme', 'darkTheme'
  // Validated on init: invalid/missing values fall back to defaults.
  const [lightTheme, setLightThemeState] = useState(
    () => validLightTheme(safeStorageGet('lightTheme'))
  )
  const [darkTheme, setDarkThemeState] = useState(
    () => validDarkTheme(safeStorageGet('darkTheme'))
  )

  // The currently active DaisyUI theme (based on mode)
  const activeTheme = isDark ? darkTheme : lightTheme

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
    debugLog('dark-mode', 'theme-applied', { isDark, activeTheme })

    // Update ALL meta theme-color tags so Android Chrome address bar syncs.
    const color = getMetaColor(activeTheme)
    document.querySelectorAll('meta[name="theme-color"]').forEach(meta => {
      meta.setAttribute('content', color)
    })
  }, [isDark, activeTheme])

  // Setters that validate + persist to localStorage.
  // Invalid IDs are silently corrected to defaults — no crash, no unstyled page.
  const setLightTheme = useCallback((themeId) => {
    const valid = validLightTheme(themeId)
    if (valid !== themeId) debugLog('dark-mode', 'invalid-light-theme', { requested: themeId, fallback: valid }, 'warn')
    setLightThemeState(valid)
    safeStorageSet('lightTheme', valid)
    debugLog('dark-mode', 'light-theme-set', { theme: valid })
  }, [])

  const setDarkTheme = useCallback((themeId) => {
    const valid = validDarkTheme(themeId)
    if (valid !== themeId) debugLog('dark-mode', 'invalid-dark-theme', { requested: themeId, fallback: valid }, 'warn')
    setDarkThemeState(valid)
    safeStorageSet('darkTheme', valid)
    debugLog('dark-mode', 'dark-theme-set', { theme: valid })
  }, [])

  // Cross-tab sync — when another tab changes any theme key in localStorage,
  // update this tab to match. Values are validated to prevent garbage from
  // producing unstyled pages.
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'darkMode') {
        const newDark = e.newValue !== null ? e.newValue === 'true' : window.matchMedia('(prefers-color-scheme: dark)').matches
        setIsDark(newDark)
        debugLog('dark-mode', 'cross-tab-sync', { key: 'darkMode', value: newDark })
      } else if (e.key === 'lightTheme' && e.newValue) {
        const valid = validLightTheme(e.newValue)
        setLightThemeState(valid)
        debugLog('dark-mode', 'cross-tab-sync', { key: 'lightTheme', value: valid })
      } else if (e.key === 'darkTheme' && e.newValue) {
        const valid = validDarkTheme(e.newValue)
        setDarkThemeState(valid)
        debugLog('dark-mode', 'cross-tab-sync', { key: 'darkTheme', value: valid })
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
    // Per-mode theme selection
    lightTheme,
    darkTheme,
    activeTheme,
    setLightTheme,
    setDarkTheme,
  }
}
