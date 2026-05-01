// Requirement: Move empty state guidance off the canvas display area.
// Approach: Render as a normal-flow element below the canvas, not an overlay.
// Alternatives:
//   - Absolute overlay on canvas: Rejected — covers canvas, blocks cell selection,
//     buttons feel out of place on the design surface.
//   - Sidebar-only guidance: Rejected — users focus on the main area first.

export default function EmptyStateGuide({ onNavigate }) {
  return (
    <div className="text-center py-5">
      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-base-200 flex items-center justify-center">
        <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <p className="text-sm font-medium text-base-content/70 mb-1">Your canvas is empty</p>
      <p className="text-xs text-base-content/60 mb-3">Start by choosing a preset or uploading images</p>
      <div className="flex gap-2 justify-center">
        <button
          onClick={() => onNavigate('presets')}
          className="btn btn-primary btn-xs"
        >
          Browse Presets
        </button>
        <button
          onClick={() => onNavigate('media')}
          className="btn btn-outline btn-xs"
        >
          Upload Images
        </button>
      </div>
    </div>
  )
}
