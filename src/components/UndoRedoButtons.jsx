// Requirement: Shared undo/redo buttons used in both mobile and desktop headers.
// Approach: Single component with size prop to handle styling differences.
//   Mobile uses larger touch targets (btn-sm), desktop uses compact (btn-xs).
// Alternatives:
//   - Inline in each layout: Rejected — duplicated identical logic in two places.
//   - Single size for both: Rejected — mobile needs 44px+ touch targets, desktop can be compact.
import { memo } from 'react'

export default memo(function UndoRedoButtons({ undo, redo, canUndo, canRedo, size = 'md' }) {
  const btnSize = size === 'sm' ? 'btn-xs' : 'btn-sm'
  const iconSize = size === 'sm' ? 'text-sm' : 'text-base'
  // Desktop users benefit from keyboard shortcut hints; mobile users don't use Ctrl+Z
  const undoTitle = size === 'sm' ? 'Undo (Ctrl+Z)' : 'Undo'
  const redoTitle = size === 'sm' ? 'Redo (Ctrl+Y)' : 'Redo'

  return (
    <div className="flex items-center gap-0.5">
      <button
        onClick={undo}
        disabled={!canUndo}
        title={undoTitle}
        aria-label="Undo"
        className={`btn btn-ghost btn-square ${btnSize}`}
      >
        <span className={iconSize}>&#x21B6;</span>
      </button>
      <button
        onClick={redo}
        disabled={!canRedo}
        title={redoTitle}
        aria-label="Redo"
        className={`btn btn-ghost btn-square ${btnSize}`}
      >
        <span className={iconSize}>&#x21B7;</span>
      </button>
    </div>
  )
})
