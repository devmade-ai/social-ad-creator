// Requirement: User-controlled zoom on canvas preview.
// Approach: Floating controls (−, %, +) bottom-right of canvas. Null zoom = auto-fit.
// Alternatives:
//   - Always auto-fit: Rejected — no way to inspect detail at higher zoom.
//   - Pinch-to-zoom: Rejected — complex on desktop, imprecise.

export default function ZoomControls({ zoomLevel, autoScale, onZoomChange }) {
  const previewScale = zoomLevel !== null ? zoomLevel : autoScale

  return (
    <div className="absolute right-2 flex items-center gap-0.5 sm:gap-1 bg-white/80 dark:bg-dark-card/80 backdrop-blur-sm rounded-lg border border-zinc-200/60 dark:border-zinc-700/60 shadow-sm px-0.5 sm:px-1 py-0.5" style={{ bottom: 'max(0.5rem, env(safe-area-inset-bottom, 0.5rem))' }}>
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
