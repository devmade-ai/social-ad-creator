// Requirement: User-controlled zoom on canvas preview.
// Approach: Inline controls (−, %, +) above canvas, right-aligned. Null zoom = auto-fit.
// Alternatives:
//   - Floating overlay on canvas: Rejected — obscures content on mobile, harder to tap.
//   - Pinch-to-zoom: Rejected — complex on desktop, imprecise.

export default function ZoomControls({ zoomLevel, autoScale, onZoomChange }) {
  const previewScale = zoomLevel !== null ? zoomLevel : autoScale

  return (
    <div className="flex items-center justify-end gap-0.5 sm:gap-1 mb-2">
      <button
        onClick={() => onZoomChange(Math.round(Math.max((zoomLevel || autoScale) - 0.1, 0.25) * 100) / 100)}
        className="w-10 h-10 sm:w-6 sm:h-6 flex items-center justify-center text-ui-text-muted hover:text-ui-text rounded transition-colors text-sm sm:text-xs font-bold"
        title="Zoom out"
        aria-label="Zoom out"
      >
        −
      </button>
      <button
        onClick={() => onZoomChange(null)}
        className="px-1 min-w-[40px] sm:min-w-[36px] h-10 sm:h-6 flex items-center justify-center text-xs sm:text-[10px] font-medium text-ui-text-muted hover:text-ui-text rounded transition-colors"
        title="Fit to container"
        aria-label={`Zoom ${Math.round(previewScale * 100)}%, click to fit`}
      >
        {Math.round(previewScale * 100)}%
      </button>
      <button
        onClick={() => onZoomChange(Math.round(Math.min((zoomLevel || autoScale) + 0.1, 2) * 100) / 100)}
        className="w-10 h-10 sm:w-6 sm:h-6 flex items-center justify-center text-ui-text-muted hover:text-ui-text rounded transition-colors text-sm sm:text-xs font-bold"
        title="Zoom in"
        aria-label="Zoom in"
      >
        +
      </button>
    </div>
  )
}
