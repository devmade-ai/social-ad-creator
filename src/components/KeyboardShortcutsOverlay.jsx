// Requirement: Discoverable keyboard shortcuts for power users.
// Approach: Modal overlay triggered from header button, lists all shortcuts.
// Alternatives:
//   - Inline help text: Rejected — clutters the UI for non-power users.
//   - Browser-style menu bar: Rejected — doesn't match the app's minimal design.

import { useRef } from 'react'
import { useFocusTrap } from '../hooks/useFocusTrap'

export default function KeyboardShortcutsOverlay({ onClose }) {
  const modalRef = useRef(null)
  useFocusTrap(modalRef, true)

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
    >
      <div
        ref={modalRef}
        className="bg-base-100 rounded-xl shadow-2xl w-full max-w-sm p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-base-content">Keyboard Shortcuts</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-base-300 text-base-content/70"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="space-y-2">
          {[
            ['Ctrl + Z', 'Undo'],
            ['Ctrl + Shift + Z', 'Redo'],
            ['Ctrl + Y', 'Redo'],
            ['1 – 5', 'Switch tabs (Presets, Media, Content, Structure, Style)'],
          ].map(([key, desc]) => (
            <div key={key} className="flex items-center justify-between text-sm">
              <span className="text-base-content/70">{desc}</span>
              <kbd className="px-2 py-0.5 bg-base-200 border border-base-300 rounded text-xs font-mono text-base-content">{key}</kbd>
            </div>
          ))}
          <div className="pt-2 border-t border-base-200 mt-2">
            <p className="text-[10px] text-base-content/50 font-medium uppercase tracking-wide mb-2">Reader Mode</p>
            {[
              ['← →', 'Previous / Next page'],
              ['Esc', 'Exit reader mode'],
            ].map(([key, desc]) => (
              <div key={key} className="flex items-center justify-between text-sm mb-1">
                <span className="text-base-content/70">{desc}</span>
                <kbd className="px-2 py-0.5 bg-base-200 border border-base-300 rounded text-xs font-mono text-base-content">{key}</kbd>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
