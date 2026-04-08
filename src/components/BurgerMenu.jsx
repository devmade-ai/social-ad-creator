// Requirement: Global nav menu accessible from mobile header.
// Approach: Disclosure-pattern dropdown with DaisyUI menu component for list styling.
//   WAI-ARIA disclosure (not role="menu") because this is a navigation list, not an
//   application menu (File/Edit/View). DaisyUI menu provides consistent item styling.
//   Owns its own backdrop with cursor-pointer for iOS Safari click support.
//   Close-then-act pattern: menu closes first, action executes after 150ms delay
//   to prevent visual glitches from menu close competing with modal open.
// Alternatives:
//   - role="menu" pattern: Rejected — wrong ARIA semantics for navigation.
//   - DaisyUI dropdown: Rejected — doesn't support children slot or disclosure pattern.
//   - Backdrop in parent: Rejected — menu should own its backdrop per BURGER_MENU pattern.
//     Parent header still needs z-50 when open (backdrop-blur-sm stacking context).
import { Fragment, useRef, useEffect, useCallback, useId } from 'react'
import { debugLog } from '../utils/debugLog'
import { useDisclosureFocus } from '../hooks/useDisclosureFocus'
import { useFocusTrap } from '../hooks/useFocusTrap'
import { useEscapeKey } from '../hooks/useEscapeKey'

export default function BurgerMenu({ items, open, onToggle, onClose, children, version }) {
  const menuId = useId()
  const triggerRef = useRef(null)
  const menuRef = useRef(null)
  const timerRef = useRef(null)
  const hasLoggedRef = useRef(false)

  const visibleItems = items.filter((item) => item.visible !== false)

  // Log menu state transitions for debug pill visibility.
  useEffect(() => {
    if (open) { hasLoggedRef.current = true; debugLog('burger-menu', 'opened') }
    else if (hasLoggedRef.current) debugLog('burger-menu', 'closed')
  }, [open])

  useDisclosureFocus(open, { triggerRef, contentRef: menuRef, selector: 'button, a' })
  useFocusTrap(menuRef, open)
  useEscapeKey(open, onClose)

  // Close menu first, execute action after DOM settles.
  // Requirement: Per BURGER_MENU pattern — prevents visual glitches
  //   from menu close animation competing with modal/action open.
  const handleItem = useCallback((item) => {
    if (item.disabled) return
    onClose()
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      try {
        await item.action()
      } catch (e) {
        if (window.__debugPushError) {
          window.__debugPushError(`Menu action "${item.label}" failed: ${e.message}`)
        } else {
          console.error('Menu action failed:', e)
        }
      }
    }, 150)
  }, [onClose])

  // Cleanup pending action timer on unmount
  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  // Arrow key + Home/End navigation within menu items.
  // When focus is outside the button list (idx === -1), ArrowDown goes to first,
  // ArrowUp goes to last — matching Home/End behavior for consistency.
  const handleMenuKeyDown = useCallback((e) => {
    const btns = menuRef.current?.querySelectorAll('button:not([disabled])')
    if (!btns || btns.length === 0) return
    const idx = Array.from(btns).indexOf(document.activeElement)

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        btns[idx === -1 ? 0 : (idx + 1) % btns.length].focus()
        break
      case 'ArrowUp':
        e.preventDefault()
        btns[idx === -1 ? btns.length - 1 : (idx - 1 + btns.length) % btns.length].focus()
        break
      case 'Home':
        e.preventDefault()
        btns[0].focus()
        break
      case 'End':
        e.preventDefault()
        btns[btns.length - 1].focus()
        break
    }
  }, [])

  return (
    <div className="relative no-print">
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

      {open && (
        <>
          {/* Backdrop — z-40. cursor-pointer required for iOS Safari
              (empty divs don't receive click events without it).
              Parent header needs z-50 when open so this backdrop layers
              correctly above page content but below the menu dropdown. */}
          <div
            className="fixed inset-0 z-40 cursor-pointer"
            onClick={onClose}
            aria-hidden="true"
          />

          <nav
            ref={menuRef}
            id={menuId}
            aria-label="Main navigation"
            className="absolute right-0 top-full mt-1 z-50
                       bg-base-100 rounded-xl shadow-lg
                       border border-base-300
                       max-w-[calc(100vw-2rem)] max-h-[calc(100dvh-4rem)]
                       overflow-y-auto overscroll-contain"
            onKeyDown={handleMenuKeyDown}
          >
            <ul className="menu menu-sm min-w-[200px]">
              {visibleItems.map((item, i) => (
                <Fragment key={item.label || `item-${i}`}>
                  {item.separator && i > 0 && (
                    <hr className="my-1 border-base-300" />
                  )}
                  <li>
                    <button
                      type="button"
                      disabled={item.disabled}
                      onClick={() => handleItem(item)}
                      className={`min-h-11 ${
                        item.disabled
                          ? 'opacity-40 cursor-not-allowed'
                          : item.destructive
                            ? 'text-error'
                            : item.highlight
                              ? item.highlightColor || 'text-primary'
                              : ''
                      }`}
                    >
                      {item.icon && (
                        <svg className={`w-4 h-4 shrink-0 ${item.iconClass || ''}`} aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                        </svg>
                      )}
                      <span className="truncate">{item.label}</span>
                      {item.external && (
                        <svg className="w-3 h-3 ml-auto opacity-40 shrink-0" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                          <path d="M3.5 3H9v5.5M9 3L3 9" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                  </li>
                </Fragment>
              ))}
            </ul>
            {children}
            {version && (
              <div className="px-4 py-1.5 text-xs text-base-content/40 text-right border-t border-base-300/50">
                v{version}
              </div>
            )}
          </nav>
        </>
      )}
    </div>
  )
}
