// Requirement: Manual PWA install instructions for browsers that don't support beforeinstallprompt.
// Approach: DaisyUI modal (native <dialog>) replaces hand-rolled fixed overlay.
// Alternatives:
//   - Hand-rolled fixed overlay + backdrop-blur: Replaced — <dialog> provides
//     native focus trapping, Escape handling, and ::backdrop pseudo-element.

import { memo, useRef } from 'react'
import { useDialogSync } from '../hooks/useDialogSync'

export default memo(function InstallInstructionsModal({ isOpen, onClose, instructions }) {
  const dialogRef = useRef(null)

  // Guard: only sync when instructions data is available
  const { handleBackdropClick } = useDialogSync(dialogRef, isOpen && !!instructions, onClose)

  if (!instructions) return null

  return (
    <dialog
      ref={dialogRef}
      className="modal modal-bottom sm:modal-middle"
      onClick={handleBackdropClick}
    >
      <div className="modal-box max-w-md">
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-base-200 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-base-content">Install App</h3>
            <p className="text-sm text-base-content/70">{instructions.browser}</p>
          </div>
        </div>

        {/* Instructions */}
        <div className="space-y-3 mb-4">
          <p className="text-sm text-base-content/70">
            Follow these steps to install CanvaGrid:
          </p>
          <ol className="space-y-2">
            {instructions.steps.map((step, index) => (
              <li key={index} className="flex gap-3 text-sm">
                <span className="flex-shrink-0 w-6 h-6 bg-base-200 text-primary rounded-full flex items-center justify-center text-xs font-medium">
                  {index + 1}
                </span>
                <span className="text-base-content pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Note if present — DaisyUI alert-soft for theme-aware warning box */}
        {instructions.note && (
          <div role="alert" className="alert alert-warning alert-soft text-xs mb-4">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span><strong>Note:</strong> {instructions.note}</span>
          </div>
        )}

        {/* Benefits */}
        <div className="border-t border-base-300 pt-4">
          <p className="text-xs text-base-content/70 mb-2">Benefits of installing:</p>
          <ul className="text-xs text-base-content/60 space-y-1">
            <li className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Works offline
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Launches from your dock/home screen
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Full-screen experience without browser UI
            </li>
          </ul>
        </div>

        {/* Close button */}
        <div className="modal-action">
          <button
            onClick={onClose}
            className="btn btn-primary w-full"
          >
            Got it
          </button>
        </div>
      </div>
    </dialog>
  )
})
