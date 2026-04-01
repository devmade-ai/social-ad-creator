// Requirement: Independent per-mode DaisyUI theme selection in the header.
// Approach: Dropdown next to the dark/light toggle showing current mode's theme list.
//   Clicking the sun/moon icon toggles dark/light mode. The dropdown shows available
//   themes for whichever mode is currently active.
// Alternatives:
//   - Paired combos: Rejected — user wants independent selection per mode.
//   - Full settings page: Rejected — overkill for theme picking.
//   - Inline in Presets tab: Rejected — UI chrome theme is not a canvas design choice.
import { useState, useRef, useEffect } from 'react'
import { lightThemes, darkThemes } from '../config/daisyuiThemes'

export default function ThemeSelector({
  isDark,
  toggleDarkMode,
  lightTheme,
  darkTheme,
  setLightTheme,
  setDarkTheme,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  const themes = isDark ? darkThemes : lightThemes
  const currentTheme = isDark ? darkTheme : lightTheme
  const setTheme = isDark ? setDarkTheme : setLightTheme
  const currentEntry = themes.find(t => t.id === currentTheme)

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [isOpen])

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen])

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex items-center gap-0.5">
        {/* Mode toggle */}
        <button
          onClick={toggleDarkMode}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          className="px-2 py-1.5 text-sm rounded-l-lg font-medium bg-base-200 text-base-content hover:bg-base-300 active:scale-95 transition-all"
        >
          {isDark ? '☀️' : '🌙'}
        </button>
        {/* Theme picker toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          title={`${isDark ? 'Dark' : 'Light'} theme: ${currentEntry?.name || currentTheme}`}
          className="px-2 py-1.5 text-sm rounded-r-lg font-medium bg-base-200 text-base-content hover:bg-base-300 active:scale-95 transition-all flex items-center gap-1"
        >
          <span className="text-xs text-base-content/70 max-w-16 truncate">{currentEntry?.name || currentTheme}</span>
          <svg className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Theme list dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-1 z-[50] bg-base-100 border border-base-300 rounded-lg shadow-lg overflow-hidden min-w-44">
          <div className="px-3 py-1.5 text-xs font-semibold text-base-content/50 uppercase tracking-wide border-b border-base-200">
            {isDark ? 'Dark' : 'Light'} themes
          </div>
          <div className="py-1 max-h-64 overflow-y-auto">
            {themes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => {
                  setTheme(theme.id)
                  setIsOpen(false)
                }}
                className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between gap-2 transition-colors ${
                  currentTheme === theme.id
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-base-content hover:bg-base-200'
                }`}
              >
                <div>
                  <div className="font-medium">{theme.name}</div>
                  <div className="text-xs text-base-content/50">{theme.description}</div>
                </div>
                {currentTheme === theme.id && (
                  <svg className="w-4 h-4 shrink-0 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
