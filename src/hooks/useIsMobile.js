import { useState, useEffect } from 'react'

// Requirement: Detect mobile viewport for conditional layout rendering.
// Approach: matchMedia listener on lg breakpoint (1024px), matching Tailwind's lg:.
// Alternatives:
//   - CSS-only responsive: Rejected — need different React component trees on mobile vs desktop.
//   - window.innerWidth polling: Rejected — matchMedia is event-driven, more efficient.
export function useIsMobile(breakpoint = 1024) {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < breakpoint)

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)
    const handler = (e) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    setIsMobile(mq.matches)
    return () => mq.removeEventListener('change', handler)
  }, [breakpoint])

  return isMobile
}
