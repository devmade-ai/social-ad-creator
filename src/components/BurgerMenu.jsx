// Requirement: Global nav menu accessible from mobile header
// Approach: Disclosure-pattern dropdown with DaisyUI menu component for list styling.
//   WAI-ARIA disclosure (not role="menu") because this is a navigation list, not an
//   application menu (File/Edit/View). DaisyUI menu provides consistent item styling
//   (padding, hover, border-radius, transitions) while the disclosure pattern handles
//   open/close, focus trap, and keyboard navigation.
// Alternatives:
//   - Hand-rolled ul/li/button styling: Replaced — DaisyUI menu gives theme-aware
//     hover states, consistent padding, and focus indicators out of the box.
//   - role="menu" pattern: Rejected — wrong ARIA semantics for navigation.
//   - DaisyUI dropdown: Rejected — doesn't support children slot or disclosure pattern.
import { useRef, useEffect, useId } from 'react'
import { debugLog } from '../utils/debugLog'
import { useDisclosureFocus } from '../hooks/useDisclosureFocus'
import { useFocusTrap } from '../hooks/useFocusTrap'

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

  // Trap focus inside menu when open — Tab/Shift+Tab cycles within menu items.
  useFocusTrap(menuRef, open)

  // Keyboard navigation: Escape closes, Arrow keys move through items.
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
        <nav
          ref={menuRef}
          id={menuId}
          aria-label="More options"
          className="absolute right-3 top-full mt-1 z-50
                     bg-base-100 rounded-xl shadow-lg
                     border border-base-300
                     max-w-[calc(100vw-2rem)] max-h-[calc(100dvh-4rem)]
                     overflow-y-auto overscroll-contain"
        >
          {/* DaisyUI menu component replaces hand-rolled ul/li/button styling */}
          <ul className="menu menu-sm min-w-[200px]">
            {visibleItems.map((item, i) => (
              <li key={item.label || `sep-${i}`}>
                <button
                  type="button"
                  onClick={() => {
                    try { item.action() } catch (e) { console.error('Menu action failed:', e) }
                    onClose()
                  }}
                  className={`min-h-11 ${
                    item.highlight
                      ? item.highlightColor || 'text-primary'
                      : ''
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
      )}
    </>
  )
}
