// Requirement: Discoverable keyboard shortcuts for power users.
// Approach: DaisyUI modal (native <dialog>) + kbd component for key indicators.
// Alternatives:
//   - Hand-rolled fixed overlay with custom kbd styling: Replaced — <dialog> provides
//     native focus trapping and Escape handling; DaisyUI kbd gives consistent styling.
//   - Inline help text: Rejected — clutters the UI for non-power users.
//   - Browser-style menu bar: Rejected — doesn't match the app's minimal design.

import { useRef } from 'react'
import { useDialogSync } from '../hooks/useDialogSync'

export default function KeyboardShortcutsOverlay({ onClose }) {
  const dialogRef = useRef(null)

  // Always open — component is only rendered when visible
  const { handleBackdropClick } = useDialogSync(dialogRef, true, onClose)

  return (
    <dialog
      ref={dialogRef}
      className="modal modal-bottom sm:modal-middle"
      onClick={handleBackdropClick}
    >
      <div className="modal-box max-w-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-base-content">Keyboard Shortcuts</h3>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="btn btn-sm btn-circle btn-ghost"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="space-y-2">
          {/* DaisyUI kbd component replaces hand-rolled kbd styling */}
          {[
            ['Ctrl + Z', 'Undo'],
            ['Ctrl + Shift + Z', 'Redo'],
            ['Ctrl + Y', 'Redo'],
            ['1 – 5', 'Switch tabs (Presets, Media, Content, Structure, Style)'],
          ].map(([key, desc]) => (
            <div key={key} className="flex items-center justify-between text-sm">
              <span className="text-base-content/70">{desc}</span>
              <kbd className="kbd kbd-sm">{key}</kbd>
            </div>
          ))}
          <div className="divider my-2"></div>
          <p className="text-[10px] text-base-content/50 font-medium uppercase tracking-wide mb-2">Reader Mode</p>
          {[
            ['← →', 'Previous / Next page'],
            ['Esc', 'Exit reader mode'],
          ].map(([key, desc]) => (
            <div key={key} className="flex items-center justify-between text-sm mb-1">
              <span className="text-base-content/70">{desc}</span>
              <kbd className="kbd kbd-sm">{key}</kbd>
            </div>
          ))}
        </div>
      </div>
    </dialog>
  )
}
