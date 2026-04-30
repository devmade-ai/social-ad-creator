// Requirement: Combo-based DaisyUI theme selection with dark/light toggle,
//   light-mode default, cross-tab sync, safe storage, and dynamic meta theme-color.
// Approach: User picks a combo (e.g. Mono, Luxe); each combo pairs a light + dark theme.
//   Dark/light toggle switches between the combo's themes. Dual-layer theming:
//   .dark class on <html> for Tailwind dark: utilities, data-theme for DaisyUI.
//   First-visit default is light (fantasy) — brand-aligned with PWA icon palette.
// Alternatives:
//   - Independent per-mode selection: Rejected — simplified to combos for fewer choices.
//   - CSS-only prefers-color-scheme: Rejected — no user override possible.
//   - Honor prefers-color-scheme on first visit: Rejected — brand consistency on first
//     impression outweighs OS signal; users can still toggle and the preference persists.
import { useState, useEffect, useCallback, useRef } from 'react'
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

export function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    const stored = safeStorageGet('darkMode')
    if (stored !== null) return stored === 'true'
    return false
  })

  // Combo selection — one choice controls both light and dark themes.
  // localStorage key: 'themeCombo'. Validated on init.
  const [comboId, setComboIdState] = useState(
    () => validCombo(safeStorageGet('themeCombo'))
  )

  const combo = getCombo(comboId)
  const activeTheme = isDark ? combo.dark.id : combo.light.id

  // Ref for logging inside effect without adding comboId as a dependency.
  // activeTheme is already derived from comboId + isDark, so comboId in the dep
  // array would cause the effect to fire twice per combo change.
  const comboIdRef = useRef(comboId)
  useEffect(() => { comboIdRef.current = comboId }, [comboId])

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
    debugLog('dark-mode', 'theme-applied', { isDark, activeTheme, combo: comboIdRef.current })

    // Update ALL meta theme-color tags so Android Chrome address bar syncs.
    const color = getMetaColor(activeTheme)
    document.querySelectorAll('meta[name="theme-color"]').forEach(meta => {
      meta.setAttribute('content', color)
    })
  }, [isDark, activeTheme])

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
        const newDark = e.newValue !== null ? e.newValue === 'true' : false
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
