// Requirement: Independent per-mode DaisyUI theme selection with dark/light toggle,
//   system fallback, cross-tab sync, safe storage, and dynamic meta theme-color.
// Approach: Each mode (light/dark) stores its own DaisyUI theme choice in localStorage.
//   Dual-layer theming: .dark class on <html> for Tailwind dark: utilities, data-theme
//   attribute for DaisyUI component colors. Both set together on every change.
// Alternatives:
//   - Paired combos (glow-props pattern): Rejected — user wants independent per-mode selection.
//   - CSS-only prefers-color-scheme: Rejected — no user override possible.
//   - data-theme only: Rejected — Tailwind dark: utilities need .dark class.
import { useState, useEffect, useCallback } from 'react'
import {
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

export function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    const stored = safeStorageGet('darkMode')
    if (stored !== null) return stored === 'true'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  // Per-mode theme selection — each mode remembers its own DaisyUI theme.
  // localStorage keys: 'lightTheme', 'darkTheme'
  const [lightTheme, setLightThemeState] = useState(
    () => safeStorageGet('lightTheme') || DEFAULT_LIGHT_THEME
  )
  const [darkTheme, setDarkThemeState] = useState(
    () => safeStorageGet('darkTheme') || DEFAULT_DARK_THEME
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

    // Update ALL meta theme-color tags so Android Chrome address bar syncs.
    const color = getMetaColor(activeTheme)
    document.querySelectorAll('meta[name="theme-color"]').forEach(meta => {
      meta.setAttribute('content', color)
    })
  }, [isDark, activeTheme])

  // Setters that persist to localStorage
  const setLightTheme = useCallback((themeId) => {
    setLightThemeState(themeId)
    safeStorageSet('lightTheme', themeId)
  }, [])

  const setDarkTheme = useCallback((themeId) => {
    setDarkThemeState(themeId)
    safeStorageSet('darkTheme', themeId)
  }, [])

  // Cross-tab sync — when another tab changes any theme key in localStorage,
  // update this tab to match.
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'darkMode') {
        if (e.newValue !== null) {
          setIsDark(e.newValue === 'true')
        } else {
          setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches)
        }
      } else if (e.key === 'lightTheme' && e.newValue) {
        setLightThemeState(e.newValue)
      } else if (e.key === 'darkTheme' && e.newValue) {
        setDarkThemeState(e.newValue)
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
