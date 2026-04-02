// Requirement: Reusable focus management for disclosure-pattern components.
// Approach: Encapsulates the open→focus-first-item, close→return-to-trigger pattern
//   shared by BurgerMenu and ThemeSelector. Uses hasBeenOpenRef guard to prevent
//   stealing focus on initial mount (when open starts as false).
// Alternatives:
//   - Inline in each component: Rejected — identical logic duplicated in two places.
//   - Headless UI: Rejected — adds dependency for a single hook.
import { useRef, useEffect } from 'react'

export function useDisclosureFocus(open, { triggerRef, contentRef, selector = 'button, a' } = {}) {
  const hasBeenOpenRef = useRef(false)

  useEffect(() => {
    if (open) {
      hasBeenOpenRef.current = true
      const rafId = requestAnimationFrame(() => {
        const firstItem = contentRef?.current?.querySelector(selector)
        firstItem?.focus()
      })
      return () => cancelAnimationFrame(rafId)
    } else if (hasBeenOpenRef.current) {
      triggerRef?.current?.focus()
    }
  }, [open, triggerRef, contentRef, selector])
}
