// Requirement: Replace browser confirm() with accessible inline confirmations.
// Approach: Two-state button — first click shows confirmation with consequence text,
//   second click executes the action. Auto-resets after 3 seconds if user doesn't confirm.
// Alternatives:
//   - Modal dialog: Rejected — too heavy for simple destructive actions.
//   - Browser confirm(): Rejected — not accessible, ugly, no styling control.

import { useState, useEffect, useCallback } from 'react'

export default function ConfirmButton({
  onConfirm,
  children,
  confirmLabel = 'Confirm?',
  className = '',
  confirmClassName = '',
  disabled = false,
  title,
  autoResetMs = 3000,
}) {
  const [confirming, setConfirming] = useState(false)

  // Auto-reset after timeout so the button doesn't stay in confirm state forever
  useEffect(() => {
    if (!confirming || autoResetMs <= 0) return
    const timer = setTimeout(() => setConfirming(false), autoResetMs)
    return () => clearTimeout(timer)
  }, [confirming, autoResetMs])

  const handleClick = useCallback((e) => {
    e.stopPropagation()
    if (confirming) {
      setConfirming(false)
      onConfirm?.(e)
    } else {
      setConfirming(true)
    }
  }, [confirming, onConfirm])

  if (confirming) {
    return (
      <div className="flex items-center gap-1">
        <button
          onClick={handleClick}
          className={confirmClassName || 'btn btn-error btn-xs'}
        >
          {confirmLabel}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); setConfirming(false) }}
          className="btn btn-ghost btn-xs"
        >
          Cancel
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      title={title}
      className={className}
    >
      {children}
    </button>
  )
}
