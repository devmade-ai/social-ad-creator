// Requirement: Sync native <dialog> open/close with React state across all DaisyUI modals.
// Approach: Shared hook eliminates duplicated dialog sync code from 4 modal components.
//   Handles showModal()/close(), native close event (Escape key), and backdrop click.
// Alternatives:
//   - Inline useEffect in each modal: Rejected — identical pattern duplicated 4 times.
//   - Third-party modal library: Rejected — adds dependency for simple native <dialog> sync.

import { useEffect, useCallback } from 'react'

/**
 * Syncs a native <dialog> element with React open/close state.
 *
 * @param {React.RefObject} dialogRef - Ref to the <dialog> element
 * @param {boolean} isOpen - Whether the dialog should be open
 * @param {Function} onClose - Called when the dialog closes (Escape, backdrop click)
 * @param {Function} [onOpen] - Optional callback fired when dialog opens (e.g., reset state)
 */
export function useDialogSync(dialogRef, isOpen, onClose, onOpen) {
  // Sync React isOpen → native dialog.showModal()/close()
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isOpen && !dialog.open) {
      onOpen?.()
      dialog.showModal()
    } else if (!isOpen && dialog.open) {
      dialog.close()
    }
  }, [isOpen, dialogRef, onOpen])

  // Sync native close → React state (Escape key triggers native close event)
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const handleClose = () => onClose()
    dialog.addEventListener('close', handleClose)
    return () => dialog.removeEventListener('close', handleClose)
  }, [onClose, dialogRef])

  // Backdrop click handler — close when clicking the <dialog> backdrop (not modal-box)
  const handleBackdropClick = useCallback((e) => {
    if (e.target === dialogRef.current) onClose()
  }, [onClose, dialogRef])

  return { handleBackdropClick }
}
