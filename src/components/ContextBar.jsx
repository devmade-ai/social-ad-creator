import { memo, useMemo } from 'react'
import { getAspectRatio } from '../config/platforms'
import { normalizeStructure } from '../utils/cellUtils'

// Compact cell grid for global cell selection.
// Requirement: Pre-compute cell mapping to avoid mutable cellIndex during render.
// Approach: useMemo builds a Map of sectionIndex → cells[], used during render.
// Alternatives:
//   - Mutable let cellIndex = 0 in render: Rejected — side effect during render,
//     breaks under React strict mode double-rendering or concurrent features.
// Requirement: Remove redundant normalizeStructure call — use memoized version only.
// Previous code called normalizeStructure twice (once in render, once in useMemo).
function CellGrid({ layout, cellImages = {}, selectedCell, onSelectCell, platform }) {
  const { type, structure } = layout
  const isFullbleed = type === 'fullbleed'
  const isRows = type === 'rows'

  const aspectRatio = getAspectRatio(platform)

  // Memoize both the normalized structure and the cell mapping in one pass.
  const { normalizedStructure, sectionCellMap } = useMemo(() => {
    const normalized = normalizeStructure(type, structure)
    const grouped = new Map()
    let idx = 0
    normalized.forEach((section, sectionIndex) => {
      const subdivisions = section.subdivisions || 1
      const subSizes = section.subSizes || Array(subdivisions).fill(100 / subdivisions)
      const cells = []
      for (let subIndex = 0; subIndex < subdivisions; subIndex++) {
        cells.push({ cellIndex: idx, subSize: subSizes[subIndex] })
        idx++
      }
      grouped.set(sectionIndex, cells)
    })
    return { normalizedStructure: normalized, sectionCellMap: grouped }
  }, [type, structure])

  return (
    <div
      className="flex overflow-hidden border border-base-300 rounded w-16 sm:w-12"
      style={{
        aspectRatio: `${aspectRatio}`,
        flexDirection: isRows || isFullbleed ? 'column' : 'row',
      }}
    >
      {normalizedStructure.map((section, sectionIndex) => {
        const sectionSize = section.size || 100 / normalizedStructure.length
        const sectionCells = sectionCellMap.get(sectionIndex) || []

        return (
          <div
            key={`section-${sectionIndex}`}
            className={`flex ${isRows || isFullbleed ? 'flex-row' : 'flex-col'}`}
            style={{ flex: `1 1 ${sectionSize}%` }}
          >
            {sectionCells.map(({ cellIndex: currentCellIndex, subSize }) => {
              const hasImage = !!cellImages[currentCellIndex]
              const isSelected = selectedCell === currentCellIndex

              let bgClass
              if (isSelected) {
                bgClass = 'bg-primary hover:bg-primary/80'
              } else if (hasImage) {
                bgClass = 'bg-primary/15 hover:bg-primary/20'
              } else {
                bgClass = 'bg-base-200 hover:bg-base-300'
              }

              return (
                <div
                  key={`cell-${currentCellIndex}`}
                  role="button"
                  tabIndex={0}
                  aria-label={`Cell ${currentCellIndex + 1}`}
                  className={`relative cursor-pointer transition-colors min-h-[10px] ${bgClass} flex items-center justify-center active:opacity-70`}
                  style={{ flex: `1 1 ${subSize}%` }}
                  onClick={() => onSelectCell(currentCellIndex)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelectCell(currentCellIndex) } }}
                  title={`Cell ${currentCellIndex + 1}`}
                >
                  <span className={`text-[9px] sm:text-[8px] font-medium leading-none ${isSelected ? 'text-primary-content' : hasImage ? 'text-primary' : 'text-base-content/50'}`}>
                    {currentCellIndex + 1}
                  </span>
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

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
          <CellGrid
            layout={layout}
            cellImages={cellImages}
            selectedCell={selectedCell}
            onSelectCell={onSelectCell}
            platform={platform}
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
