// Requirement: Trap Tab/Shift+Tab inside a container so keyboard users can't tab behind it.
// Approach: Intercepts Tab at first/last focusable boundaries and wraps around.
//   Only handles Tab trapping — initial focus and focus restore are handled by
//   useDisclosureFocus (the two hooks complement each other).
// Alternatives:
//   - Third-party focus-trap library: Rejected — adds dependency for simple behavior.
//   - Manual tabIndex management: Rejected — brittle, breaks when container content changes.

import { useEffect } from 'react'

const FOCUSABLE = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'

export function useFocusTrap(containerRef, isActive = true) {
  useEffect(() => {
    if (!isActive || !containerRef.current) return

    const handleKeyDown = (e) => {
      if (e.key !== 'Tab') return
      const elements = containerRef.current?.querySelectorAll(FOCUSABLE)
      if (!elements || elements.length === 0) return

      const first = elements[0]
      const last = elements[elements.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isActive, containerRef])
}
