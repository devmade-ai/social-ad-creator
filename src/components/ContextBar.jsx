import { memo, useMemo } from 'react'
import MiniCellGrid from './MiniCellGrid'

// Validate hex color to prevent CSS injection via theme values.
const HEX_COLOR_RE = /^#[0-9a-fA-F]{3,8}$/
function safeColor(color, fallback = '#1a1a2e') {
  return color && HEX_COLOR_RE.test(color) ? color : fallback
}

// Compact page thumbnail for context bar.
// Touch targets: w-11 h-11 (44px) on mobile, w-8 h-8 on desktop.
function PageDot({ pageState, isActive, onClick, index }) {
  const bgColor = safeColor(pageState?.theme?.primary)

  return (
    <button
      onClick={onClick}
      aria-label={`Switch to page ${index + 1}`}
      aria-current={isActive ? 'page' : undefined}
      className={`relative shrink-0 w-11 h-11 sm:w-8 sm:h-8 rounded-md overflow-hidden border-2 transition-all hover:scale-110 active:scale-95 ${
        isActive
          ? 'border-primary ring-1 ring-primary/30'
          : 'border-base-300 hover:border-base-300'
      }`}
      title={`Page ${index + 1}`}
    >
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ backgroundColor: bgColor }}
      >
        <span className={`text-[8px] font-bold ${isActive ? 'text-white' : 'text-white/70'}`}>
          {index + 1}
        </span>
      </div>
    </button>
  )
}

// Memoize page state lookups to avoid calling getPageState() for every page on every render.
const PageDots = memo(function PageDots({ pages, activePage, getPageState, onSetActivePage }) {
  const pageStates = useMemo(
    () => pages.map((_, i) => (getPageState ? getPageState(i) : null)),
    [pages, getPageState]
  )

  return (
    <div className="flex gap-1 py-0.5">
      {pages.map((_, index) => (
        <PageDot
          key={index}
          pageState={pageStates[index]}
          isActive={index === activePage}
          onClick={() => onSetActivePage(index)}
          index={index}
        />
      ))}
    </div>
  )
})

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
            size="contextbar"
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
