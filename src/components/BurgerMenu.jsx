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

export default function BurgerMenu({ items, open, onToggle, onClose, children }) {
  const menuId = useId()
  const triggerRef = useRef(null)
  const menuRef = useRef(null)
  const hasBeenOpenRef = useRef(false)

  const visibleItems = items.filter((item) => item.visible !== false)

  // Focus management: focus first item on open, return to trigger on close.
  // hasBeenOpenRef prevents stealing focus on initial mount (open starts false).
  useEffect(() => {
    if (open) {
      hasBeenOpenRef.current = true
      const rafId = requestAnimationFrame(() => {
        const firstItem = menuRef.current?.querySelector('button, a')
        firstItem?.focus()
      })
      return () => cancelAnimationFrame(rafId)
    } else if (hasBeenOpenRef.current) {
      triggerRef.current?.focus()
    }
  }, [open])

  // Escape key closes menu
  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose() }
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

      {open && (
        <>
          {/* Backdrop — z-40 (menu backdrop layer).
              cursor-pointer required for iOS Safari — empty divs don't
              receive click events without it. */}
          <div
            className="fixed inset-0 z-40 cursor-pointer"
            onClick={onClose}
          />

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
