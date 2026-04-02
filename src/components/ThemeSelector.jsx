// Requirement: Independent per-mode DaisyUI theme selection in the header.
// Approach: Disclosure-pattern dropdown (WAI-ARIA, matching BurgerMenu.jsx pattern)
//   next to the dark/light toggle showing current mode's theme list.
//   Clicking sun/moon toggles mode. Dropdown shows themes for active mode.
// Alternatives:
//   - Paired combos (glow-props pattern): Rejected — user wants independent per-mode selection.
//   - Full settings page: Rejected — overkill for theme picking.
//   - Inline in Presets tab: Rejected — UI chrome theme is not a canvas design choice.
//   - role="menu" pattern: Rejected — wrong ARIA semantics (see BurgerMenu.jsx comment).
import { useState, useRef, useEffect, useId, useCallback } from 'react'
import { lightThemes, darkThemes } from '../config/daisyuiThemes'
import { useDisclosureFocus } from '../hooks/useDisclosureFocus'
import ThemeList from './ThemeList'

export default function ThemeSelector({
  isDark,
  toggleDarkMode,
  lightTheme,
  darkTheme,
  setLightTheme,
  setDarkTheme,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownId = useId()
  const triggerRef = useRef(null)
  const listRef = useRef(null)

  const themes = isDark ? darkThemes : lightThemes
  const currentTheme = isDark ? darkTheme : lightTheme
  const setTheme = isDark ? setDarkTheme : setLightTheme
  const currentEntry = themes.find(t => t.id === currentTheme)

  const close = useCallback(() => setIsOpen(false), [])

  // Close dropdown when mode changes — the theme list switches from light to dark
  // themes, so keeping it open would show a jarring instant swap.
  useEffect(() => {
    setIsOpen(false)
  }, [isDark])

  useDisclosureFocus(isOpen, { triggerRef, contentRef: listRef, selector: 'button' })

  // Close on outside click
  // Requirement: mousedown (not click) prevents race condition where click
  // fires on the trigger AND on the document in the same event cycle.
  useEffect(() => {
    if (!isOpen) return
    const wrapperRef = triggerRef.current?.closest('[data-theme-selector]')
    const handleMouseDown = (e) => {
      if (wrapperRef && !wrapperRef.contains(e.target)) close()
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [isOpen, close])

  // Keyboard navigation: Escape closes, Arrow keys move through items
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        close()
        return
      }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Home' || e.key === 'End') {
        e.preventDefault()
        const buttons = Array.from(listRef.current?.querySelectorAll('button') || [])
        if (buttons.length === 0) return
        const currentIndex = buttons.indexOf(document.activeElement)
        let nextIndex
        if (e.key === 'ArrowDown') nextIndex = currentIndex < buttons.length - 1 ? currentIndex + 1 : 0
        else if (e.key === 'ArrowUp') nextIndex = currentIndex > 0 ? currentIndex - 1 : buttons.length - 1
        else if (e.key === 'Home') nextIndex = 0
        else if (e.key === 'End') nextIndex = buttons.length - 1
        buttons[nextIndex]?.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, close])

  return (
    <div className="relative" data-theme-selector>
      <div className="flex items-center gap-0.5">
        {/* Mode toggle — min 44px touch target on mobile */}
        <button
          onClick={toggleDarkMode}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center text-sm rounded-l-lg font-medium bg-base-200 text-base-content hover:bg-base-300 active:scale-95 transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {isDark ? '☀️' : '🌙'}
        </button>
        {/* Theme picker trigger — min 44px touch target on mobile */}
        <button
          ref={triggerRef}
          onClick={() => setIsOpen(!isOpen)}
          aria-label={`${isDark ? 'Dark' : 'Light'} theme: ${currentEntry?.name || currentTheme}`}
          aria-expanded={isOpen}
          aria-controls={dropdownId}
          className="min-h-[44px] px-2 text-sm rounded-r-lg font-medium bg-base-200 text-base-content hover:bg-base-300 active:scale-95 transition-all flex items-center gap-1 outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <span className="text-xs text-base-content/70 max-w-16 truncate">{currentEntry?.name || currentTheme}</span>
          <svg className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Theme list dropdown — z-[50] per z-index scale (menu dropdown layer) */}
      {isOpen && (
        <div
          ref={listRef}
          id={dropdownId}
          aria-label={`${isDark ? 'Dark' : 'Light'} themes`}
          className="absolute right-0 top-full mt-1 z-[50] bg-base-100 border border-base-300 rounded-lg shadow-lg overflow-hidden min-w-44"
        >
          <div className="px-3 py-1.5 text-xs font-semibold text-base-content/50 uppercase tracking-wide border-b border-base-200">
            {isDark ? 'Dark' : 'Light'} themes
          </div>
          <ThemeList
            themes={themes}
            currentTheme={currentTheme}
            onSelect={(id) => { setTheme(id); close() }}
            className="py-1 max-h-64 overflow-y-auto overscroll-contain"
          />
        </div>
      )}
    </div>
  )
}
