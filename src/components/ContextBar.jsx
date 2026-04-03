import { memo, useMemo } from 'react'
import MiniCellGrid from './MiniCellGrid'
import PageDots from './PageDots'

// Requirement: Consolidated single-row bar for page selection + cell selection.
// Approach: Page dots and cell grid sit side by side in one compact row.
//   Undo/redo moved to header. Page management (add/delete/reorder) moved to Structure tab.
// Alternatives:
//   - Separate page and cell rows: Rejected — wasted vertical space, especially on mobile.
//   - Keep page actions inline: Rejected — cluttered the bar, actions belong in Structure tab.
export default memo(function ContextBar({
  // Cell
  layout,
  cellImages,
  selectedCell,
  onSelectCell,
  platform,
  // Pages (selection only — management moved to Structure tab)
  pages = [null],
  activePage = 0,
  onSetActivePage,
  getPageState,
}) {
  const hasMultiplePages = (pages?.length || 1) > 1

  const totalCells = useMemo(() => {
    const structure = layout.structure || [{ size: 100, subdivisions: 1, subSizes: [100] }]
    return structure.reduce((total, section) => total + (section.subdivisions || 1), 0)
  }, [layout.structure])

  return (
    <div className="bg-base-100/90 backdrop-blur-sm border-b border-base-300/60 px-3 sm:px-4 py-1.5 sticky z-20" style={{ top: 'var(--tab-nav-height, 41px)' }}>
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Page selector — only shown when multiple pages exist */}
        {hasMultiplePages && (
          <>
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-[10px] text-base-content/50 uppercase tracking-wide shrink-0 hidden sm:inline">Page</span>
              <div className="overflow-x-auto scrollbar-thin">
                <PageDots
                  pages={pages}
                  activePage={activePage}
                  getPageState={getPageState}
                  onSetActivePage={onSetActivePage}
                />
              </div>
            </div>
            <div className="w-px h-6 bg-base-300 shrink-0" />
          </>
        )}

        {/* Cell selector */}
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-[10px] text-base-content/50 uppercase tracking-wide shrink-0 hidden sm:inline">Cell</span>
          <MiniCellGrid
            layout={layout}
            cellImages={cellImages}
            selectedCell={selectedCell}
            onSelectCell={onSelectCell}
            platform={platform}
            fixedHeight="s"
          />
          {totalCells > 1 && (
            <span className="text-xs font-medium text-base-content/70">
              {selectedCell + 1}
            </span>
          )}
        </div>
      </div>
    </div>
  )
})
