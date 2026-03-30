// Requirement: User-controlled dark/light mode with system fallback, cross-tab sync,
//   safe storage, and dynamic meta theme-color.
// Approach: localStorage persistence with try/catch wrappers, .dark class on <html>,
//   matchMedia listener, storage event for cross-tab sync, querySelectorAll for
//   meta theme-color update on manual toggle.
// Alternatives:
//   - CSS-only prefers-color-scheme: Rejected — no user override possible
//   - React Context: Rejected — overkill for web (DOM class is the source of truth)
import { useState, useEffect } from 'react'

// Safe localStorage wrappers — localStorage throws SecurityError in sandboxed
// iframes, disabled-storage settings, and some enterprise environments.
// Wrapping both reads and writes ensures the hook degrades to system preference
// instead of crashing.
function safeStorageGet(key) {
  try { return localStorage.getItem(key) } catch { return null }
}

function safeStorageSet(key, value) {
  try { localStorage.setItem(key, value) } catch { /* sandboxed iframe, disabled storage */ }
}

// Meta theme-color values — must match --color-surface tokens in index.css.
// Light = body background (#FAFAFA), Dark = dark-page (#0F0F23).
const THEME_COLOR_LIGHT = '#FAFAFA'
const THEME_COLOR_DARK = '#0F0F23'

export function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    const stored = safeStorageGet('darkMode')
    if (stored !== null) return stored === 'true'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  // Apply .dark class to <html>, persist, and update meta theme-color.
  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    safeStorageSet('darkMode', isDark)

    // Update ALL meta theme-color tags so Android Chrome address bar syncs
    // with manual toggles. querySelectorAll (not querySelector) is required
    // because index.html has two tags with different media attributes —
    // querySelector only returns the first one, leaving the second stale.
    const color = isDark ? THEME_COLOR_DARK : THEME_COLOR_LIGHT
    document.querySelectorAll('meta[name="theme-color"]').forEach(meta => {
      meta.setAttribute('content', color)
    })
  }, [isDark])

  // Cross-tab sync — when another tab changes darkMode in localStorage,
  // update this tab to match. The storage event only fires in OTHER tabs
  // (not the one that wrote), so there's no infinite loop risk.
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'darkMode' && e.newValue !== null) {
        setIsDark(e.newValue === 'true')
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

  return { isDark, toggle, setIsDark }
}
