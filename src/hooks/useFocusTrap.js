// Requirement: Trap focus inside modals so keyboard/screen-reader users can't tab behind.
// Approach: useEffect captures first/last focusable elements, intercepts Tab/Shift+Tab
//   at boundaries, and returns focus to previously focused element on unmount.
// Alternatives:
//   - Third-party focus-trap library: Rejected — adds dependency for simple behavior.
//   - Manual tabIndex management: Rejected — brittle, breaks when modal content changes.

import { useEffect, useRef } from 'react'

const FOCUSABLE = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'

export function useFocusTrap(containerRef, isActive = true) {
  const previouslyFocused = useRef(null)

  useEffect(() => {
    if (!isActive || !containerRef.current) return

    previouslyFocused.current = document.activeElement

    // Focus first focusable element in the container
    const focusable = containerRef.current.querySelectorAll(FOCUSABLE)
    if (focusable.length > 0) {
      focusable[0].focus()
    }

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
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      // Restore focus to previously focused element
      if (previouslyFocused.current && previouslyFocused.current.focus) {
        previouslyFocused.current.focus()
      }
    }
  }, [isActive, containerRef])
}
