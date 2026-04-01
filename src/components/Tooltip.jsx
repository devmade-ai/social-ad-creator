// Requirement: Hover tooltips that don't clip at container edges.
// Approach: Portal-based tooltip rendered at document.body with fixed positioning
//   calculated from trigger element's bounding rect. Clamped to viewport edges.
// Alternatives:
//   - CSS absolute positioning: Rejected — clips when parent has overflow:hidden/auto.
//   - Third-party tooltip library: Rejected — adds dependency for simple feature.

import { useState, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'

// Touch devices fire mouseEnter on tap but never mouseLeave, leaving tooltips
// stuck on screen. Detect touch support and skip hover tooltips entirely.
const isTouchDevice = () =>
  typeof window !== 'undefined' &&
  ('ontouchstart' in window || navigator.maxTouchPoints > 0)

export default function Tooltip({ children, content, className = '' }) {
  const [visible, setVisible] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const triggerRef = useRef(null)
  const tooltipRef = useRef(null)

  const show = useCallback(() => {
    if (isTouchDevice()) return
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    // Position above center of trigger, will adjust after render if needed
    setPosition({
      top: rect.top - 8,
      left: rect.left + rect.width / 2,
    })
    setVisible(true)

    // After render, clamp to viewport
    requestAnimationFrame(() => {
      if (!tooltipRef.current) return
      const tipRect = tooltipRef.current.getBoundingClientRect()
      const padding = 8
      let { top, left } = { top: rect.top - 8, left: rect.left + rect.width / 2 }

      // Clamp horizontal
      const halfWidth = tipRect.width / 2
      if (left - halfWidth < padding) left = halfWidth + padding
      if (left + halfWidth > window.innerWidth - padding) left = window.innerWidth - padding - halfWidth

      // If clipped at top, show below instead
      if (tipRect.top < padding) {
        top = rect.bottom + 8
        setPosition({ top, left, below: true })
      } else {
        setPosition({ top, left, below: false })
      }
    })
  }, [])

  const hide = useCallback(() => setVisible(false), [])

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={show}
        onMouseLeave={hide}
        className={className}
      >
        {children}
      </div>
      {visible && createPortal(
        <div
          ref={tooltipRef}
          className="fixed z-[70] pointer-events-none"
          style={{
            top: position.top,
            left: position.left,
            transform: position.below
              ? 'translateX(-50%)'
              : 'translate(-50%, -100%)',
          }}
        >
          <div className="relative">
            {content}
            {/* Arrow */}
            <div
              className={`absolute left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-base-100 border-base-300 ${
                position.below
                  ? '-top-1 border-l border-t'
                  : '-bottom-1 border-r border-b'
              }`}
            />
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
