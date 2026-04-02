// Requirement: Shared undo/redo buttons used in both mobile and desktop headers.
// Approach: Single component with size prop to handle styling differences.
//   Mobile uses larger touch targets (p-2, text-base), desktop uses compact (px-2 py-1.5, text-sm).
// Alternatives:
//   - Inline in each layout: Rejected — duplicated identical logic in two places.
//   - Single size for both: Rejected — mobile needs 44px+ touch targets, desktop can be compact.
import { memo } from 'react'

export default memo(function UndoRedoButtons({ undo, redo, canUndo, canRedo, size = 'md' }) {
  const isCompact = size === 'sm'
  const padding = isCompact ? 'px-2 py-1.5' : 'p-2'
  const iconSize = isCompact ? 'text-sm' : 'text-base'
  // Desktop users benefit from keyboard shortcut hints; mobile users don't use Ctrl+Z
  const undoTitle = isCompact ? 'Undo (Ctrl+Z)' : 'Undo'
  const redoTitle = isCompact ? 'Redo (Ctrl+Y)' : 'Redo'

  return (
    <div className="flex items-center gap-0.5">
      <button
        onClick={undo}
        disabled={!canUndo}
        title={undoTitle}
        aria-label="Undo"
        className={`${padding} rounded-lg transition-all ${
          canUndo
            ? 'text-base-content hover:bg-base-200 active:scale-95'
            : 'text-base-content/20 cursor-not-allowed'
        }`}
      >
        <span className={iconSize}>&#x21B6;</span>
      </button>
      <button
        onClick={redo}
        disabled={!canRedo}
        title={redoTitle}
        aria-label="Redo"
        className={`${padding} rounded-lg transition-all ${
          canRedo
            ? 'text-base-content hover:bg-base-200 active:scale-95'
            : 'text-base-content/20 cursor-not-allowed'
        }`}
      >
        <span className={iconSize}>&#x21B7;</span>
      </button>
    </div>
  )
})
