import { useRef, useEffect, useCallback } from 'react'

// Requirement: Touch-draggable bottom sheet for mobile tab content.
// Approach: Fixed-height sheet positioned off-screen, revealed via CSS
//   transform: translateY() for GPU-composited animation (no layout reflow).
//   During drag, DOM is updated directly via ref — no React state updates
//   until snap on touchend, eliminating re-renders of the entire App tree.
//   No backdrop — canvas stays visible and interactive above the sheet
//   (Maps/Uber pattern). Close via drag-down or MobileNav tab toggle.
// Alternatives:
//   - Animating CSS height: Rejected — triggers layout recalculation every
//     frame, causing visible lag on mobile.
//   - Blocking backdrop: Rejected — prevents canvas interaction (cell
//     selection, page swipe) while sheet is open.
//   - Third-party library (react-spring, framer-motion): Rejected — adds
//     bundle weight for a simple gesture.

export const SNAP_CLOSED = 0
export const SNAP_HALF = 50
export const SNAP_FULL = 85

// Convert a snap value (vh) to a translateY value.
// Sheet is full-size (SNAP_FULL vh); translateY slides it down to show less.
// snap=SNAP_FULL → translateY(0), snap=SNAP_HALF → translateY(35vh), snap=0 → translateY(85vh)
function snapToTranslateY(snap) {
  return SNAP_FULL - snap
}

export default function BottomSheet({ isOpen, onClose, children, snapPoint, onSnapChange }) {
  const sheetRef = useRef(null)
  const dragRef = useRef({ startY: 0, startTranslateVh: 0, isDragging: false })
  // Current translateY in vh units during drag (avoids stale closures)
  const currentTranslateRef = useRef(snapToTranslateY(SNAP_CLOSED))

  // Apply transform directly to DOM (no React re-render)
  const applyTransform = useCallback((translateVh, animate) => {
    if (!sheetRef.current) return
    currentTranslateRef.current = translateVh
    sheetRef.current.style.transition = animate ? 'transform 300ms cubic-bezier(0.32, 0.72, 0, 1)' : 'none'
    sheetRef.current.style.transform = `translateY(${translateVh}vh)`
  }, [])

  // Animate to snap point when it changes or sheet opens
  useEffect(() => {
    if (!isOpen) return
    const target = snapToTranslateY(snapPoint || SNAP_HALF)
    // Use rAF to ensure the initial off-screen position is painted first
    requestAnimationFrame(() => {
      applyTransform(target, true)
    })
  }, [isOpen, snapPoint, applyTransform])

  // Set initial off-screen position when mounting (before animation)
  useEffect(() => {
    if (isOpen && sheetRef.current) {
      // Start fully hidden (translateY = SNAP_FULL vh = off-screen below)
      applyTransform(snapToTranslateY(SNAP_CLOSED), false)
    }
  // Only run on mount/open change — snapPoint changes handled by the other effect
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  // Auto-open to half when opening from closed
  useEffect(() => {
    if (isOpen && (snapPoint === SNAP_CLOSED || snapPoint === undefined)) {
      onSnapChange(SNAP_HALF)
    }
  }, [isOpen, snapPoint, onSnapChange])

  const handleTouchStart = useCallback((e) => {
    dragRef.current = {
      startY: e.touches[0].clientY,
      startTranslateVh: currentTranslateRef.current,
      isDragging: true,
    }
    // Disable transition during drag for instant response
    if (sheetRef.current) sheetRef.current.style.transition = 'none'
  }, [])

  const handleTouchMove = useCallback((e) => {
    if (!dragRef.current.isDragging) return
    const deltaY = e.touches[0].clientY - dragRef.current.startY
    const deltaVh = (deltaY / window.innerHeight) * 100
    // Clamp: 0 = fully visible (SNAP_FULL), SNAP_FULL = fully hidden
    const newTranslate = Math.min(SNAP_FULL, Math.max(0, dragRef.current.startTranslateVh + deltaVh))
    applyTransform(newTranslate, false)
  }, [applyTransform])

  const handleTouchEnd = useCallback(() => {
    dragRef.current.isDragging = false
    // Determine which snap point to land on based on current position
    const currentVh = SNAP_FULL - currentTranslateRef.current // visible height in vh
    if (currentVh < 20) {
      onClose()
    } else if (currentVh < 65) {
      onSnapChange(SNAP_HALF)
      applyTransform(snapToTranslateY(SNAP_HALF), true)
    } else {
      onSnapChange(SNAP_FULL)
      applyTransform(snapToTranslateY(SNAP_FULL), true)
    }
  }, [onClose, onSnapChange, applyTransform])

  if (!isOpen) return null

  return (
    <div
      ref={sheetRef}
      className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-dark-card rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.12)] flex flex-col will-change-transform"
      style={{
        height: `${SNAP_FULL}vh`,
        maxHeight: 'calc(100dvh - 6rem)',
        paddingBottom: 'calc(3.5rem + env(safe-area-inset-bottom, 0px))',
        // Start off-screen; useEffect will animate in
        transform: `translateY(${SNAP_FULL}vh)`,
      }}
    >
      {/* Drag handle */}
      <div
        className="flex justify-center py-3 cursor-grab active:cursor-grabbing shrink-0 touch-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="w-10 h-1 bg-zinc-300 dark:bg-zinc-600 rounded-full" />
      </div>
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-4">
        {children}
      </div>
    </div>
  )
}
