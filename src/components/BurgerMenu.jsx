// Requirement: Global nav menu accessible from mobile header
// Approach: Disclosure-pattern dropdown with backdrop (WAI-ARIA disclosure, not role="menu")
// Why disclosure, not role="menu": ARIA menu pattern is for application menus
//   (File/Edit/View). Screen readers enter forms mode, suppress normal nav keys,
//   and expect arrow-key navigation. A burger nav is a disclosure — a list of
//   actions revealed by a toggle.
// Ref: glow-props burger menu implementation — same disclosure pattern, same z-index
//   scale, same focus management. Adapted from vanilla JS to React.
// Alternatives:
//   - role="menu" pattern: Rejected — wrong ARIA semantics for navigation
//   - Slide-out drawer: Rejected — needs animation lib, fights with bottom nav
//   - Headless UI Disclosure: Viable — adds dependency for a single component
import { useRef, useEffect, useId } from 'react'
import { debugLog } from '../utils/debugLog'
import { useDisclosureFocus } from '../hooks/useDisclosureFocus'

export default function BurgerMenu({ items, open, onToggle, onClose, children }) {
  const menuId = useId()
  const triggerRef = useRef(null)
  const menuRef = useRef(null)
  const hasLoggedRef = useRef(false)

  const visibleItems = items.filter((item) => item.visible !== false)

  // Log menu state transitions for debug pill visibility.
  useEffect(() => {
    if (open) { hasLoggedRef.current = true; debugLog('burger-menu', 'opened') }
    else if (hasLoggedRef.current) debugLog('burger-menu', 'closed')
  }, [open])

  useDisclosureFocus(open, { triggerRef, contentRef: menuRef, selector: 'button, a' })

  // Keyboard navigation: Escape closes, Arrow keys move through items.
  // Matches ThemeSelector keyboard pattern for consistent disclosure UX.
  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); return }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Home' || e.key === 'End') {
        e.preventDefault()
        const buttons = Array.from(menuRef.current?.querySelectorAll('button') || [])
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
  }, [open, onClose])

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={onToggle}
        title="More options"
        aria-label="Menu"
        aria-expanded={open}
        aria-controls={menuId}
        className="p-2 rounded-lg text-base-content hover:bg-base-200 transition-colors"
      >
        <svg className="w-5 h-5" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
      </button>

      {/* Backdrop is rendered by the parent (MobileLayout) OUTSIDE the header
          stacking context so it can cover the full viewport. The header's
          backdrop-blur-sm creates a stacking context that traps fixed children. */}

      {open && (
        <>
          <nav
            ref={menuRef}
            id={menuId}
            aria-label="More options"
            className="absolute right-3 top-full mt-1 z-50
                       bg-base-100 rounded-xl shadow-lg
                       border border-base-300 py-1 min-w-[200px]
                       max-w-[calc(100vw-2rem)] max-h-[calc(100dvh-4rem)]
                       overflow-y-auto overscroll-contain"
          >
            <ul className="list-none m-0 p-0">
              {visibleItems.map((item, i) => (
                <li key={item.label || `sep-${i}`}>
                  <button
                    type="button"
                    onClick={() => {
                      try { item.action() } catch (e) { console.error('Menu action failed:', e) }
                      onClose()
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors
                      outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset
                      min-h-11
                      ${item.highlight
                        ? `${item.highlightColor || 'text-primary'} hover:bg-primary/5`
                        : 'text-base-content hover:bg-base-200'
                      }`}
                  >
                    <svg className="w-4 h-4 shrink-0" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                    </svg>
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
            {children}
          </nav>
        </>
      )}
    </>
  )
}
