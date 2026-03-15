import { useRef, useEffect, useCallback } from 'react'

// Requirement: Touch-draggable bottom sheet for mobile tab content.
// Approach: CSS transform-based height with touch drag on handle.
//   Three snap points: closed (0), half (50vh), full (85vh).
// Alternatives:
//   - CSS-only slide-up: Rejected — no drag-to-resize capability.
//   - Third-party library (react-spring, framer-motion): Rejected — adds bundle for simple gesture.

export const SNAP_CLOSED = 0
export const SNAP_HALF = 50
export const SNAP_FULL = 85

export default function BottomSheet({ isOpen, onClose, children, height, onHeightChange }) {
  const sheetRef = useRef(null)
  const dragRef = useRef({ startY: 0, startHeight: 0, isDragging: false })

  // Auto-set to half when opening from closed
  useEffect(() => {
    if (isOpen && height === SNAP_CLOSED) {
      onHeightChange(SNAP_HALF)
    }
  }, [isOpen, height, onHeightChange])

  const handleTouchStart = useCallback((e) => {
    dragRef.current = { startY: e.touches[0].clientY, startHeight: height, isDragging: true }
    if (sheetRef.current) sheetRef.current.style.transition = 'none'
  }, [height])

  const handleTouchMove = useCallback((e) => {
    if (!dragRef.current.isDragging) return
    const deltaY = dragRef.current.startY - e.touches[0].clientY
    const deltaPercent = (deltaY / window.innerHeight) * 100
    const newHeight = Math.min(SNAP_FULL, Math.max(5, dragRef.current.startHeight + deltaPercent))
    onHeightChange(newHeight)
  }, [onHeightChange])

  const handleTouchEnd = useCallback(() => {
    dragRef.current.isDragging = false
    if (sheetRef.current) sheetRef.current.style.transition = ''
    // Snap to closest position
    if (height < 20) {
      onClose()
    } else if (height < 65) {
      onHeightChange(SNAP_HALF)
    } else {
      onHeightChange(SNAP_FULL)
    }
  }, [height, onClose, onHeightChange])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-30 transition-opacity"
        onClick={onClose}
      />
      {/* Sheet */}
      <div
        ref={sheetRef}
        className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-dark-card rounded-t-2xl shadow-lg flex flex-col transition-[height] duration-300 ease-out"
        style={{
          height: `${height}vh`,
          // Leave space for the mobile nav bar at the bottom
          paddingBottom: 'calc(3.5rem + env(safe-area-inset-bottom, 0px))',
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
    </>
  )
}
