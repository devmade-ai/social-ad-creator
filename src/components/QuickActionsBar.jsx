// Requirement: Contextual shortcuts for the selected cell.
// Approach: Compact bar below canvas with links to relevant tabs (Media, Content, Style).
// Alternatives:
//   - Right-click context menu: Rejected — not discoverable for non-technical users.
//   - Floating toolbar on cell: Rejected — overlaps canvas content, hard to position.

export default function QuickActionsBar({ selectedCell, onNavigate }) {
  return (
    <div className="mt-2 flex items-center justify-center gap-1.5">
      <span className="text-[10px] text-base-content/50 mr-1">Cell {selectedCell + 1}:</span>
      <button
        onClick={() => onNavigate('media')}
        className="btn btn-ghost btn-xs gap-1"
        title="Go to Media tab to add/change image for this cell"
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        Image
      </button>
      <button
        onClick={() => onNavigate('content')}
        className="btn btn-ghost btn-xs gap-1"
        title="Go to Content tab to edit text for this cell"
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        Text
      </button>
      <button
        onClick={() => onNavigate('style')}
        className="btn btn-ghost btn-xs gap-1"
        title="Go to Style tab to change overlay/spacing for this cell"
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
        Style
      </button>
    </div>
  )
}
