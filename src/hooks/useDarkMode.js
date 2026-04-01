// Requirement: User-controlled dark/light mode with system fallback, cross-tab sync,
//   safe storage, dynamic meta theme-color, and DaisyUI data-theme sync.
// Approach: localStorage persistence with try/catch wrappers, dual-layer theming:
//   .dark class on <html> for Tailwind dark: utilities, data-theme attribute for
//   DaisyUI component colors. Both must be set together.
// Alternatives:
//   - CSS-only prefers-color-scheme: Rejected — no user override possible
//   - React Context: Rejected — overkill for web (DOM class is the source of truth)
//   - data-theme only: Rejected — Tailwind dark: utilities need .dark class
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

// DaisyUI theme names — must match the themes registered in index.css @plugin directive.
const DAISYUI_LIGHT = 'nord'
const DAISYUI_DARK = 'night'

// Meta theme-color values — match DaisyUI theme primary colors for PWA status bar.
// Light = nord primary (#5E81AC), Dark = night base-100 (#0F172A).
const THEME_COLOR_LIGHT = '#5E81AC'
const THEME_COLOR_DARK = '#0F172A'

export function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    const stored = safeStorageGet('darkMode')
    if (stored !== null) return stored === 'true'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  // Apply .dark class + data-theme to <html>, persist, and update meta theme-color.
  // Requirement: DaisyUI uses data-theme for component colors; Tailwind uses .dark
  // for dark: utility variants. Both must be synced together on every toggle.
  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add('dark')
      root.setAttribute('data-theme', DAISYUI_DARK)
    } else {
      root.classList.remove('dark')
      root.setAttribute('data-theme', DAISYUI_LIGHT)
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
  // When newValue is null (key was removed), fall back to system preference
  // instead of keeping the stale value — matches what the hook does on
  // fresh load with no stored preference.
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'darkMode') {
        if (e.newValue !== null) {
          setIsDark(e.newValue === 'true')
        } else {
          setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches)
        }
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
