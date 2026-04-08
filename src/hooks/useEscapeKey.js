// Requirement: Reusable Escape key handler for disclosure components.
// Approach: Extracted from BurgerMenu's inline keydown listener per BURGER_MENU pattern.
//   Shared by any component that closes on Escape (menus, modals, dropdowns).
// Alternatives:
//   - Inline in each component: Rejected — duplicates the listener pattern.
//   - Headless UI: Rejected — adds dependency for a single hook.
import { useEffect } from 'react'

export function useEscapeKey(active, onEscape) {
  useEffect(() => {
    if (!active) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); onEscape() }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [active, onEscape])
}
